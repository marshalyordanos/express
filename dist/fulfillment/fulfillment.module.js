"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FulfillmentModule = void 0;
const common_1 = require("@nestjs/common");
const order_controller_1 = require("./order/order.controller");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const order_usecase_impl_1 = require("./order/order.usecase.impl");
const order_repository_1 = require("./order/order.repository");
const prisma_service_1 = require("../prisma/prisma.service");
const dispatch_controller_1 = require("./dispatch/dispatch.controller");
const dispatch_repository_1 = require("./dispatch/dispatch.repository");
const dispatch_usecase_impl_1 = require("./dispatch/dispatch.usecase.impl");
const pricing_repository_1 = require("./pricing/pricing.repository");
const pricing_controller_1 = require("./pricing/pricing.controller");
const pricing_usecase_impl_1 = require("./pricing/pricing.usecase.impl");
const maps_service_1 = require("./maps/maps.service");
const redis_service_1 = require("../redis/redis.service");
const driver_location_service_1 = require("./maps/driver-location.service");
const route_optimizer_service_1 = require("./maps/route-optimizer.service");
const schedule_1 = require("@nestjs/schedule");
const socket_module_1 = require("../websocket/socket.module");
const maps_usecase_impl_1 = require("./maps/maps.usecase.impl");
const maps_repository_1 = require("./maps/maps.repository");
const maps_controller_1 = require("./maps/maps.controller");
const navigation_service_1 = require("./maps/navigation.service");
const app_logger_service_1 = require("../common/app-logger.service");
const notification_publisher_1 = require("../common/notification-publisher");
let FulfillmentModule = class FulfillmentModule {
};
exports.FulfillmentModule = FulfillmentModule;
exports.FulfillmentModule = FulfillmentModule = __decorate([
    (0, common_1.Module)({
        imports: [
            (0, common_1.forwardRef)(() => socket_module_1.WebSocketModule),
            schedule_1.ScheduleModule.forRoot(),
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET || 'yourSecret',
                signOptions: { expiresIn: '15m' },
            }),
        ],
        controllers: [
            order_controller_1.OrderMessageController,
            dispatch_controller_1.DispatchMessageController,
            pricing_controller_1.PricingMessageController,
            maps_controller_1.MapMessageController,
        ],
        providers: [
            order_repository_1.OrderRepository,
            order_usecase_impl_1.OrderUseCasesImpl,
            prisma_service_1.PrismaService,
            dispatch_repository_1.DispatchRepository,
            dispatch_usecase_impl_1.DispatchUseCasesImpl,
            pricing_repository_1.PricingRepository,
            pricing_usecase_impl_1.PricingUseCasesImpl,
            maps_service_1.MapsService,
            redis_service_1.RedisService,
            driver_location_service_1.DriverLocationService,
            route_optimizer_service_1.RouteOptimizerService,
            navigation_service_1.RouteCacheService,
            maps_usecase_impl_1.MapsUseCasesImpl,
            maps_repository_1.MapsRepository,
            app_logger_service_1.AppLogger,
            notification_publisher_1.NotificationPublisher,
        ],
        exports: [
            order_usecase_impl_1.OrderUseCasesImpl,
            maps_service_1.MapsService,
            prisma_service_1.PrismaService,
            driver_location_service_1.DriverLocationService,
            route_optimizer_service_1.RouteOptimizerService,
            navigation_service_1.RouteCacheService,
            redis_service_1.RedisService,
            dispatch_usecase_impl_1.DispatchUseCasesImpl,
            pricing_usecase_impl_1.PricingUseCasesImpl,
            maps_usecase_impl_1.MapsUseCasesImpl,
        ],
    })
], FulfillmentModule);
//# sourceMappingURL=fulfillment.module.js.map