import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import {
  FulfillmentType,
  LocationType,
  SegmentType,
  ShippingScope,
} from '@prisma/client';
import { AppLogger } from '../../common/app-logger.service';
import { NotificationPublisher } from '../../common/notification-publisher';
import { RedisService } from '../../redis/redis.service';
import { MapsService } from '../maps/maps.service';
import { RouteOptimizerService } from '../maps/route-optimizer.service';
import { RouteSegmentHelperRepository } from './route-segment.helper.repo';
import { RouteCacheService } from '../maps/navigation.service';

type ShipmentScope = 'TOWN' | 'REGIONAL' | 'INTERNATIONAL';

interface NextDestination {
  lat: number;
  lon: number;
  type: LocationType;
  orderId?: string | null;
  segmentType: SegmentType;
  scope?: ShipmentScope;
  fulfillmentType?: FulfillmentType;
}

@Injectable()
export class RouteSegmentHelper {
  constructor(
    private readonly dispatchRepo: RouteSegmentHelperRepository,
    private readonly logger: AppLogger,
    private readonly redisService: RedisService,
    private readonly mapService: MapsService,
    private readonly optimizer: RouteOptimizerService,
    private readonly notificationPublisher: NotificationPublisher,
    private readonly routeCacheService: RouteCacheService,
  ) {}

  private async getDriverCurrentLocation(driverId: string) {
    const redisKey = `driver:${driverId}:location`;
    const hash = await this.redisService.getClient().hGetAll(redisKey);
    if (hash.lat && hash.lon)
      return { lat: parseFloat(hash.lat), lon: parseFloat(hash.lon) };
    const log = await this.dispatchRepo.findDriverLocation(driverId);
    return log ? { lat: log.latitude, lon: log.longitude } : null;
  }

  async proceedToNextSegment(
    driverId: string,
    // trigger: 'PICKED_UP' | 'DELIVERED' | 'DROPPED_OFF',
    // route: any,
    status: 'pending' | 'complete',
    orderId: string,
  ) {
    const currentLocation = await this.getDriverCurrentLocation(driverId);
    if (!currentLocation) throw new RpcException('Driver location unknown');

    let lastSegment: any;
    let currentType: LocationType = LocationType.DRIVER_LOCATION;
    // Complete last active segment (with optional orderId)
    if (status === 'complete') {
      lastSegment = await this.dispatchRepo.completeCurrentSegment(
        driverId,
        currentLocation,
        orderId,
      );
      currentType = lastSegment?.toType ?? LocationType.DRIVER_LOCATION;
      await this.routeCacheService.markStopVisited(driverId, orderId);
    }
    // Try cached route first
    let cachedRoute = await this.routeCacheService.getDriverRouteSegment(driverId);
    console.log('Cached route for segment ::  ', cachedRoute);

    if (!cachedRoute)
      cachedRoute = await this.computeAndCacheRoute(driverId, currentLocation);

    let next: NextDestination | null = null;

    if (cachedRoute?.stops?.length) {
      const nextStop = cachedRoute?.stops
        .filter((stop) => !stop.visited)
        .sort((a, b) => (a.seq ?? 0) - (b.seq ?? 0))[0]; // pick the one with lowest seq
      if (nextStop) {
        console.log('next stop will be :: ', nextStop);

        const orderMeta = await this.dispatchRepo.getOrderById(
          nextStop.orderId,
        );

        if (!orderMeta) throw new RpcException('Order not found');

        let pickupDone = false;
        // Determine stop type
        if (orderMeta.fulfillmentType === 'PICKUP') {
          pickupDone = orderMeta.routeSegments.some(
            (s) =>
              s.segmentType ===
                (SegmentType.TO_PICKUP ||
                  SegmentType.PICKUP_TO_PICKUP ||
                  SegmentType.BRANCH_TO_PICKUP ||
                  SegmentType.DELIVERY_TO_PICKUP) && s.endTime,
          );
        }
        console.log('is pickup done ::: ', pickupDone);

        const sameDriver =
          orderMeta.pickupDriverId === driverId &&
          orderMeta.deliveryDriverId === driverId;

        console.log('is the same driver ::: ', sameDriver);

        const branch =
          await this.dispatchRepo.getDefaultBranchForDriver(driverId);

        let toType: LocationType;

        if (pickupDone && orderMeta.shippingScope === 'TOWN' && sameDriver)
          toType = LocationType.DELIVERY_ADDRESS;
        if (pickupDone && orderMeta.shippingScope === 'TOWN' && !sameDriver)
          toType = LocationType.BRANCH;
        if (pickupDone && !(orderMeta.shippingScope === 'TOWN'))
          toType = LocationType.BRANCH;
        if (!pickupDone) toType = LocationType.PICKUP_ADDRESS;
        else if (sameDriver) toType = LocationType.DELIVERY_ADDRESS;
        else toType = LocationType.BRANCH;

        console.log('TO TYPE will become ::: ', toType);

        const segmentType = resolveSegmentType(
          currentType,
          toType,
          orderMeta.fulfillmentType,
          orderMeta.shippingScope,
        );
        console.log('AND SEGMENT TYPE WILL BECOME ::: ', segmentType);

        const lastSequence = orderMeta.routeSegments.length
          ? Math.max(...orderMeta.routeSegments.map((s) => s.sequence || 0))
          : 0;

        console.log('Last requence ::: ', lastSequence);

        const nextSequence = lastSequence + 1;
        console.log('next requence ::: ', nextSequence);

        const osrm = await this.mapService.getRoute(
          { lat: currentLocation.lat, lon: currentLocation.lon },
          { lat: nextStop.lat, lon: nextStop.lon },
        );
        console.log('OSRM result for fetching distance and time ::: ', osrm);

        next = {
          lat: nextStop.lat,
          lon: nextStop.lon,
          type: toType,
          orderId: orderMeta.id,
          segmentType,
        };

        console.log('FInal next stop become :: ', next);

        await this.dispatchRepo.upsertActiveSegment({
          driverId,
          orderId: orderMeta.id,
          fromLat: currentLocation.lat,
          fromLon: currentLocation.lon,
          fromType: currentType,
          toLat: nextStop.lat,
          toLon: nextStop.lon,
          toType,
          segmentType,
          estimatedDistanceKm: osrm.distance / 1000,
          estimatedDurationMin: Math.round(osrm.duration / 60),
          sequence: nextSequence,
          startNow: true,
        });

        // await this.routeCacheService.markStopVisited(driverId, orderMeta.id);
      }
    }

    // Fallback if no next from cache/optimizer
    if (!next) {
      next = await this.fallbackNextStop(
        driverId,
        currentLocation,
        currentType,
      );
    }

    // Notify driver
    if (next) {
      const title =
        next.segmentType === SegmentType.RETURN_TO_BRANCH
          ? 'Return to Branch'
          : 'Next Stop';
      const body = next.orderId
        ? `${next.segmentType.replace(/_/g, ' ')} → Order #${next.orderId.slice(-6)}`
        : 'Return to Branch';
      await this.notificationPublisher.publish(driverId, { title, body });
    }
  }

  private async computeAndCacheRoute(
    driverId: string,
    currentLocation: { lat: number; lon: number },
  ) {
    const pending =
      await this.dispatchRepo.getAllPendingOrdersForDriver(driverId);
    if (!pending?.length) return null;

    const branch = await this.dispatchRepo.getDefaultBranchForDriver(driverId);

    const stops = pending.map((o) => {
      if (!o.pickupConfirmed && o.fulfillmentType === 'PICKUP')
        return {
          orderId: o.id,
          lat: parseFloat(o.pickupAddress.lat),
          lon: parseFloat(o.pickupAddress.long),
          meta: o,
        };
      if (o.shippingScope !== 'TOWN')
        return { orderId: o.id, lat: branch.lat, lon: branch.lon, meta: o };
      return {
        orderId: o.id,
        lat: parseFloat(o.deliveryAddress.lat),
        lon: parseFloat(o.deliveryAddress.long),
        meta: o,
      };
    });

    const optimized = await this.optimizer.computeOptimizedRoute(
      driverId,
      currentLocation,
      stops,
    );

    const rc: any = {
      routeId: optimized.routeId,
      stops: optimized.stops.map((s: any) => ({ ...s, visited: false })),
      lastUpdated: Date.now(),
    };
    await this.routeCacheService.saveDriverRouteForSegment(driverId, rc);

    return rc;
  }

  private async fallbackNextStop(
    driverId: string,
    currentLocation: { lat: number; lon: number },
    currentType: LocationType,
  ): Promise<NextDestination> {
    let candidate = await this.tryFullOptimization(driverId, currentLocation);
    if (!candidate)
      candidate = await this.getSmartNextDestinationLevel2(
        driverId,
        currentLocation,
      );

    if (!candidate) {
      const branch =
        await this.dispatchRepo.getDefaultBranchForDriver(driverId);
      if (!branch) throw new RpcException('No branch configured for driver');

      candidate = {
        lat: branch.lat,
        lon: branch.lon,
        type: LocationType.BRANCH,
        orderId: null,
        segmentType: SegmentType.RETURN_TO_BRANCH,
        scope: 'TOWN',
      };
    } else {
      candidate.segmentType = resolveSegmentType(
        currentType,
        candidate.type,
        candidate.fulfillmentType ,
        candidate.scope,
      );
    }

    const osrm = await this.mapService.getRoute(
      { lat: currentLocation.lat, lon: currentLocation.lon },
      { lat: candidate.lat, lon: candidate.lon },
    );
    if (!osrm?.distance || !osrm?.duration)
      throw new RpcException('Failed to calculate route with OpenStreetMap');

    await this.dispatchRepo.upsertActiveSegment({
      driverId,
      orderId: candidate.orderId ?? null,
      fromLat: currentLocation.lat,
      fromLon: currentLocation.lon,
      fromType: currentType,
      toLat: candidate.lat,
      toLon: candidate.lon,
      toType: candidate.type,
      segmentType: candidate.segmentType,
      estimatedDistanceKm: osrm.distance / 1000,
      estimatedDurationMin: Math.round(osrm.duration / 60),
      sequence: 1,
      startNow: true,
    });

    return candidate;
  }

  async getDefaultBranchForDriver(driverId: string) {
    return await this.dispatchRepo.getDefaultBranchForDriver(driverId);
  }

  private async tryFullOptimization(
    driverId: string,
    currentLocation: { lat: number; lon: number },
  ): Promise<NextDestination | null> {
    const pending =
      await this.dispatchRepo.getAllPendingOrdersForDriver(driverId);
    if (pending.length < 3) return null;

    const branch = await this.dispatchRepo.getDefaultBranchForDriver(driverId);
    if (!branch) return null;

    const stops = pending.map((o) => {
      const scope = o.shippingScope;
      if (o.fulfillmentType === 'DROPOFF')
        return {
          orderId: o.id,
          lat: branch.lat,
          lon: branch.lon,
          scope,
          fulfillmentType: 'DROPOFF',
          pickupConfirmed: true,
        };
      if (!o.pickupConfirmed && o.pickupAddress?.lat && o.fulfillmentType === 'PICKUP')
        return {
          orderId: o.id,
          lat: parseFloat(o.pickupAddress!.lat!),
          lon: parseFloat(o.pickupAddress!.long!),
          scope,
          fulfillmentType: 'PICKUP',
          pickupConfirmed: false,
        };
      if (scope === 'TOWN')
        return {
          orderId: o.id,
          lat: parseFloat(o.deliveryAddress!.lat!),
          lon: parseFloat(o.deliveryAddress!.long!),
          scope,
          fulfillmentType: 'PICKUP',
          pickupConfirmed: true,
        };
      return {
        orderId: o.id,
        lat: branch.lat,
        lon: branch.lon,
        scope,
        fulfillmentType: 'PICKUP',
        pickupConfirmed: true,
      };
    });

    const optimized = await this.optimizer.computeOptimizedRoute(
      driverId,
      currentLocation,
      stops,
    );
    if (!optimized.stops?.length) return null;

    const nextStop = optimized.stops[0];
    const order = pending.find((o) => o.id === nextStop.orderId)!;

    let nextType: LocationType;
    if (
      order.fulfillmentType === 'DROPOFF' ||
      (!order.pickupConfirmed && order.fulfillmentType === 'PICKUP')
    )
      nextType =
        order.fulfillmentType === 'DROPOFF'
          ? LocationType.BRANCH
          : LocationType.PICKUP_ADDRESS;
    else
      nextType =
        order.shippingScope !== 'TOWN'
          ? LocationType.BRANCH
          : LocationType.DELIVERY_ADDRESS;

    return {
      lat: nextStop.lat,
      lon: nextStop.lon,
      type: nextType,
      orderId: nextStop.orderId,
      segmentType: resolveSegmentType(
        LocationType.DRIVER_LOCATION,
        nextType,
        order.fulfillmentType,
        order.shippingScope,
      ),
    };
  }

  private async getSmartNextDestinationLevel2(
    driverId: string,
    currentLocation: { lat: number; lon: number },
  ): Promise<NextDestination | null> {
    return this.getSmartNextDestinationLevel2Original(
      driverId,
      currentLocation,
    );
  }

  private async getSmartNextDestinationLevel2Original(
    driverId: string,
    currentLocation: { lat: number; lon: number },
  ): Promise<NextDestination | null> {
    const orders =
      await this.dispatchRepo.getOrderForSmartNextDestinationLevel2(driverId);
    let best: NextDestination | null = null;
    let bestDistance = Infinity;

    for (const order of orders) {
      const scope = order.shippingScope;
      if (!order.pickupConfirmed && order.pickupAddress?.lat) {
        const dist = await this.mapService.getDistance(currentLocation, {
          lat: parseFloat(order.pickupAddress.lat),
          lon: parseFloat(order.pickupAddress.long),
        });
        if (dist < bestDistance) {
          bestDistance = dist;
          best = {
            lat: parseFloat(order.pickupAddress.lat),
            lon: parseFloat(order.pickupAddress.long),
            type: LocationType.PICKUP_ADDRESS,
            orderId: order.id,
            scope,
            segmentType: resolveSegmentType(
              LocationType.DRIVER_LOCATION,
              LocationType.PICKUP_ADDRESS,
              order.fulfillmentType,
              scope,
            ),
          };
        }
        continue;
      }

      if (
        order.fulfillmentType === 'DROPOFF' &&
        order.deliveryDriverId === driverId && order.dropoffConfirmed
      ) {
        const dist = await this.mapService.getDistance(currentLocation, {
          lat: parseFloat(order.deliveryAddress.lat),
          lon: parseFloat(order.deliveryAddress.long),
        });
        if (dist < bestDistance) {
          bestDistance = dist;
          best = {
            lat: parseFloat(order.deliveryAddress.lat),
            lon: parseFloat(order.deliveryAddress.long),
            type: LocationType.DELIVERY_ADDRESS,
            orderId: order.id,
            scope,
            segmentType: resolveSegmentType(
              LocationType.DRIVER_LOCATION,
              LocationType.DELIVERY_ADDRESS,
              order.fulfillmentType,
              scope,
            ),
          };
        }
        continue;
      }

      if (order.pickupConfirmed) {
        if (scope !== 'TOWN') {
          const branch =
            await this.dispatchRepo.getDefaultBranchForDriver(driverId);
          if (!branch) continue;
          const dist = await this.mapService.getDistance(currentLocation, {
            lat: branch.lat,
            lon: branch.lon,
          });
          if (dist < bestDistance) {
            bestDistance = dist;
            best = {
              lat: branch.lat,
              lon: branch.lon,
              type: LocationType.BRANCH,
              orderId: order.id,
              scope,
              segmentType: resolveSegmentType(
                LocationType.DRIVER_LOCATION,
                LocationType.BRANCH,
                order.fulfillmentType,
                scope,
              ),
            };
          }
          continue;
        }
        if (order.deliveryAddress?.lat) {
          const dist = await this.mapService.getDistance(currentLocation, {
            lat: parseFloat(order.deliveryAddress.lat),
            lon: parseFloat(order.deliveryAddress.long),
          });
          if (dist < bestDistance * 1.1) {
            bestDistance = dist;
            best = {
              lat: parseFloat(order.deliveryAddress.lat),
              lon: parseFloat(order.deliveryAddress.long),
              type: LocationType.DELIVERY_ADDRESS,
              orderId: order.id,
              scope,
              segmentType: resolveSegmentType(
                LocationType.DRIVER_LOCATION,
                LocationType.DELIVERY_ADDRESS,
                order.fulfillmentType,
                scope,
              ),
            };
          }
        }
      }
    }
    return best;
  }
}

/* resolveSegmentType stays unchanged */
function resolveSegmentType(
  from: LocationType,
  to: LocationType,
  fulfillmentType: FulfillmentType,
  shippingScope: ShippingScope,
): SegmentType {
  const mustGoViaBranch =
    shippingScope === 'REGIONAL' || shippingScope === 'INTERNATIONAL';

  if (to === LocationType.BRANCH) {
    if (from === LocationType.PICKUP_ADDRESS)
      return SegmentType.PICKUP_TO_BRANCH;
    if (from === LocationType.DELIVERY_ADDRESS)
      return SegmentType.DELIVERY_TO_PICKUP;
    if (from === LocationType.BRANCH) return SegmentType.BRANCH_TO_BRANCH;
    if (from === LocationType.DRIVER_LOCATION)
      return SegmentType.RETURN_TO_BRANCH;
  }

  if (from === LocationType.DRIVER_LOCATION) {
    if (to === LocationType.PICKUP_ADDRESS) return SegmentType.TO_PICKUP;
    if (to === LocationType.DELIVERY_ADDRESS)
      return fulfillmentType === 'PICKUP' && mustGoViaBranch
        ? SegmentType.BRANCH_TO_DELIVERY
        : SegmentType.TO_PICKUP;
  }

  if (from === LocationType.PICKUP_ADDRESS) {
    if (to === LocationType.DELIVERY_ADDRESS)
      return fulfillmentType === 'PICKUP' && mustGoViaBranch
        ? SegmentType.PICKUP_TO_BRANCH
        : SegmentType.PICKUP_TO_DELIVERY;
    if (to === LocationType.PICKUP_ADDRESS) return SegmentType.PICKUP_TO_PICKUP;
    if (to === LocationType.BRANCH) return SegmentType.PICKUP_TO_BRANCH;
  }

  if (from === LocationType.BRANCH) {
    if (to === LocationType.DELIVERY_ADDRESS)
      return SegmentType.BRANCH_TO_DELIVERY;
    if (to === LocationType.PICKUP_ADDRESS) return SegmentType.BRANCH_TO_PICKUP;
    if (to === LocationType.BRANCH) return SegmentType.BRANCH_TO_BRANCH;
  }

  if (from === LocationType.DELIVERY_ADDRESS) {
    if (to === LocationType.DELIVERY_ADDRESS)
      return SegmentType.DELIVERY_TO_DELIVERY;
    if (to === LocationType.PICKUP_ADDRESS)
      return SegmentType.DELIVERY_TO_PICKUP;
    if (to === LocationType.BRANCH) return SegmentType.RETURN_TO_BRANCH;
  }

  return SegmentType.IDLE_WAITING;
}
