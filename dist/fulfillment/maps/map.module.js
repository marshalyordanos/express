"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapsModule = void 0;
const common_1 = require("@nestjs/common");
const maps_service_1 = require("./maps.service");
const driver_location_service_1 = require("./driver-location.service");
const navigation_service_1 = require("./navigation.service");
const route_optimizer_service_1 = require("./route-optimizer.service");
const maps_repository_1 = require("./maps.repository");
const redis_service_1 = require("../../redis/redis.service");
const prisma_service_1 = require("../../prisma/prisma.service");
const socket_module_1 = require("../../websocket/socket.module");
const app_logger_service_1 = require("../../common/app-logger.service");
const driver_location_ws_service_1 = require("../../websocket/services/driver-location.ws.service");
const navigation_ws_service_1 = require("../../websocket/services/navigation.ws.service");
let MapsModule = class MapsModule {
};
exports.MapsModule = MapsModule;
exports.MapsModule = MapsModule = __decorate([
    (0, common_1.Module)({
        imports: [(0, common_1.forwardRef)(() => socket_module_1.WebSocketModule)],
        providers: [
            driver_location_service_1.DriverLocationService,
            maps_repository_1.MapsRepository,
            maps_service_1.MapsService,
            app_logger_service_1.AppLogger,
            redis_service_1.RedisService,
            prisma_service_1.PrismaService,
            navigation_service_1.RouteCacheService,
            route_optimizer_service_1.RouteOptimizerService,
            driver_location_ws_service_1.DriverLocationWsService,
            navigation_ws_service_1.NavigationWsService,
        ],
        exports: [
            driver_location_service_1.DriverLocationService,
            maps_service_1.MapsService,
            navigation_service_1.RouteCacheService,
            route_optimizer_service_1.RouteOptimizerService,
            driver_location_ws_service_1.DriverLocationWsService,
            navigation_ws_service_1.NavigationWsService,
        ],
    })
], MapsModule);
//# sourceMappingURL=map.module.js.map