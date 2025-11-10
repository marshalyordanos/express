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
exports.DashboardReportMessageController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const check_permission_decorator_1 = require("../../../common/decorator/check-permission.decorator");
const permission_guard_1 = require("../../../common/permission.guard");
const contracts_1 = require("../../../contracts");
const permission_actions_enum_1 = require("../../../contracts/permission-actions.enum");
const dashboard_service_1 = require("../services/dashboard.service");
const rate_limit_guard_1 = require("../../../common/rate-limit.guard");
let DashboardReportMessageController = class DashboardReportMessageController {
    constructor(reportsService) {
        this.reportsService = reportsService;
    }
    async getOverview(payload) {
        const token = payload.headers.authorization;
        return this.reportsService.getOverview(token);
    }
    async getShipmentPerformance(payload) {
        return this.reportsService.getShipmentPerformance();
    }
    async getRevenueTrends(payload) {
        const period = payload.period?.toLowerCase();
        return this.reportsService.getRevenueTrends(period);
    }
    async getBranchPerformance(payload) {
        const metric = payload.metric?.toLowerCase() || 'deliveries';
        return this.reportsService.getBranchPerformance(metric);
    }
    async getDriverPerformance(payload) {
        const regionId = payload.regionId;
        return this.reportsService.getDriverPerformance(regionId);
    }
    async getBranchDashboardSummary(payload) {
        return this.reportsService.getBranchDashboardSummary();
    }
    async getStaffDashboardSummary(payload) {
        return this.reportsService.getStaffDashboardSummary();
    }
    async getOrderDashboardSummary(payload) {
        return this.reportsService.getOrderDashboardSummary();
    }
    async getCustomerDashboardSummary(payload) {
        return this.reportsService.getCustomerAnalytics();
    }
    async getReportOverview(payload) {
        return this.reportsService.getReportOverview();
    }
    async getFleetSummary(payload) {
        return this.reportsService.getFleetSummary();
    }
    async getDispatchSummary(payload) {
        return this.reportsService.getDispatchSummary();
    }
};
exports.DashboardReportMessageController = DashboardReportMessageController;
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Dashboard-Report', permission_actions_enum_1.PermissionActions.READ),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.REPORT_DASHBOARD_OVERVIEW),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DashboardReportMessageController.prototype, "getOverview", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Dashboard-Report', permission_actions_enum_1.PermissionActions.READ),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.REPORT_DASHBOARD_SHIPMENT_PERFORMANCE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DashboardReportMessageController.prototype, "getShipmentPerformance", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Dashboard-Report', permission_actions_enum_1.PermissionActions.READ),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.REPORT_DASHBOARD_REVENUE_TRENDS),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DashboardReportMessageController.prototype, "getRevenueTrends", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Dashboard-Report', permission_actions_enum_1.PermissionActions.READ),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.REPORT_DASHBOARD_BRANCH_PERFORMANCE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DashboardReportMessageController.prototype, "getBranchPerformance", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Dashboard-Report', permission_actions_enum_1.PermissionActions.READ),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.REPORT_DASHBOARD_DRIVER_PERFORMANCE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DashboardReportMessageController.prototype, "getDriverPerformance", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Dashboard-Report', permission_actions_enum_1.PermissionActions.READ),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.REPORT_DASHBOARD_BRANCH_SUMMARY),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DashboardReportMessageController.prototype, "getBranchDashboardSummary", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Dashboard-Report', permission_actions_enum_1.PermissionActions.READ),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.REPORT_DASHBOARD_STAFF_SUMMARY),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DashboardReportMessageController.prototype, "getStaffDashboardSummary", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Dashboard-Report', permission_actions_enum_1.PermissionActions.READ),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.REPORT_DASHBOARD_ORDER_SUMMARY),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DashboardReportMessageController.prototype, "getOrderDashboardSummary", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Dashboard-Report', permission_actions_enum_1.PermissionActions.READ),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.REPORT_DASHBOARD_CUSTOMER_SUMMARY),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DashboardReportMessageController.prototype, "getCustomerDashboardSummary", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Dashboard-Report', permission_actions_enum_1.PermissionActions.READ),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.REPORT_DASHBOARD_REVENUE_SUMMARY),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DashboardReportMessageController.prototype, "getReportOverview", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Dashboard-Report', permission_actions_enum_1.PermissionActions.READ),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.REPORT_DASHBOARD_FLEET_SUMMARY),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DashboardReportMessageController.prototype, "getFleetSummary", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Dashboard-Report', permission_actions_enum_1.PermissionActions.READ),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.REPORT_DASHBOARD_DISPATCH_SUMMARY),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DashboardReportMessageController.prototype, "getDispatchSummary", null);
exports.DashboardReportMessageController = DashboardReportMessageController = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [dashboard_service_1.DashboardReportService])
], DashboardReportMessageController);
//# sourceMappingURL=dashboard.controller.js.map