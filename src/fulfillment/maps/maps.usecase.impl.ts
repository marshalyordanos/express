import { RpcException } from '@nestjs/microservices';
import { MapsUseCases } from './maps.usecase';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ListQueryDto } from '../../common/query/query.dto';
import { MapsRepository } from './maps.repository';
import { RouteOptimizerService } from './route-optimizer.service';
import { MapsService } from './maps.service';
import { RouteCacheService } from './navigation.service';

@Injectable()
export class MapsUseCasesImpl implements MapsUseCases {
  constructor(
    private readonly mapRepo: MapsRepository,
    @Inject(forwardRef(() => RouteOptimizerService))
    private readonly routeOptimizerService: RouteOptimizerService,
    private readonly mapService: MapsService,
    private readonly routeCacheService: RouteCacheService,
  ) {}
  async createDriver(body: any): Promise<any> {
    const user = await this.mapRepo.findUserById(body.userId);
    if (!user) {
      throw new RpcException({
        statusCode: 404,
        message: 'User Not found. We can not create driver.',
      });
    }

    return this.mapRepo.createDriver(body);
  }
  async createDriverLocation(body: any): Promise<any> {
    throw new Error('Method not implemented.');
  }
  async getDrivers(query: ListQueryDto): Promise<any> {
    throw new Error('Method not implemented.');
  }
  async getDriverById(id: string): Promise<any> {
    throw new Error('Method not implemented.');
  }

  async getRoute(driverId: string) {
    let route: any = null;
    // 1️⃣ Fetch driver and assigned orders
    const driver = await this.mapRepo.findDriverById(driverId);
    if (!driver) throw new Error('Driver not found');

    const orders = await this.mapRepo.findOrdersByDriverId(driverId);
    if (!orders.length) return null;

    const driverLocation = { lat: driver.lat, lon: driver.lon };

    // 2️⃣ Prepare stops for optimization
    const stops = orders.map((o) => ({
      orderId: o.orderId,
      lat: o.lat,
      lon: o.lon,
    }));

    // 3️⃣ Compute optimized route
    const optimizedRoute =
      await this.routeOptimizerService.computeOptimizedRoute(
        driverId,
        driverLocation,
        stops,
      );

    // 4️⃣ Save OptimizationJob in DB
    const optimizationJob = await this.mapRepo.createOptimizationJob({
      driverId: driver.id,
      jobCode: `JOB-${Date.now()}`,
      type: 'MULTI_STOP',
      status: 'PENDING', // not completed yet
      optimizedOrder: optimizedRoute.stops,
      totalDistance: optimizedRoute.distanceMeters,
      totalDuration: optimizedRoute.durationSec / 60,
    });

    // 5️⃣ Save initial route segments in DB (optional) but mark as pending
    for (let i = 0; i < optimizedRoute.stops.length - 1; i++) {
      const origin = optimizedRoute.stops[i];
      const destination = optimizedRoute.stops[i + 1];

      const originLoc = await this.mapRepo.upsertLocationFromCoords({
        latitude: Number(origin.lat),
        longitude: Number(origin.lon),
        mapServiceResult: origin.mapServiceResult, // optional
      });

      const destinationLoc = await this.mapRepo.upsertLocationFromCoords({
        latitude: Number(destination.lat),
        longitude: Number(destination.lon),
        mapServiceResult: destination.mapServiceResult,
      });

      route = await this.mapRepo.createRoute({
        originId: originLoc.id,
        destinationId: destinationLoc.id,
        distanceKm: optimizedRoute.segments[i]?.distance / 1000 || 0,
        durationMin: optimizedRoute.segments[i]?.duration / 60 || 0,
        routePath: optimizedRoute.segments,
        optimized: true,
        trafficAware: false,
        optimizationJobId: optimizationJob.id,
      });
    }

    // 6️⃣ Store the route in Redis and broadcast via WebSocket
    await this.routeCacheService.saveDriverRoute(driverId, {
      optimizationJobId: optimizationJob.id,
      routeId: route.id,
      stops: optimizedRoute.stops.map((s) => ({ ...s, visited: false })),
      totalDistance: optimizedRoute.distanceMeters,
      totalDuration: optimizedRoute.durationSec,
      lastUpdated: Date.now(),
    });

    return {
      optimizationJobId: optimizationJob.id,
      route: optimizedRoute,
    };
  }

  async markStopVisited(driverId: string, orderId: string) {
    if (!orderId) {
      throw new RpcException('orderId is required');
    }
    // 1️⃣ Get the route from Redis
    const route = await this.routeCacheService.getDriverRoute(driverId);
    if (!route) throw new RpcException('No route found for driver');

    // 2️⃣ Mark the stop as visited
    route.stops = route.stops.map((s) =>
      s.orderId === orderId ? { ...s, visited: true } : s,
    );

    // 3️⃣ Save back to Redis
    await this.routeCacheService.saveDriverRoute(driverId, route);

    // 4️⃣ Check if all stops visited
    const allVisited = route.stops.every((s) => s.visited);

    if (allVisited) {
      // 5️⃣ Mark route completed in DB
      await this.mapRepo.updateOptimizationJobStatus(
        route.optimizationJobId,
        'COMPLETED',
      );

      // 6️⃣ Optionally, broadcast completion via WebSocket
      // this.wsEvent.emit('route:completed', { driverId, routeId: route.routeId });

      // 7️⃣ Remove it from Redis
      await this.routeCacheService.deleteDriverRoute(driverId);

      return { message: 'All stops visited. Route completed.' };
    }

    return { message: `Stop ${orderId} marked as visited.` };
  }

  async getRouteStatus(driverId: string): Promise<any> {
    try {
      const route = await this.routeCacheService.getDriverRoute(driverId);
      if (!route) return { status: 'no_route', route: null };
      return { status: 'ok', route };
    } catch (err) {
      throw new RpcException(err.message);
    }
  }
}
