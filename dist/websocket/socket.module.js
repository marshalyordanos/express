"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketModule = void 0;
const common_1 = require("@nestjs/common");
const websocket_event_service_1 = require("./services/websocket-event.service");
const driver_location_ws_service_1 = require("./services/driver-location.ws.service");
const order_distance_ws_service_1 = require("./services/order-distance.ws.service");
const fulfillment_module_1 = require("../fulfillment/fulfillment.module");
const redis_module_1 = require("../redis/redis.module");
const map_location_gateway_1 = require("./gateways/map-location.gateway");
const maps_service_1 = require("../fulfillment/maps/maps.service");
const redis_service_1 = require("../redis/redis.service");
const navigation_ws_service_1 = require("./services/navigation.ws.service");
let WebSocketModule = class WebSocketModule {
};
exports.WebSocketModule = WebSocketModule;
exports.WebSocketModule = WebSocketModule = __decorate([
    (0, common_1.Module)({
        imports: [redis_module_1.MapModule, (0, common_1.forwardRef)(() => fulfillment_module_1.FulfillmentModule),],
        providers: [
            map_location_gateway_1.MapLocationGateway,
            websocket_event_service_1.WebSocketEventService,
            driver_location_ws_service_1.DriverLocationWsService,
            order_distance_ws_service_1.OrderDistanceWsService,
            navigation_ws_service_1.NavigationWsService,
            maps_service_1.MapsService,
            redis_service_1.RedisService,
        ],
        exports: [websocket_event_service_1.WebSocketEventService, map_location_gateway_1.MapLocationGateway],
    })
], WebSocketModule);
//# sourceMappingURL=socket.module.js.map