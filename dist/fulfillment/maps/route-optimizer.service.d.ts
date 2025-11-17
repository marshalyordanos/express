import { MapsService } from './maps.service';
type LatLon = {
    lat: number;
    lon: number;
};
type Stop = {
    orderId: string;
    lat: number;
    lon: number;
    [k: string]: any;
};
type Route = {
    routeId: string;
    driverId: string;
    stops: (Stop & {
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
};
type RouteLike = Partial<Route> & {
    stops: any[];
    geometry?: any;
};
export declare class RouteOptimizerService {
    private readonly mapsService;
    private readonly logger;
    constructor(mapsService: MapsService);
    computeOptimizedRoute(driverId: string, driverLocation: LatLon, stops: Stop[]): Promise<Route>;
    recalculateRouteIfDeviation(driverId: string, driverLocation: LatLon, currentRoute: RouteLike, deviationThresholdMeters?: number): Promise<{
        route: RouteLike;
        recalculated: boolean;
    }>;
    private solveTspNearest2Opt;
    private calc2OptDelta;
    private sumTourDistanceMeters;
    private emptyRoute;
    private haversineKm;
}
export {};
