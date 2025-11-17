import { OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { OrderDistanceWsService } from '../../websocket/services/order-distance.ws.service';
import { DriverLocationWsService } from '../../websocket/services/driver-location.ws.service';
import { WebSocketEventService } from '../../websocket/services/websocket-event.service';
import { NavigationWsService } from '../services/navigation.ws.service';
export declare class MapLocationGateway implements OnGatewayInit {
    private readonly wsEvent;
    private readonly driverWs;
    private readonly orderWs;
    private readonly navigationWs;
    server: Server;
    private socketDriverMap;
    private socketDriverWatchMap;
    private socketOrderWatchMap;
    constructor(wsEvent: WebSocketEventService, driverWs: DriverLocationWsService, orderWs: OrderDistanceWsService, navigationWs: NavigationWsService);
    onModuleInit(): void;
    afterInit(server: Server): void;
    private handleOnlineStatus;
    emitDriverStatus(driverId: string, status?: 'ONLINE' | 'OFFLINE'): void;
    handleDriverLocationUpdate(payload: {
        driverId: string;
        lat: number;
        lon: number;
        speed?: number;
        heading?: number;
    }, client: Socket): Promise<void>;
    handleDriverRouteUpdate(payload: {
        driverId: string;
        lat: number;
        lon: number;
        stops: any[];
    }, client: Socket): Promise<void>;
    handleDriverLocationSubscribe(payload: {
        driverId: string;
    }, client: Socket): void;
    handleEtaSubscribe(payload: {
        driverId: string;
        orderId: string;
    }, client: Socket): void;
    broadcastDriverRoute(driverId: string, route: any): void;
    broadcastDriverRouteCompletion(driverId: string, jobId: string): void;
    broadcastDriverLocationToDriver(driverId: string, recalculatedRoute: any): void;
    broadcastETAtoCustomer(recalculatedRoute: any): void;
    broadcastETAToDriver(driverId: string, recalculatedRoute: any): void;
    emitNextStopEta(driverId: string, nextStop: any, driverInfo: any): void;
    emitDriverLocationToSubscribersPublic(payload: {
        driverId: string;
        lat: number;
        lon: number;
        speed?: number;
        heading?: number;
    }): void;
    emitDriverLocationToSubscribers(payload: {
        driverId: string;
        lat: number;
        lon: number;
        speed?: number;
        heading?: number;
    }): void;
    handleNearbyDrivers(data: {
        orderIds: string[];
        radiusKm: number;
    }, client: Socket): Promise<void>;
    handleOrderDistance(payload: any, client: Socket): Promise<void>;
    handleOrderPrice(payload: any, client: Socket): Promise<void>;
    handleConnection(client: Socket): void;
    private emitMessage;
    private extractTokenFromUrl;
    handleDisconnect(client: Socket): void;
}
