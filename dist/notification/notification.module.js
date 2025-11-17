"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationModule = void 0;
const common_1 = require("@nestjs/common");
const notification_service_1 = require("./notification.service");
const email_service_1 = require("./email.service");
const events_gateway_1 = require("./events.gateway");
const prisma_service_1 = require("../prisma/prisma.service");
const app_logger_service_1 = require("../common/app-logger.service");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const notification_repository_1 = require("./notification.repository");
const redis_module_1 = require("../redis/redis.module");
let NotificationModule = class NotificationModule {
};
exports.NotificationModule = NotificationModule;
exports.NotificationModule = NotificationModule = __decorate([
    (0, common_1.Module)({
        imports: [
            redis_module_1.RedisModule,
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET || 'yourSecret',
                signOptions: { expiresIn: '1d' },
            }),
        ],
        providers: [
            notification_service_1.NotificationService,
            email_service_1.EmailService,
            app_logger_service_1.AppLogger,
            events_gateway_1.EventsGateway,
            prisma_service_1.PrismaService,
            notification_repository_1.NotificationRepository,
            email_service_1.EmailService,
            events_gateway_1.EventsGateway,
        ],
        exports: [notification_service_1.NotificationService],
    })
], NotificationModule);
//# sourceMappingURL=notification.module.js.map