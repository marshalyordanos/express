import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { OrderDistanceWsService } from '../../websocket/services/order-distance.ws.service';
import { DriverLocationWsService } from '../../websocket/services/driver-location.ws.service';
import { WebSocketEventService } from '../../websocket/services/websocket-event.service';
import { Inject, forwardRef } from '@nestjs/common';
import { NavigationWsService } from '../services/navigation.ws.service';
import { RouteCache } from '../../fulfillment/maps/maps.entity';
import { log } from 'node:console';

// interface RouteCache {
//   optimizationJobId: string;
//   routeId: string;
//   stops: any[];
//   totalDistance: number;
//   totalDuration: number;
//   lastUpdated: number;
// }
@WebSocketGateway({ cors: { origin: '*' } })
export class MapLocationGateway implements OnGatewayInit {
  @WebSocketServer() server: Server;

  // Maps for tracking client subscriptions
  private socketDriverMap = new Map<string, string>(); // clientId -> driverId
  private socketDriverWatchMap = new Map<string, string>(); // clientId -> watched driverId
  private socketOrderWatchMap = new Map<
    string,
    { driverId: string; orderId: string }
  >();

  constructor(
    @Inject(forwardRef(() => WebSocketEventService))
    private readonly wsEvent: WebSocketEventService,
    private readonly driverWs: DriverLocationWsService,
    private readonly orderWs: OrderDistanceWsService,
    private readonly navigationWs: NavigationWsService,
  ) {}

  /** Set online/offline emitter once gateway is initialized */
  onModuleInit() {
    if (this.driverWs) {
      this.driverWs.setOnlineEmitter(this.handleOnlineStatus.bind(this));
    }
  }
  afterInit(server: Server) {
    console.log('WebSocket server initialized');
  }

  private handleOnlineStatus(driverId: string, status: 'ONLINE' | 'OFFLINE') {
    
    this.server.emit('driver:status:change', { driverId, status });
  }

  emitDriverStatus(driverId: string, status: 'ONLINE' | 'OFFLINE' = 'ONLINE') {
    console.log("Driver only status checks :::::::::::::::::::::::");
    console.log("Driver only status checks ::::driver id :::", driverId);
    console.log("Driver only status checks :::::status ::::", status);
    console.log("Driver only status checks :::::server this server ::::: ", this.server);
    
    if (!this.server) return;
    this.server.emit('driver:status', { driverId, status });
  }

  /** ================== DRIVER LOCATION UPDATES ================== */
  @SubscribeMessage('driver:location:update')
  async handleDriverLocationUpdate(
    @MessageBody()
    payload: {
      driverId: string;
      lat: number;
      lon: number;
      speed?: number;
      heading?: number;
    },
    @ConnectedSocket() client: Socket,
  ) {
    // Track which client corresponds to which driver
    this.socketDriverMap.set(client.id, payload.driverId);

    // Update backend DB / Redis
    await this.driverWs.updateDriverLocation(payload);

    // NEW: update route ETA if route exists
   const route = await this.navigationWs.updateLiveRouteETA(
      payload.driverId,
      payload.lat,
      payload.lon,
      payload.speed,
    );
    console.log("Gateway route over all finallllllllllllllllllll :::", route);
    

      // For each order in the route that is not yet delivered
  // route.stops
  //   .filter(stop => !stop.visited)  // only active stops
  //   .forEach(nextStop => {
  //     const driverInfo = { lat: payload.lat, lon: payload.lon, speed: payload.speed };
  //     this.emitNextStopEta(payload.driverId, nextStop, driverInfo);
  //   });
    // Emit to subscribed clients
    this.wsEvent.emitLocationUpdate(this.server, payload);

    // Ack to driver
    client.emit('location:ack', { status: 'ok' });
  }

  /** ================== DRIVER ROUTE UPDATE ================== */
  @SubscribeMessage('driver:route:update')
  async handleDriverRouteUpdate(
    @MessageBody()
    payload: { driverId: string; lat: number; lon: number; stops: any[] },
    @ConnectedSocket() client: Socket,
  ) {
     console.log('Received driver:route:update', payload);
    // Update the driver's route on the backend
    const route = await this.navigationWs.updateDriverNavigation(
      payload.driverId,
      { lat: payload.lat, lon: payload.lon },
      payload.stops,
    );
    console.log("ROute loggggg :", route);

    // Acknowledge to the driver
    client.emit('route:ack', { status: 'ok',  route });
  }

  /** ================== SUBSCRIBE TO DRIVER LOCATION ================== */
  @SubscribeMessage('driver:location:subscribe')
  handleDriverLocationSubscribe(
    @MessageBody() payload: { driverId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const driverRoom = `driver:${payload.driverId}`;
    client.join(driverRoom);
    this.socketDriverWatchMap.set(client.id, payload.driverId);
    client.emit('driver:location:subscribed', {
      driverId: payload.driverId,
      status: 'ok',
    });
  }

  @SubscribeMessage('driver:eta:subscribe')
  handleEtaSubscribe(
    @MessageBody() payload: { driverId: string; orderId: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.socketOrderWatchMap.set(client.id, {
      driverId: payload.driverId,
      orderId: payload.orderId,
    });
    client.emit('driver:eta:subscribed', {
      driverId: payload.driverId,
      orderId: payload.orderId,
      status: 'ok',
    });
  }

  public broadcastDriverRoute(driverId: string, route: any) {
    
    this.server.emit(`driver:${driverId}:route:update`, route);
  }

  public broadcastDriverRouteCompletion(driverId: string, jobId: string) {
    this.server.emit(`driver:${driverId}:route:completed`, {
      optimizationJobId: jobId,
    });
  }

  public broadcastDriverLocationToDriver(driverId: string, recalculatedRoute: any) {
    this.server.emit(`driver:${driverId}:location:update`, recalculatedRoute);
  }

  public broadcastETAtoCustomer(recalculatedRoute: any) {
    this.server.emit(`driver:eta:update`, recalculatedRoute);
  }

  public broadcastETAToDriver(driverId: string, recalculatedRoute: any) {
    this.server.emit(`driver:${driverId}:eta:update`, recalculatedRoute);
  }

  public emitNextStopEta(driverId: string, nextStop: any, driverInfo: any) {
    for (const [clientId, subscription] of this.socketOrderWatchMap.entries()) {
      if (subscription.driverId === driverId && subscription.orderId === nextStop.orderId) {
        this.server.to(clientId).emit('navigation:eta:update', { driverId, orderId: nextStop.orderId, ...driverInfo, remainingDistanceKm: nextStop.distanceKm, etaMinutes: nextStop.eta });
      }
    }
  }
  public emitDriverLocationToSubscribersPublic(payload: {
    driverId: string;
    lat: number;
    lon: number;
    speed?: number;
    heading?: number;
  }) {
    this.wsEvent.emitDriverLocationToSubscribers(payload);
  }

  /** ================== EMIT DRIVER LOCATION TO SUBSCRIBERS ================== */
  public emitDriverLocationToSubscribers(payload: {
    driverId: string;
    lat: number;
    lon: number;
    speed?: number;
    heading?: number;
  }) {
    this.wsEvent.emitDriverLocationToSubscribers(payload);
  }

  /** ================== NEARBY DRIVERS ================== */
  @SubscribeMessage('drivers:nearby')
  async handleNearbyDrivers(
    @MessageBody() data: { lat: number; lon: number; radiusKm: number },
    @ConnectedSocket() client: Socket,
  ) {
    const nearby = await this.driverWs.findNearbyDrivers(
      data.lat,
      data.lon,
      data.radiusKm,
    );
    client.emit('drivers:nearby:result', nearby);
  }

  /** ================== ORDER DISTANCE & PRICE ================== */
  @SubscribeMessage('order:distance:calculate')
  async handleOrderDistance(
    @MessageBody() payload: any,
    @ConnectedSocket() client: Socket,
  ) {
    console.log("Calculating price and distance");
    
    const { distance, priceData } =
      await this.orderWs.calculateDistanceAndPrice(payload);
    this.wsEvent.emitOrderDistance(this.server, {
      orderId: payload.orderId,
      distance,
    });
    this.wsEvent.emitOrderPrice(this.server, {
      orderId: payload.orderId,
      ...priceData,
    });
    console.log("Data for distance : ", distance);
    console.log("Data for price : ", priceData);
    
    client.emit('order:price:result', {
      orderId: payload.orderId,
      ...priceData,
    });
  }

  @SubscribeMessage('order:price:calculate')
  async handleOrderPrice(
    @MessageBody() payload: any,
    @ConnectedSocket() client: Socket,
  ) {
    const priceData = await this.orderWs.calculatePrice(payload);
    this.wsEvent.emitOrderPrice(this.server, {
      orderId: payload.orderId,
      ...priceData,
    });
    client.emit('order:price:result', {
      orderId: payload.orderId,
      ...priceData,
    });
  }

  /** ================== CONNECTION HANDLERS ================== */
  handleConnection(client: Socket) {
    console.log(`✅ Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const driverId = this.socketDriverMap.get(client.id);
    if (driverId) this.driverWs.markOffline(driverId);

    // Cleanup
    this.socketDriverMap.delete(client.id);
    this.socketDriverWatchMap.delete(client.id);

    console.log(`❌ Client disconnected: ${client.id}`);
  }
}
