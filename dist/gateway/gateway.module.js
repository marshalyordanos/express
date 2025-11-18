"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GatewayModule = void 0;
const common_1 = require("@nestjs/common");
const auth_gateway_controller_1 = require("./auth.gateway.controller");
const user_gateway_controller_1 = require("./user.gateway.controller");
const clients_module_1 = require("./clients.module");
const branch_gateway_controller_1 = require("./branch.gateway.controller");
const role_gateway_controller_1 = require("./role.gateway.controller");
const fleet_gatway_controller_1 = require("./fleet.gatway.controller");
const staff_gateway_controller_1 = require("./staff.gateway.controller");
const access_control_gateway_controller_1 = require("./access_control.gateway.controller");
const order_gateway_controller_1 = require("./order.gateway.controller");
const dispatch_gateway_controller_1 = require("./dispatch.gateway.controller");
const pricing_gateway_controller_1 = require("./pricing.gateway.controller");
const Permission_Bootstrapper_1 = require("./Permission.Bootstrapper");
const prisma_service_1 = require("../prisma/prisma.service");
const config_1 = require("@nestjs/config");
const maps_gateway_controller_1 = require("./maps.gateway.controller");
const fulfillment_module_1 = require("../fulfillment/fulfillment.module");
const report_gateway_controller_1 = require("./report.gateway.controller");
const app_logger_service_1 = require("../common/app-logger.service");
const sanitize_pipe_1 = require("../common/sanitize.pipe");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const cloudinary_uploader_service_1 = require("../common/cloudinary/cloudinary-uploader.service");
const redis_module_1 = require("../redis/redis.module");
let GatewayModule = class GatewayModule {
};
exports.GatewayModule = GatewayModule;
exports.GatewayModule = GatewayModule = __decorate([
    (0, common_1.Module)({
        imports: [
            platform_express_1.MulterModule.register({
                storage: (0, multer_1.memoryStorage)(),
                limits: { files: 5, fileSize: 5 * 1024 * 1024 },
            }),
            (0, common_1.forwardRef)(() => fulfillment_module_1.FulfillmentModule),
            clients_module_1.MicroserviceClientsModule,
            redis_module_1.RedisModule,
            config_1.ConfigModule.forRoot({ isGlobal: true }),
        ],
        providers: [
            Permission_Bootstrapper_1.PermissionBootstrapper,
            prisma_service_1.PrismaService,
            app_logger_service_1.AppLogger,
            sanitize_pipe_1.SanitizePipe,
            cloudinary_uploader_service_1.CloudinaryUploaderService,
        ],
        controllers: [
            auth_gateway_controller_1.AuthGatewayController,
            user_gateway_controller_1.UserGatewayController,
            branch_gateway_controller_1.BranchGatewayController,
            role_gateway_controller_1.RoleGatewayController,
            fleet_gatway_controller_1.FleetGatewayController,
            staff_gateway_controller_1.StaffGatewayController,
            access_control_gateway_controller_1.AccessControlGatewayController,
            order_gateway_controller_1.OrderGatewayController,
            dispatch_gateway_controller_1.DispatchGatewayController,
            pricing_gateway_controller_1.PricingGatewayController,
            maps_gateway_controller_1.MapGatewayController,
            report_gateway_controller_1.ReportGatewayController,
        ],
        exports: [app_logger_service_1.AppLogger, sanitize_pipe_1.SanitizePipe]
    })
], GatewayModule);
//# sourceMappingURL=gateway.module.js.map