import { MapLocationGateway } from '../../websocket/gateways/map-location.gateway'; //temporary fix
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
    eta?: number; // minutes (estimated by Haversine)
    distanceKm?: number; // distance from driver/current position to this stop
  }[];
  totalDistance: number; // meters
  totalDuration: number; // seconds
  remainingDistance?: number; // km
  remainingDurationSec?: number; // seconds
  estimatedArrivalTime?: string;
  lastUpdated: number;
  orderedStopIds?: string[]; // helpful for quick ordering
  originalOptimizedOrder?: string[]; // preserved order (copied from optimizer)
}

@Injectable()
export class RouteCacheService {
  private readonly logger = new Logger(RouteCacheService.name);

  constructor(
    @Inject(forwardRef(() => MapLocationGateway)) //temporary fix
    private readonly wsGateway: MapLocationGateway,
    private readonly mapRepo: MapsRepository,
    private readonly redisClient: RedisService,
    private readonly routeOptimizer: RouteOptimizerService,
    private readonly mapsService: MapsService,
  ) {}

  /**
   * Save/update route in Redis AND set routeFinish timestamp.
   *
   * Key details:
   * - Primary Redis key is `driver:{driverId}:currentRoute`
   * - Route finish timestamp key: `driver:{driverId}:routeFinish` (ISO string)
   *
   * route.totalDuration is seconds (from ORS). If missing, we approximate using
   * remainingDistance and expected average speed (default 40 km/h) to set routeFinish.
   */
  async saveDriverRoute(driverId: string, route: RouteCache) {
    const key = `driver:${driverId}:currentRoute`;

    // compute remaining duration (seconds)
    let remainingDurationSec = route.totalDuration ?? 0;
    if (!remainingDurationSec || remainingDurationSec <= 0) {
      // approximate from remainingDistance using default speed if duration missing
      const remainingKm =
        route.remainingDistance ??
        route.stops.reduce((acc, s) => acc + (s.distanceKm ?? 0), 0);
      const speedKmh = 40; // conservative default
      remainingDurationSec = Math.round((remainingKm / speedKmh) * 3600);
    }
    route.remainingDurationSec = remainingDurationSec;

    // set routeFinish timestamp = now + remainingDurationSec
    const routeFinishMs = Date.now() + remainingDurationSec * 1000;
    const routeFinishISO = new Date(routeFinishMs).toISOString();

    // Persist route object and routeFinish
    await this.redisClient.set(key, JSON.stringify(route), { EX: 3600 });
    await this.redisClient.set(
      `driver:${driverId}:routeFinish`,
      routeFinishISO,
      { EX: 3600 },
    );

    this.logger.debug(
      `Saved route for driver ${driverId} in Redis (finish: ${routeFinishISO})`,
    );

    // Broadcast via WebSocket (route object sent to subscribers)
    this.wsGateway.broadcastDriverRoute(driverId, route); //temporary fix
  }

  async deleteDriverRoute(driverId: string): Promise<void> {
    await this.redisClient.del(`driver:${driverId}:currentRoute`);
    await this.redisClient.del(`driver:${driverId}:routeFinish`);
  }

  async getDriverRoute(driverId: string): Promise<RouteCache | null> {
    const key = `driver:${driverId}:currentRoute`;
    const data = (await this.redisClient.get(key)) as string | null;
    if (!data) return null;
    try {
      return JSON.parse(data) as RouteCache;
    } catch (err) {
      this.logger.error(
        `Failed to parse driver route for ${driverId}: ${(err as Error).message}`,
      );
      return null;
    }
  }

  async getDriverRouteWithStops(
    driverId: string,
    reportedStops?: { orderId: string }[],
  ): Promise<RouteCache | null> {
    const key = `driver:${driverId}:currentRoute`;
    const data = (await this.redisClient.get(key)) as string | null;
    if (!data) return null;

    try {
      const route = JSON.parse(data) as RouteCache;

      // If reportedStops is provided, filter route.stops to only those reported (useful on partial queries)
      if (reportedStops && reportedStops.length > 0) {
        const reportedIds = new Set(reportedStops.map((r) => r.orderId));
        route.stops = route.stops.filter((stop) =>
          reportedIds.has(stop.orderId),
        );
      }

      return route;
    } catch (err) {
      this.logger.error(
        `Failed to parse route for driver ${driverId}: ${(err as Error).message}`,
      );
      return null;
    }
  }

  async removeDriverRoute(driverId: string) {
    await this.redisClient.del(`driver:${driverId}:currentRoute`);
    await this.redisClient.del(`driver:${driverId}:routeFinish`);
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
   * Called whenever the driver’s GPS updates.
   *
   * Improvements applied:
   * - Use Haversine distances and reported speed to compute ETA for the next stop
   * - Do NOT call ORS per-stop; this avoids explosion of external API calls
   * - Update route.stops distanceKm and eta using local estimate
   * - Update route.remainingDistance and remainingDuration using local sums
   * - Only call routeOptimizer.recalculateRouteIfDeviation when deviation criteria are met
   */
  async updateLiveRouteProgress(
    driverId: string,
    lat: number,
    lon: number,
    speedKmh?: number,
  ) {
    const route = await this.getDriverRoute(driverId);
    if (!route) return;

    // Remaining stops in preserved sequence
    const remainingStops = route.stops.filter((s) => !s.visited);
    if (!remainingStops || remainingStops.length === 0) {
      return;
    }

    // Use reported speed or default speed (conservative)
    const speed = speedKmh && speedKmh > 5 ? speedKmh : 40; // km/h

    // Compute distance & ETA to the next stop (fast)
    const nextStop = remainingStops[0];
    const distanceToNextKm = this.calculateDistanceKm(
      lat,
      lon,
      nextStop.lat,
      nextStop.lon,
    );
    const etaToNextMin = (distanceToNextKm / speed) * 60;

    // Update next stop info
    nextStop.distanceKm = Number(distanceToNextKm.toFixed(3));
    nextStop.eta = Number(etaToNextMin.toFixed(1));

    // For subsequent stops: estimate sequentially using Haversine distances between stops
    let cumulativeRemainingKm = distanceToNextKm;
    for (let i = 0; i < remainingStops.length - 1; i++) {
      const cur = remainingStops[i];
      const nxt = remainingStops[i + 1];
      const dkm = this.calculateDistanceKm(cur.lat, cur.lon, nxt.lat, nxt.lon);
      // store distance from this stop to next (optional)
      cur.distanceKm = Number((cur.distanceKm ?? 0).toFixed(3));
      nxt.distanceKm = nxt.distanceKm ?? Number(dkm.toFixed(3));
      cumulativeRemainingKm += dkm;
    }

    route.remainingDistance = cumulativeRemainingKm;
    route.lastUpdated = Date.now();

    // approximate remaining duration (seconds) using speed
    route.remainingDurationSec = Math.round(
      (cumulativeRemainingKm / speed) * 3600,
    );

    // set estimatedArrivalTime for the next stop
    route.estimatedArrivalTime = new Date(
      Date.now() + Math.round(etaToNextMin * 60000),
    ).toISOString();

    // Persist route + routeFinish so nearby logic can read accurate finish time
    await this.saveDriverRoute(driverId, route);

    // Notify subscribed customers about next stop ETA (cheap) //temporary fix
    this.wsGateway.emitNextStopEta(driverId, nextStop, {
      lat,
      lon,
      speedKmh: speed,
    });

    // Deviation check: delegate to optimizer, but only when necessary
    // We decide deviation by checking distanceToNextKm (meters)
    const deviationThresholdMeters = 300;
    if (distanceToNextKm * 1000 > deviationThresholdMeters) {
      // Recalculate route if deviation is significant
      const { route: recalculatedRoute, recalculated } =
        await this.routeOptimizer.recalculateRouteIfDeviation(
          driverId,
          { lat, lon },
          {
            ...route,
            // ensure originalOptimizedOrder is passed if present
            originalOptimizedOrder:
              route.originalOptimizedOrder ?? route.orderedStopIds,
          } as any,
          deviationThresholdMeters,
        );

      if (recalculated && recalculatedRoute) {
        // Convert optimized Route to RouteCache structure and save
        const rc: RouteCache = {
          optimizationJobId: (recalculatedRoute as any).routeId ?? '',
          routeId: (recalculatedRoute as any).routeId ?? '',
          stops: (recalculatedRoute.stops || []).map((s: any) => ({
            orderId: s.orderId,
            lat: s.lat,
            lon: s.lon,
            seq: s.seq,
            visited: false,
            eta: undefined,
            distanceKm: undefined,
          })),
          totalDistance: recalculatedRoute.distanceMeters ?? 0,
          totalDuration: recalculatedRoute.durationSec ?? 0,
          remainingDistance: undefined,
          remainingDurationSec: recalculatedRoute.durationSec ?? 0,
          estimatedArrivalTime: undefined,
          lastUpdated: Date.now(),
          orderedStopIds: recalculatedRoute.orderedStopIds,
          originalOptimizedOrder:
            recalculatedRoute.originalOptimizedOrder ??
            recalculatedRoute.orderedStopIds,
        };

        // Save recalculated route (this will set routeFinish accordingly)
        await this.saveDriverRoute(driverId, rc);

        // Broadcast recalculated route to driver and customers //temporary fix
        this.wsGateway.broadcastDriverRoute(driverId, rc);
        this.wsGateway.broadcastDriverLocationToDriver('route:recalculated', {
          driverId,
          recalculatedRoute: rc,
        });
      }
    } else {
      // No significant deviation; just broadcast ETA update
      const etaData = {
        driverId,
        nextStopId: nextStop.orderId,
        etaSeconds: Math.round(etaToNextMin * 60),
        remainingDistanceMeters: Math.round(cumulativeRemainingKm * 1000),
        recalculated: false,
      };
      this.wsGateway.broadcastDriverLocationToDriver(driverId, etaData); //temporary fix
      this.wsGateway.broadcastETAtoCustomer(etaData);
    }

    return {
      nextStop: {
        orderId: nextStop.orderId,
        distanceKm: nextStop.distanceKm,
        etaMin: nextStop.eta,
      },
    };
  }

  /**
   * updateLiveRouteETA previously used ORS for every stop; we replaced that with safe,
   * single recalculation calls and local Haversine estimates when recalculation isn't required.
   *
   * Keep the function here for backward compatibility, but it will only be used when you
   * want to force a recalculation (not during normal GPS ticks).
   */
  async updateLiveRouteETA(
    driverId: string,
    route: RouteCache,
    location: { lat: number; lon: number },
  ) {
    try {
      // Use single recalculation check — heavy ORS calls are triggered only by recalculation
      const { route: recalculatedRoute, recalculated } =
        await this.routeOptimizer.recalculateRouteIfDeviation(
          driverId,
          location,
          route,
          300,
        );

      if (recalculated && recalculatedRoute) {
        // Save recalculated route as above
        const rc: RouteCache = {
          optimizationJobId: (recalculatedRoute as any).routeId ?? '',
          routeId: (recalculatedRoute as any).routeId ?? '',
          stops: (recalculatedRoute.stops || []).map((s: any) => ({
            orderId: s.orderId,
            lat: s.lat,
            lon: s.lon,
            seq: s.seq,
            visited: false,
            eta: undefined,
            distanceKm: undefined,
          })),
          totalDistance: recalculatedRoute.distanceMeters ?? 0,
          totalDuration: recalculatedRoute.durationSec ?? 0,
          remainingDistance: undefined,
          remainingDurationSec: recalculatedRoute.durationSec ?? 0,
          estimatedArrivalTime: undefined,
          lastUpdated: Date.now(),
          orderedStopIds: recalculatedRoute.orderedStopIds,
          originalOptimizedOrder:
            recalculatedRoute.originalOptimizedOrder ??
            recalculatedRoute.orderedStopIds,
        };

        await this.saveDriverRoute(driverId, rc);
        this.wsGateway.broadcastDriverRoute(driverId, rc); //temporary fix
      }
    } catch (err) {
      this.logger.error(
        `Failed to update ETA for driver ${driverId}: ${(err as Error).message}`,
      );
    }
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

      // 4️⃣ Broadcast completion //temporary fix
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
}
