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
exports.FleetMessageController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const contracts_1 = require("../../contracts");
const fleet_usecase_impl_1 = require("./fleet.usecase.impl");
const types_1 = require("../../common/types");
const check_permission_decorator_1 = require("../../common/decorator/check-permission.decorator");
const permission_guard_1 = require("../../common/permission.guard");
const permission_actions_enum_1 = require("../../contracts/permission-actions.enum");
const rate_limit_guard_1 = require("../../common/rate-limit.guard");
let FleetMessageController = class FleetMessageController {
    constructor(usecases) {
        this.usecases = usecases;
    }
    async createVehicle(payload) {
        const data = await this.usecases.createVehicle(payload.data);
        return types_1.IResponse.success('Vehicles created successfully', data, null);
    }
    async getAllVehicles(payload) {
        const { page = 1, pageSize = 10, search, status } = payload;
        const result = await this.usecases.getAllVehicles(page, pageSize, status, search);
        return types_1.IResponse.success('Vehicles fetched successfully', result.vehicles, result.pagination);
    }
    async getVehicleById(payload) {
        const data = await this.usecases.getVehicleById(payload.id);
        return types_1.IResponse.success('Vehicle fetched successfully', data, null);
    }
    async updateVehicle(payload) {
        const data = await this.usecases.updateVehicle(payload.id, payload.data);
        return types_1.IResponse.success('Vehicle updated successfully', data, null);
    }
    async deleteVehicle(payload) {
        await this.usecases.deleteVehicle(payload.id);
        return types_1.IResponse.success('Vehicle deleted successfully', null, null);
    }
    async assignVehicle(payload) {
        const vehicle = await this.usecases.assignVehicle(payload.data);
        return types_1.IResponse.success('Driver assigned successfully', vehicle, null);
    }
    async unassignVehicle(payload) {
        const vehicle = await this.usecases.unassignVehicle(payload.vehicleId);
        return types_1.IResponse.success('Driver unassigned successfully', vehicle, null);
    }
    async getVehiclesByDriver(payload) {
        const vehicles = await this.usecases.getVehiclesByDriver(payload.driverId);
        return types_1.IResponse.success('Vehicles fetched successfully', vehicles, null);
    }
    async logVehicleMaintenance(payload) {
        const fleetLog = await this.usecases.logVehicleMaintenance(payload.data);
        return types_1.IResponse.success('fleetLog added successfully', fleetLog, null);
    }
    async getMaintenanceHistory(payload) {
        const fleetLogs = await this.usecases.getVehicleMaintenanceHistory(payload.vehicleId, payload.query);
        return types_1.IResponse.success('fleetLog fetched successfully', fleetLogs, null);
    }
    async getFleetSummary() {
        const fleetSummary = await this.usecases.getFleetSummary();
        return types_1.IResponse.success('Fleet Summary!', fleetSummary, null);
    }
    async getAvailableVehicles() {
        const availableVehicle = await this.usecases.getAvailableVehicles();
        return types_1.IResponse.success('Available Vehicles Fetched Successfully.', availableVehicle, null);
    }
    async getVehicleHistory(payload) {
        const vehicleHistory = await this.usecases.getVehicleHistory(payload.vehicleId);
        return types_1.IResponse.success('Vehicle History Fetched Successfully.', vehicleHistory, null);
    }
    async retireVehicle(payload) {
        const retireVehicle = await this.usecases.retireVehicle(payload.vehicleId);
        return types_1.IResponse.success('Retire Vehicle Successfully.', retireVehicle, null);
    }
    async getFleetAlerts() {
        const alerts = await this.usecases.getFleetAlerts();
        return types_1.IResponse.success('Fleet Alerts Fetched Successfully.', alerts, null);
    }
    async getDriverVehicleHistory(payload) {
        const vehicleHistory = await this.usecases.getDriverVehicleHistory(payload.driverId);
        return types_1.IResponse.success('Driver Vehicle History Fetched Successfully.', vehicleHistory, null);
    }
};
exports.FleetMessageController = FleetMessageController;
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Fleet', permission_actions_enum_1.PermissionActions.CREATE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.FLEET_CREATE_VEHICLE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FleetMessageController.prototype, "createVehicle", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Fleet', permission_actions_enum_1.PermissionActions.READ),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.FLEET_GET_ALL_VEHICLES),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FleetMessageController.prototype, "getAllVehicles", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Fleet', permission_actions_enum_1.PermissionActions.CREATE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.FLEET_GET_VEHICLE_BY_ID),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FleetMessageController.prototype, "getVehicleById", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Fleet', permission_actions_enum_1.PermissionActions.UPDATE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.FLEET_UPDATE_VEHICLE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FleetMessageController.prototype, "updateVehicle", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Fleet', permission_actions_enum_1.PermissionActions.DELETE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.FLEET_DELETE_VEHICLE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FleetMessageController.prototype, "deleteVehicle", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Fleet', permission_actions_enum_1.PermissionActions.CREATE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.FLEET_ASSIGN_VEHICLE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FleetMessageController.prototype, "assignVehicle", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Fleet', permission_actions_enum_1.PermissionActions.CREATE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.FLEET_UNASSIGN_VEHICLE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FleetMessageController.prototype, "unassignVehicle", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Fleet', permission_actions_enum_1.PermissionActions.READ),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.FLEET_GET_DRIVER_VEHICLES),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FleetMessageController.prototype, "getVehiclesByDriver", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Fleet', permission_actions_enum_1.PermissionActions.CREATE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.FLEET_LOG_MAINTENANCE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FleetMessageController.prototype, "logVehicleMaintenance", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Fleet', permission_actions_enum_1.PermissionActions.READ),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.FLEET_GET_MAINTENANCE_HISTORY),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FleetMessageController.prototype, "getMaintenanceHistory", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Fleet', permission_actions_enum_1.PermissionActions.READ),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.FLEET_GET_SUMMARY),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FleetMessageController.prototype, "getFleetSummary", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Fleet', permission_actions_enum_1.PermissionActions.READ),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.FLEET_GET_AVAILABLE_VEHICLES),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FleetMessageController.prototype, "getAvailableVehicles", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Fleet', permission_actions_enum_1.PermissionActions.READ),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.FLEET_GET_VEHICLE_HISTORY),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FleetMessageController.prototype, "getVehicleHistory", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Fleet', permission_actions_enum_1.PermissionActions.READ),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.FLEET_RETIRE_VEHICLE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FleetMessageController.prototype, "retireVehicle", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Fleet', permission_actions_enum_1.PermissionActions.READ),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.FLEET_GET_ALERTS),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FleetMessageController.prototype, "getFleetAlerts", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Fleet', permission_actions_enum_1.PermissionActions.READ),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.FLEET_GET_DRIVER_HISTORY),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FleetMessageController.prototype, "getDriverVehicleHistory", null);
exports.FleetMessageController = FleetMessageController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [fleet_usecase_impl_1.FleetUseCasesImp])
], FleetMessageController);
//# sourceMappingURL=fleet.controller.js.map