"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const auth_controller_1 = require("./auth.controller");
const prisma_service_1 = require("../prisma/prisma.service");
const config_1 = require("@nestjs/config");
const auth_usecase_impl_1 = require("./auth.usecase.impl");
const jwt_1 = require("@nestjs/jwt");
const auth_repository_1 = require("./auth.repository");
const app_logger_service_1 = require("../common/app-logger.service");
const notification_publisher_1 = require("../common/notification-publisher");
const redis_module_1 = require("../redis/redis.module");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            redis_module_1.RedisModule,
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET || 'yourSecret',
                signOptions: { expiresIn: '1m' },
            }),
        ],
        controllers: [auth_controller_1.AuthMessageController],
        providers: [
            auth_repository_1.AuthRepository,
            auth_usecase_impl_1.AuthUseCaseImpl,
            notification_publisher_1.NotificationPublisher,
            prisma_service_1.PrismaService,
            app_logger_service_1.AppLogger,
        ],
        exports: [auth_usecase_impl_1.AuthUseCaseImpl],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map