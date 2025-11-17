import { Server } from 'socket.io';
import { MapLocationGateway } from '../gateways/map-location.gateway';
import { OrderDistanceWsService } from './order-distance.ws.service';
export declare class WebSocketEventService {
    private readonly mapLocationGateway;
    private readonly orderDistanceWs;
    constructor(mapLocationGateway: MapLocationGateway, orderDistanceWs: OrderDistanceWsService);
    emitDriverStatus(server: Server, driverId: string, status: 'ONLINE' | 'OFFLINE'): void;
    emitLocationUpdate(server: Server, payload: any): void;
    emitDriverLocationToSubscribers(payload: {
        driverId: string;
        lat: number;
        lon: number;
        speed?: number;
        heading?: number;
    }): void;
    emitDriverNavigationToDriver(driverId: string, route: any): void;
    emitNavigationEtaToAllSubscribedCustomers(driverId: string, nextStop: any, driverInfo: any): void;
    emitOrderDistance(server: Server, payload: any): void;
    emitOrderPrice(server: Server, payload: any): void;
    emitOrderDistanceCalculation(orderId: string, origin: {
        lat: number;
        lon: number;
    }, destination: {
        lat: number;
        lon: number;
    }): void;
    emitDriverLocationUpdate(driverId: string, lat: number, lon: number, speed?: number, heading?: number): void;
}
