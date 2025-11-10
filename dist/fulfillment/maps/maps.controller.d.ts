import { MapsUseCasesImpl } from './maps.usecase.impl';
import { RouteCacheService } from './navigation.service';
import { DriverLocationService } from './driver-location.service';
export declare class MapMessageController {
    private readonly routeCacheService;
    private readonly usecases;
    private readonly locationService;
    constructor(routeCacheService: RouteCacheService, usecases: MapsUseCasesImpl, locationService: DriverLocationService);
    getRoute(payoad: {
        driverId: string;
    }): Promise<any>;
    markStopVisited(payload: {
        driverId: string;
        orderId: string;
    }): Promise<any>;
    getRouteStatus(payoad: {
        driverId: string;
    }): Promise<any>;
    getNearbyDrivers(payoad: {
        lat: any;
        lon: any;
        radius: any;
        user: any;
    }): Promise<any>;
}
