import { MapLocationGateway } from '../../websocket/gateways/map-location.gateway';
import { RedisService } from '../../redis/redis.service';
import { MapsRepository } from './maps.repository';
import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { RouteOptimizerService } from './route-optimizer.service';
import { MapsService } from './maps.service';

interface RouteCache {
  optimizationJobId: string;
  routeId: string;
  stops: {
    orderId: string;
    lat: number;
    lon: number;
    seq?: number;
    visited: boolean;
    eta?: number; // minutes
    distanceKm?: number; // to next stop
  }[];
  totalDistance: number;
  totalDuration: number;
  remainingDistance?: number;
  estimatedArrivalTime?: string;
  lastUpdated: number;
}

@Injectable()
export class RouteCacheService {
  private readonly logger = new Logger(RouteCacheService.name);

  constructor(
    @Inject(forwardRef(() => MapLocationGateway))
    private readonly wsGateway: MapLocationGateway,
    private readonly mapRepo: MapsRepository,
    private readonly redisClient: RedisService,
    private readonly routeOptimizer: RouteOptimizerService,
    private readonly mapsService: MapsService,
  ) {}

  /** Save/update route in Redis */
  async saveDriverRoute(driverId: string, route: RouteCache) {
    const key = `driver:${driverId}:currentRoute`;
    await this.redisClient.set(key, JSON.stringify(route), { EX: 3600 });
    this.logger.debug(`Saved route for driver ${driverId} in Redis`);

    const data = (await this.redisClient.get(key)) as string | null;
    console.log('get route after saved ::: ', data, key);

    // Broadcast via WebSocket
    this.wsGateway.broadcastDriverRoute(driverId, route);
  }

  async deleteDriverRoute(driverId: string): Promise<void> {
    const key = `driver:${driverId}:currentRoute`;
    await this.redisClient.del(key);
  }

  /** Mark a stop as visited */
  async markStopVisited(driverId: string, orderId: string) {
    const route = await this.getDriverRoute(driverId);
    if (!route) return;

    route.stops = route.stops.map((s) =>
      s.orderId === orderId ? { ...s, visited: true } : s,
    );
    route.lastUpdated = Date.now();

    await this.saveDriverRoute(driverId, route);

    // Check if all stops are visited
    const allVisited = route.stops.every((s) => s.visited);
    if (allVisited) {
      await this.completeRoute(driverId, route);
    }
  }

  /** Mark route as completed: persist to DB and remove from Redis */
  private async completeRoute(driverId: string, route: RouteCache) {
    try {
      for (let i = 0; i < route.stops.length - 1; i++) {
        const originStop = route.stops[i];
        const destStop = route.stops[i + 1];

        // 1️⃣ Get Locations from coordinates
        const originLoc = await this.mapRepo.upsertLocationFromCoords({
          latitude: originStop.lat,
          longitude: originStop.lon,
          mapServiceResult: { name: originStop.orderId },
        });
        const destLoc = await this.mapRepo.upsertLocationFromCoords({
          latitude: destStop.lat,
          longitude: destStop.lon,
          mapServiceResult: { name: destStop.orderId },
        });

        // 2️⃣ Find and update route
        const dbRoute = await this.mapRepo.findRouteByOriginDest(
          originLoc.id,
          destLoc.id,
        );

        if (dbRoute) {
          await this.mapRepo.updateRoute(dbRoute.id, {
            distanceKm: originStop.distanceKm || 0,
            durationMin: originStop.eta || 0,
            completed: true,
          });
        }
      }

      // 3️⃣ Remove from Redis
      await this.removeDriverRoute(driverId);

      // 4️⃣ Broadcast completion
      this.wsGateway.broadcastDriverRouteCompletion(
        driverId,
        route.optimizationJobId,
      );

      this.logger.debug(`Route completed for driver ${driverId}`);
    } catch (err) {
      this.logger.error(
        `Failed to complete route for driver ${driverId}: ${err}`,
      );
    }
  }

  async getDriverRoute(driverId: string): Promise<RouteCache | null> {
    const key = `driver:${driverId}:currentRoute`;
    const data = (await this.redisClient.get(key)) as string | null;
    console.log('get route ::: ', data, key);

    if (!data) return null;

    try {
      return JSON.parse(data) as RouteCache;
    } catch {
      return null;
    }
  }

  async getDriverRouteWithStops(
    driverId: string,
    reportedStops?: { orderId: string }[],
  ): Promise<RouteCache | null> {
    const key = `driver:${driverId}:currentRoute`;
    console.log("keyyyyyyyyyyyyy ::: ", key);
    
    const data = await this.redisClient.gets(key);

    console.log('Second iiiiiiiii  ::: ', data);

    if (!data) return null;

    try {
      const route = JSON.parse(data) as RouteCache;
      console.log('third iiiiiiiii  ::: ', route);

      // ✅ If reportedStops is provided, filter only matching stops
      if (reportedStops && reportedStops.length > 0) {
        const reportedIds = new Set(reportedStops.map((r) => r.orderId));
        console.log('fourth iiiiiiiii  ::: ', reportedIds);
        route.stops = route.stops.filter((stop) =>
          reportedIds.has(stop.orderId),
        );
      }
      console.log('fith iiiiiiiii  ::: ', route);

      return route;
    } catch (err) {
      console.error(`Failed to parse route for driver ${driverId}:`, err);
      return null;
    }
  }

  async removeDriverRoute(driverId: string) {
    await this.redisClient.del(`driver:${driverId}:currentRoute`);
    this.logger.debug(`Removed route for driver ${driverId} from Redis`);
  }

  private calculateDistanceKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * 🔁 Called whenever the driver’s GPS updates.
   * Updates ETA, distance, and checks for route deviation.
   */
  /** Called whenever driver location updates */
  async updateLiveRouteProgress(
    driverId: string,
    lat: number,
    lon: number,
    speedKmh?: number,
  ) {
    const route = await this.getDriverRoute(driverId);
    console.log('Route fro deviattion ::::: ', route);

    if (!route) return;

    // const nextStop = route.stops.find((s) => !s.visited);
    // console.log('Next stop fro deviattion ::::: ', nextStop);

    // if (!nextStop) return;
    const remainingStops = route.stops.filter((s) => !s.visited);
    if (!remainingStops) return;

    // const distance = this.calculateDistanceKm(
    //   lat,
    //   lon,
    //   nextStop.lat,
    //   nextStop.lon,
    // );

    // const speed = speedKmh && speedKmh > 0 ? speedKmh : 40;
    // const eta = (distance / speed) * 60;
    // nextStop.distanceKm = Number(distance.toFixed(2));
    // nextStop.eta = Number(eta.toFixed(1));
    // route.remainingDistance = distance;
    // route.estimatedArrivalTime = new Date(
    //   Date.now() + eta * 60 * 1000,
    // ).toISOString();

    // await this.saveDriverRoute(driverId, route);

    // console.log(
    //   'Data to be subscibed to customer next stop ::::::::::::::::::::::::::::::::::::::::',
    //   nextStop,
    // );
    // console.log(
    //   'Data to be subscibed to customer driver Id ::::::::::::::::::::::::::::::::::::::::',
    //   driverId,
    // );
    // console.log(
    //   'Data to be subscibed to customer lat, long, speed ::::::::::::::::::::::::::::::::::::::::',
    //   lat,
    //   lon,
    //   speed,
    // );

    for (const stop of remainingStops) {
      const distance = this.calculateDistanceKm(lat, lon, stop.lat, stop.lon);
      const speed = speedKmh && speedKmh > 0 ? speedKmh : 40;
      const eta = (distance / speed) * 60;

      stop.distanceKm = Number(distance.toFixed(2));
      stop.eta = Number(eta.toFixed(1));
    }

    // Update Redis with all remaining stops
    route.remainingDistance = remainingStops.reduce(
      (acc, s) => acc + (s.distanceKm || 0),
      0,
    );
    await this.saveDriverRoute(driverId, route);

    // Notify all customers subscribed for each stop
    for (const stop of remainingStops) {
      this.wsGateway.emitNextStopEta(driverId, stop, {
        lat,
        lon,
        speedKmh: speedKmh || 40,
      });
    }
    // // Notify subscribed clients
    // this.wsGateway.emitNextStopEta(driverId, nextStop, {
    //   lat,
    //   lon,
    //   speedKmh: speed,
    // });

    // Check deviation
    const result = await this.updateLiveRouteETA(driverId, route, { lat, lon });
    console.log('REsult result finallllllllllllllll:::', result);
    return result;
  }

  async updateLiveRouteETA(
    driverId: string,
    route: RouteCache,
    location: { lat: number; lon: number },
  ) {
    try {
      const { route: recalculatedRoute, recalculated } =
        await this.routeOptimizer.recalculateRouteIfDeviation(
          driverId,
          location,
          route,
        );

      if (recalculated && recalculatedRoute) {
        console.log(
          'ROute is recalculated :::: ',
          recalculated,
          recalculatedRoute,
        );

        await this.saveDriverRoute(driverId, recalculatedRoute);
        this.wsGateway.broadcastDriverRoute(driverId, recalculatedRoute);
        this.wsGateway.broadcastDriverLocationToDriver('route:recalculated', {
          driverId,
          recalculatedRoute,
        });
      }

      // const nextStop = recalculatedRoute?.stops?.find((s) => !s.visited);
      // console.log('Next stop newwwwwwwwwwwww ::', nextStop);

      // if (!nextStop) return;

      // const { distance, duration } =
      //   await this.mapsService.getDirectionsOrdered([
      //     { lat: location.lat, lon: location.lon },
      //     { lat: nextStop.lat, lon: nextStop.lon },
      //   ]);

      // const etaData = {
      //   driverId,
      //   nextStopId: nextStop.orderId,
      //   etaSeconds: duration,
      //   remainingDistance: distance,
      //   recalculated,
      // };

      // console.log('ETA data for finalllllllllllllll newwwwwwwww ::::', etaData);

      // this.wsGateway.broadcastDriverLocationToDriver(driverId, etaData);
      // this.wsGateway.broadcastETAtoCustomer(etaData);

      const remainingStops = recalculatedRoute.stops.filter((s) => !s.visited);

      for (const stop of remainingStops) {
        const { distance, duration } =
          await this.mapsService.getDirectionsOrdered([
            { lat: location.lat, lon: location.lon },
            { lat: stop.lat, lon: stop.lon },
          ]);

        const etaData = {
          driverId,
          nextStopId: stop.orderId,
          etaSeconds: duration,
          remainingDistance: distance,
          recalculated,
        };

        this.wsGateway.broadcastDriverLocationToDriver(driverId, etaData);
        this.wsGateway.broadcastETAtoCustomer(etaData);
        this.logger.debug(
          `Updated ETA for driver ${driverId}: ${(duration / 60).toFixed(1)} min, ${Math.round(distance)} m`,
        );
      }
    } catch (err) {
      this.logger.error(
        `Failed to update ETA for driver ${driverId}: ${(err as Error).message}`,
      );
    }
  }
}
