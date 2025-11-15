import { MapLocationGateway } from '../../websocket/gateways/map-location.gateway';
import { RedisService } from '../../redis/redis.service';
import { MapsRepository } from './maps.repository';
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
        eta?: number;
        distanceKm?: number;
    }[];
    totalDistance: number;
    totalDuration: number;
    remainingDistance?: number;
    remainingDurationSec?: number;
    estimatedArrivalTime?: string;
    lastUpdated: number;
    orderedStopIds?: string[];
    originalOptimizedOrder?: string[];
}
export declare class RouteCacheService {
    private readonly wsGateway;
    private readonly mapRepo;
    private readonly redisClient;
    private readonly routeOptimizer;
    private readonly mapsService;
    private readonly logger;
    constructor(wsGateway: MapLocationGateway, mapRepo: MapsRepository, redisClient: RedisService, routeOptimizer: RouteOptimizerService, mapsService: MapsService);
    saveDriverRoute(driverId: string, route: RouteCache): Promise<void>;
    deleteDriverRoute(driverId: string): Promise<void>;
    getDriverRoute(driverId: string): Promise<RouteCache | null>;
    getDriverRouteWithStops(driverId: string, reportedStops?: {
        orderId: string;
    }[]): Promise<RouteCache | null>;
    removeDriverRoute(driverId: string): Promise<void>;
    private calculateDistanceKm;
    updateLiveRouteProgress(driverId: string, lat: number, lon: number, speedKmh?: number): Promise<{
        nextStop: {
            orderId: string;
            distanceKm: number;
            etaMin: number;
        };
    }>;
    updateLiveRouteETA(driverId: string, route: RouteCache, location: {
        lat: number;
        lon: number;
    }): Promise<void>;
    markStopVisited(driverId: string, orderId: string): Promise<void>;
    private completeRoute;
}
export {};
