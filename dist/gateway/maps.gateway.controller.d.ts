import { ClientProxy } from '@nestjs/microservices';
import { OrderIdDto } from '../fulfillment/maps/maps.entity';
export declare class MapGatewayController {
    private readonly mapClient;
    constructor(mapClient: ClientProxy);
    nearbyDrivers(lat: string, lon: string, radius: string, req: any): Promise<import("rxjs").Observable<any>>;
    markStopVisited(driverId: string, dto: OrderIdDto, req: any): Promise<import("rxjs").Observable<any>>;
    getRouteStatus(driverId: string, req: any): Promise<import("rxjs").Observable<any>>;
    getRoute(driverId: string, req: any): Promise<import("rxjs").Observable<any>>;
}
