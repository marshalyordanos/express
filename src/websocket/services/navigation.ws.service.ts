import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { RouteCacheService } from '../../fulfillment/maps/navigation.service';
import { RouteOptimizerService } from '../../fulfillment/maps/route-optimizer.service';
import { WebSocketEventService } from './websocket-event.service';
import { Route } from '@prisma/client';
import { RouteCache } from '../../fulfillment/maps/maps.entity';

type RouteLike = Partial<Route> & { stops: any[]; geometry?: any };

@Injectable()
export class NavigationWsService {
  private readonly logger = new Logger(NavigationWsService.name);

  constructor(
    @Inject(forwardRef(() => RouteCacheService))
    private readonly routeCacheService: RouteCacheService,
    @Inject(forwardRef(() => RouteOptimizerService))
    private readonly routeOptimizerService: RouteOptimizerService,
    @Inject(forwardRef(() => WebSocketEventService))
    private readonly wsEvent: WebSocketEventService,
  ) {}

  /**
   * Update driver's current navigation route.
   * Called by WebSocket when driver moves or reaches stop
   */
 async updateDriverNavigation(
  driverId: string,
  currentLocation: { lat: number; lon: number },
  reportedStops: any[],
) {
  // 1️⃣ Get cached route
  const cachedRoute = await this.routeCacheService.getDriverRoute(driverId);
  console.log("Cached Routes : ", cachedRoute);


  if (!cachedRoute) {
    const result= await this.routeOptimizerService.computeOptimizedRoute(driverId, currentLocation, reportedStops);
    console.log("ROute on webservice ::::", result);
    
    this.logger.warn(`No cached route found for driver ${driverId}`);
    return result;
  }

  
  // 2️⃣ Update stops based on report
  const updatedStops = cachedRoute.stops.map((stop) => {
    const reportedStop = reportedStops.find((r) => r.orderId === stop.orderId);
    return reportedStop
      ? { ...stop, visited: reportedStop.visited ?? stop.visited }
      : stop;
  });

  console.log("Updated stops : ", updatedStops);
  
  // 3️⃣ Prepare updated route
  const updatedRoute: RouteCache = {
    ...cachedRoute,
    stops: updatedStops,
    lastUpdated: Date.now(),
    optimizationJobId: cachedRoute.optimizationJobId ?? 'unknown',
    totalDistance: cachedRoute.totalDistance ?? 0,
    totalDuration: cachedRoute.totalDuration ?? 0,
  };

  console.log("Updated Route : ", updatedRoute);
  
  // 4️⃣ Save updated route
  await this.routeCacheService.saveDriverRoute(driverId, updatedRoute);

  // 5️⃣ Mark visited stops
  for (const stop of updatedStops) {
    if (stop.visited) {
      await this.routeCacheService.markStopVisited(driverId, stop.orderId);
    }
  }

  // 6️⃣ Recalculate route if deviation
  const { route: recalculatedRoute, recalculated } =
    await this.routeOptimizerService.recalculateRouteIfDeviation(
      driverId,
      currentLocation,
      updatedRoute,
    );

  if (recalculated && recalculatedRoute) {
    this.logger.log(`Route recalculated for driver ${driverId}`);

    const finalRoute: RouteCache = {
      ...updatedRoute,
      routeId: recalculatedRoute.routeId,
      totalDistance: recalculatedRoute.distanceMeters ?? updatedRoute.totalDistance,
      totalDuration: recalculatedRoute.durationSec ?? updatedRoute.totalDuration,
      lastUpdated: Date.now(),
    };

    console.log("Final Route : ", finalRoute);
    

    await this.routeCacheService.saveDriverRoute(driverId, finalRoute);

    // Broadcast new route to driver
    this.wsEvent.emitDriverNavigationToDriver(driverId, finalRoute);
  }

  console.log("Final Updated Route : ");
  
  return updatedRoute;
}

  async updateLiveRouteETA(
    driverId: string,
    lat: number,
    lon: number,
    speed?: number,
  ) {
    await this.routeCacheService.updateLiveRouteProgress(
      driverId,
      lat,
      lon,
      speed,
    );
  }
}