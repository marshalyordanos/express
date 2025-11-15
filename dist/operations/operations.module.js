"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OperationsModule = void 0;
const common_1 = require("@nestjs/common");
const user_controller_1 = require("./user/user.controller");
const user_usecase_impl_1 = require("./user/user.usecase.impl");
const prisma_service_1 = require("../prisma/prisma.service");
const config_1 = require("@nestjs/config");
const user_repository_1 = require("./user/user.repository");
const jwt_1 = require("@nestjs/jwt");
const branch_controller_1 = require("./branch/branch.controller");
const branch_useCase_impl_1 = require("./branch/branch.useCase.impl");
const branch_repository_1 = require("./branch/branch.repository");
const role_repository_1 = require("./role/role.repository");
const role_useCase_impl_1 = require("./role/role.useCase.impl");
const fleet_repository_1 = require("./fleet/fleet.repository");
const fleet_usecase_impl_1 = require("./fleet/fleet.usecase.impl");
const staff_useCase_impl_1 = require("./staff/staff.useCase.impl");
const staff_controller_1 = require("./staff/staff.controller");
const staff_repository_1 = require("./staff/staff.repository");
const fleet_controller_1 = require("./fleet/fleet.controller");
const access_control_controller_1 = require("./acl/access_control.controller");
const access_control_usecase_impl_1 = require("./acl/access_control.usecase.impl");
const access_control_repository_1 = require("./acl/access_control.repository");
const analytics_controller_1 = require("./report/controllers/analytics.controller");
const dashboard_controller_1 = require("./report/controllers/dashboard.controller");
const report_controller_1 = require("./report/controllers/report.controller");
const dashboard_service_1 = require("./report/services/dashboard.service");
const dashboard_repository_1 = require("./report/repositories/dashboard.repository");
const redis_service_1 = require("../redis/redis.service");
const app_logger_service_1 = require("../common/app-logger.service");
const maps_service_1 = require("../fulfillment/maps/maps.service");
const cloudinary_uploader_service_1 = require("../common/cloudinary/cloudinary-uploader.service");
const ocr_service_1 = require("../common/ocr/ocr.service");
let OperationsModule = class OperationsModule {
};
exports.OperationsModule = OperationsModule;
exports.OperationsModule = OperationsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET || 'yourSecret',
                signOptions: { expiresIn: '15m' },
            }),
        ],
        controllers: [
            user_controller_1.UserMessageController,
            branch_controller_1.BranchMessageController,
            fleet_controller_1.FleetMessageController,
            staff_controller_1.StaffMessageController,
            fleet_controller_1.FleetMessageController,
            access_control_controller_1.AccessControlMessageController,
            analytics_controller_1.AnalyticsController,
            dashboard_controller_1.DashboardReportMessageController,
            report_controller_1.ReportMessageController,
        ],
        providers: [
            user_usecase_impl_1.UserUseCasesImp,
            user_repository_1.UserRepository,
            branch_useCase_impl_1.BranchUseCaseImpl,
            branch_repository_1.BranchRepository,
            prisma_service_1.PrismaService,
            redis_service_1.RedisService,
            fleet_repository_1.VehicleRepository,
            fleet_usecase_impl_1.FleetUseCasesImp,
            staff_useCase_impl_1.StaffUseCasesImpl,
            staff_repository_1.StaffRepository,
            access_control_usecase_impl_1.AccessControlUsecaseImpl,
            access_control_repository_1.AccessControlRepository,
            role_useCase_impl_1.RoleUseCaseImpl,
            role_repository_1.RoleRepository,
            dashboard_service_1.DashboardReportService,
            dashboard_repository_1.DashboardReportRepository,
            app_logger_service_1.AppLogger,
            maps_service_1.MapsService,
            cloudinary_uploader_service_1.CloudinaryUploaderService,
            ocr_service_1.CommonOCRService,
        ],
        exports: [
            user_usecase_impl_1.UserUseCasesImp,
            branch_useCase_impl_1.BranchUseCaseImpl,
            fleet_usecase_impl_1.FleetUseCasesImp,
            staff_useCase_impl_1.StaffUseCasesImpl,
            access_control_usecase_impl_1.AccessControlUsecaseImpl,
            dashboard_service_1.DashboardReportService,
        ],
    })
], OperationsModule);
//# sourceMappingURL=operations.module.js.map