import { RouteCacheService } from '../../fulfillment/maps/navigation.service';
import { RouteOptimizerService } from '../../fulfillment/maps/route-optimizer.service';
import { WebSocketEventService } from './websocket-event.service';
import { RouteCache } from '../../fulfillment/maps/maps.entity';
export declare class NavigationWsService {
    private readonly routeCacheService;
    private readonly routeOptimizerService;
    private readonly wsEvent;
    private readonly logger;
    constructor(routeCacheService: RouteCacheService, routeOptimizerService: RouteOptimizerService, wsEvent: WebSocketEventService);
    updateDriverNavigation(driverId: string, currentLocation: {
        lat: number;
        lon: number;
    }, reportedStops: any[]): Promise<{
        routeId: string;
        driverId: string;
        stops: ({
            [k: string]: any;
            orderId: string;
            lat: number;
            lon: number;
        } & {
            seq?: number;
            visited?: boolean;
            eta?: number;
            distanceKm?: number;
        })[];
        orderedStopIds: string[];
        originalOptimizedOrder: string[];
        geometry: any | null;
        distanceMeters: number;
        durationSec: number | null;
        segments: any[];
        generatedAt: number;
        strategy: string;
    } | RouteCache>;
    updateLiveRouteETA(driverId: string, lat: number, lon: number, speed?: number): Promise<void>;
}
