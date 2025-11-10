import { MapsUseCases } from './maps.usecase';
import { ListQueryDto } from '../../common/query/query.dto';
import { MapsRepository } from './maps.repository';
import { RouteOptimizerService } from './route-optimizer.service';
import { MapsService } from './maps.service';
import { RouteCacheService } from './navigation.service';
export declare class MapsUseCasesImpl implements MapsUseCases {
    private readonly mapRepo;
    private readonly routeOptimizerService;
    private readonly mapService;
    private readonly routeCacheService;
    constructor(mapRepo: MapsRepository, routeOptimizerService: RouteOptimizerService, mapService: MapsService, routeCacheService: RouteCacheService);
    createDriver(body: any): Promise<any>;
    createDriverLocation(body: any): Promise<any>;
    getDrivers(query: ListQueryDto): Promise<any>;
    getDriverById(id: string): Promise<any>;
    getRoute(driverId: string): Promise<{
        optimizationJobId: string;
        route: {
            routeId: string;
            driverId: string;
            stops: any[];
            orderedStopIds: string[];
            geometry: any | null;
            distanceMeters: number;
            durationSec: number | null;
            segments: any[];
            generatedAt: number;
            strategy: string;
        };
    }>;
    markStopVisited(driverId: string, orderId: string): Promise<{
        message: string;
    }>;
    getRouteStatus(driverId: string): Promise<any>;
}
