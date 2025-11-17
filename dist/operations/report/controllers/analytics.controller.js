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
exports.AnalyticsController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const check_permission_decorator_1 = require("../../../common/decorator/check-permission.decorator");
const permission_guard_1 = require("../../../common/permission.guard");
const contracts_1 = require("../../../contracts");
const permission_actions_enum_1 = require("../../../contracts/permission-actions.enum");
const rate_limit_guard_1 = require("../../../common/rate-limit.guard");
let AnalyticsController = class AnalyticsController {
    async getShipmentSummary(payload) { }
    async getShipmentStatusBreakdown(payload) { }
    async getShipmentByType(payload) { }
    async getShipmentByCustomer(payload) { }
    async getDelayedShipments(payload) { }
    async getBranchOverview(payload) { }
};
exports.AnalyticsController = AnalyticsController;
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Analytics-Report', permission_actions_enum_1.PermissionActions.READ),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.REPORT_SHIPMENT_SUMMARY),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getShipmentSummary", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Analytics-Report', permission_actions_enum_1.PermissionActions.READ),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.REPORT_SHIPMENT_STATUS_BREAKDOWN),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getShipmentStatusBreakdown", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Analytics-Report', permission_actions_enum_1.PermissionActions.READ),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.REPORT_SHIPMENT_BY_TYPE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getShipmentByType", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Analytics-Report', permission_actions_enum_1.PermissionActions.READ),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.REPORT_SHIPMENT_BY_CUSTOMER),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getShipmentByCustomer", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Analytics-Report', permission_actions_enum_1.PermissionActions.READ),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.REPORT_SHIPMENT_DELAYED),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getDelayedShipments", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Performance-Report', permission_actions_enum_1.PermissionActions.READ),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.REPORT_PERFORMANCE_BRANCH_OVERVIEW),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getBranchOverview", null);
exports.AnalyticsController = AnalyticsController = __decorate([
    (0, common_1.Controller)('analytics')
], AnalyticsController);
//# sourceMappingURL=analytics.controller.js.map