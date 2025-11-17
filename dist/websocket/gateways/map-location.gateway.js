"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapLocationGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const order_distance_ws_service_1 = require("../../websocket/services/order-distance.ws.service");
const driver_location_ws_service_1 = require("../../websocket/services/driver-location.ws.service");
const websocket_event_service_1 = require("../../websocket/services/websocket-event.service");
const common_1 = require("@nestjs/common");
const navigation_ws_service_1 = require("../services/navigation.ws.service");
const websocket_auth_guard_1 = require("../../common/websocket-auth.guard");
const jwt = require("jsonwebtoken");
let MapLocationGateway = class MapLocationGateway {
    constructor(wsEvent, driverWs, orderWs, navigationWs) {
        this.wsEvent = wsEvent;
        this.driverWs = driverWs;
        this.orderWs = orderWs;
        this.navigationWs = navigationWs;
        this.socketDriverMap = new Map();
        this.socketDriverWatchMap = new Map();
        this.socketOrderWatchMap = new Map();
    }
    onModuleInit() {
        if (this.driverWs) {
            this.driverWs.setOnlineEmitter(this.handleOnlineStatus.bind(this));
        }
    }
    afterInit(server) {
        console.log('WebSocket server initialized');
        server.use((socket, next) => {
            const token = socket.handshake?.auth?.token?.replace('Bearer ', '') ||
                socket.handshake?.headers?.authorization?.replace('Bearer ', '') ||
                this.extractTokenFromUrl(socket);
            if (!token) {
                console.log('🚫 Missing token');
                return next(new Error('Missing auth token'));
            }
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
                socket.user = decoded;
                next();
            }
            catch (err) {
                console.log('❌ Invalid token:', err.message);
                return next(new Error('Invalid or expired token'));
            }
        });
    }
    handleOnlineStatus(driverId, status) {
        this.server.emit('driver:status:change', { driverId, status });
    }
    emitDriverStatus(driverId, status = 'ONLINE') {
        console.log('Driver only status checks :::::::::::::::::::::::');
        console.log('Driver only status checks ::::driver id :::', driverId);
        console.log('Driver only status checks :::::status ::::', status);
        console.log('Driver only status checks :::::server this server ::::: ', this.server);
        if (!this.server)
            return;
        this.server.emit('driver:status', { driverId, status });
    }
    async handleDriverLocationUpdate(payload, client) {
        this.socketDriverMap.set(client.id, payload.driverId);
        await this.driverWs.updateDriverLocation(payload);
        const route = await this.navigationWs.updateLiveRouteETA(payload.driverId, payload.lat, payload.lon, payload.speed);
        console.log('Gateway route over all finallllllllllllllllllll :::', route);
        this.wsEvent.emitLocationUpdate(this.server, payload);
        client.emit('location:ack', { status: 'ok' });
    }
    async handleDriverRouteUpdate(payload, client) {
        console.log('Received driver:route:update', payload);
        const route = await this.navigationWs.updateDriverNavigation(payload.driverId, { lat: payload.lat, lon: payload.lon }, payload.stops);
        console.log('ROute loggggg :', route);
        client.emit('route:ack', { status: 'ok', route });
    }
    handleDriverLocationSubscribe(payload, client) {
        const driverRoom = `driver:${payload.driverId}`;
        client.join(driverRoom);
        this.socketDriverWatchMap.set(client.id, payload.driverId);
        client.emit('driver:location:subscribed', {
            driverId: payload.driverId,
            status: 'ok',
        });
    }
    handleEtaSubscribe(payload, client) {
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
    broadcastDriverRoute(driverId, route) {
        this.server.emit(`driver:${driverId}:route:update`, route);
    }
    broadcastDriverRouteCompletion(driverId, jobId) {
        this.server.emit(`driver:${driverId}:route:completed`, {
            optimizationJobId: jobId,
        });
    }
    broadcastDriverLocationToDriver(driverId, recalculatedRoute) {
        this.server.emit(`driver:${driverId}:location:update`, recalculatedRoute);
    }
    broadcastETAtoCustomer(recalculatedRoute) {
        this.server.emit(`driver:eta:update`, recalculatedRoute);
    }
    broadcastETAToDriver(driverId, recalculatedRoute) {
        this.server.emit(`driver:${driverId}:eta:update`, recalculatedRoute);
    }
    emitNextStopEta(driverId, nextStop, driverInfo) {
        for (const [clientId, subscription] of this.socketOrderWatchMap.entries()) {
            if (subscription.driverId === driverId &&
                subscription.orderId === nextStop.orderId) {
                this.server
                    .to(clientId)
                    .emit('navigation:eta:update', {
                    driverId,
                    orderId: nextStop.orderId,
                    ...driverInfo,
                    remainingDistanceKm: nextStop.distanceKm,
                    etaMinutes: nextStop.eta,
                });
            }
        }
    }
    emitDriverLocationToSubscribersPublic(payload) {
        this.wsEvent.emitDriverLocationToSubscribers(payload);
    }
    emitDriverLocationToSubscribers(payload) {
        this.wsEvent.emitDriverLocationToSubscribers(payload);
    }
    async handleNearbyDrivers(data, client) {
        const nearby = await this.driverWs.findNearbyDrivers(data.orderIds, data.radiusKm);
        client.emit('drivers:nearby:result', nearby);
    }
    async handleOrderDistance(payload, client) {
        console.log('Calculating price and distance');
        const { distance, priceData } = await this.orderWs.calculateDistanceAndPrice(payload);
        this.wsEvent.emitOrderDistance(this.server, {
            orderId: payload.orderId,
            distance,
        });
        this.wsEvent.emitOrderPrice(this.server, {
            orderId: payload.orderId,
            ...priceData,
        });
        console.log('Data for distance : ', distance);
        console.log('Data for price : ', priceData);
        client.emit('order:price:distance:result', {
            orderId: payload.orderId,
            ...priceData,
        });
    }
    async handleOrderPrice(payload, client) {
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
    handleConnection(client) {
        console.log(`🔗 Connected client: ${client.id}`);
        this.emitMessage(client, {
            event: 'authorized',
            message: 'Connected successfully',
        });
    }
    emitMessage(client, payload) {
        try {
            if (typeof client.emit === 'function') {
                client.emit(payload.event, payload);
            }
            else if (typeof client.send === 'function') {
                client.send(JSON.stringify(payload));
            }
            else {
                console.warn('Unknown client type, cannot send message');
            }
        }
        catch (err) {
            console.error('Error emitting message:', err);
        }
    }
    extractTokenFromUrl(client) {
        try {
            const url = client?.handshake?.url || client?.url || '';
            const params = new URLSearchParams(url.split('?')[1]);
            return params.get('token')?.replace('Bearer ', '') || null;
        }
        catch {
            return null;
        }
    }
    handleDisconnect(client) {
        const driverId = this.socketDriverMap.get(client.id);
        if (driverId)
            this.driverWs.markOffline(driverId);
        this.socketDriverMap.delete(client.id);
        this.socketDriverWatchMap.delete(client.id);
        console.log(`❌ Client disconnected: ${client.id}`);
    }
};
exports.MapLocationGateway = MapLocationGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], MapLocationGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('driver:location:update'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], MapLocationGateway.prototype, "handleDriverLocationUpdate", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('driver:route:update'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], MapLocationGateway.prototype, "handleDriverRouteUpdate", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('driver:location:subscribe'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], MapLocationGateway.prototype, "handleDriverLocationSubscribe", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('driver:eta:subscribe'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], MapLocationGateway.prototype, "handleEtaSubscribe", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('drivers:nearby'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], MapLocationGateway.prototype, "handleNearbyDrivers", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('order:distance:calculate'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], MapLocationGateway.prototype, "handleOrderDistance", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('order:price:calculate'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], MapLocationGateway.prototype, "handleOrderPrice", null);
exports.MapLocationGateway = MapLocationGateway = __decorate([
    (0, common_1.UseGuards)(websocket_auth_guard_1.WsJwtAuthGuard),
    (0, websockets_1.WebSocketGateway)({
        cors: { origin: '*' },
        transports: ['websocket', 'polling'],
    }),
    __param(0, (0, common_1.Inject)((0, common_1.forwardRef)(() => websocket_event_service_1.WebSocketEventService))),
    __metadata("design:paramtypes", [websocket_event_service_1.WebSocketEventService,
        driver_location_ws_service_1.DriverLocationWsService,
        order_distance_ws_service_1.OrderDistanceWsService,
        navigation_ws_service_1.NavigationWsService])
], MapLocationGateway);
//# sourceMappingURL=map-location.gateway.js.map