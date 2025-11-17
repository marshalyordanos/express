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
exports.WebSocketEventService = void 0;
const common_1 = require("@nestjs/common");
const map_location_gateway_1 = require("../gateways/map-location.gateway");
const order_distance_ws_service_1 = require("./order-distance.ws.service");
let WebSocketEventService = class WebSocketEventService {
    constructor(mapLocationGateway, orderDistanceWs) {
        this.mapLocationGateway = mapLocationGateway;
        this.orderDistanceWs = orderDistanceWs;
    }
    emitDriverStatus(server, driverId, status) {
        server.emit('driver:status', { driverId, status });
    }
    emitLocationUpdate(server, payload) {
        server.emit('driver:location:updated', payload);
    }
    emitDriverLocationToSubscribers(payload) {
        const gateway = this.mapLocationGateway;
        if (!gateway?.server)
            return;
        for (const [clientId, driverId] of gateway['socketDriverWatchMap'].entries()) {
            if (driverId === payload.driverId) {
                gateway.server.to(clientId).emit('driver:location:tracking', payload);
            }
        }
    }
    emitDriverNavigationToDriver(driverId, route) {
        const gateway = this.mapLocationGateway;
        if (!gateway?.server)
            return;
        gateway.server.to(driverId).emit('navigation:update', route);
    }
    emitNavigationEtaToAllSubscribedCustomers(driverId, nextStop, driverInfo) {
        const gateway = this.mapLocationGateway;
        if (!gateway?.server)
            return;
        for (const [clientId, subscription] of gateway['socketOrderWatchMap'].entries()) {
            if (subscription.driverId === driverId &&
                subscription.orderId === nextStop.orderId) {
                gateway.server.to(clientId).emit('navigation:eta:update', {
                    driverId,
                    orderId: nextStop.orderId,
                    ...driverInfo,
                    remainingDistanceKm: nextStop.distanceKm,
                    etaMinutes: nextStop.eta,
                });
            }
        }
    }
    emitOrderDistance(server, payload) {
        server.emit('order:distance:updated', payload);
    }
    emitOrderPrice(server, payload) {
        server.emit('order:price:calculated', payload);
    }
    emitOrderDistanceCalculation(orderId, origin, destination) {
        console.log('Inside event');
        this.orderDistanceWs.calculateDistanceAndPrice({
            orderId,
            origin,
            destination,
        });
    }
    emitDriverLocationUpdate(driverId, lat, lon, speed, heading) {
        this.mapLocationGateway.server.emit('driver:location:updated', {
            driverId,
            lat,
            lon,
            speed,
            heading,
        });
    }
};
exports.WebSocketEventService = WebSocketEventService;
exports.WebSocketEventService = WebSocketEventService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)((0, common_1.forwardRef)(() => map_location_gateway_1.MapLocationGateway))),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => order_distance_ws_service_1.OrderDistanceWsService))),
    __metadata("design:paramtypes", [map_location_gateway_1.MapLocationGateway,
        order_distance_ws_service_1.OrderDistanceWsService])
], WebSocketEventService);
//# sourceMappingURL=websocket-event.service.js.map