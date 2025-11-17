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
exports.DispatchMessageController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const contracts_1 = require("../../contracts");
const dispatch_usecase_impl_1 = require("./dispatch.usecase.impl");
const types_1 = require("../../common/types");
const check_permission_decorator_1 = require("../../common/decorator/check-permission.decorator");
const permission_guard_1 = require("../../common/permission.guard");
const permission_actions_enum_1 = require("../../contracts/permission-actions.enum");
const rate_limit_guard_1 = require("../../common/rate-limit.guard");
let DispatchMessageController = class DispatchMessageController {
    constructor(usecases) {
        this.usecases = usecases;
    }
    async assignDriverForPickup(payoad) {
        const userId = payoad.user?.sub;
        return this.usecases.assignDriverForPickup(payoad.data, userId);
    }
    async createBatchDispatch(payload) {
        const userId = payload.user?.sub;
        const result = await this.usecases.createBatchDispatch(payload.data, userId);
        return types_1.IResponse.success('Batch Dispatch created successfully', result);
    }
    async findDispatches(payload) {
        const result = await this.usecases.getBatches(payload.query);
        return types_1.IResponse.success('Batch Dispatch Fetched successfully', result);
    }
    async addOrdersToBatch(payload) {
        const { batchId, newOrderIds, data, user } = payload;
        const userId = user.sub;
        return this.usecases.addOrdersToBatch(batchId, newOrderIds, userId, data);
    }
    async assignOfficerToBatch(payload) {
        const userId = payload.user?.sub;
        return this.usecases.confirmDispatch(payload.data, userId);
    }
    async collectBatchByCargoOfficer(payload) {
        const userId = payload.user?.sub;
        return this.usecases.collectBatchByCargoOfficer(payload.data, userId);
    }
    async handoverBatchesToAirport(payload) {
        const userId = payload.user?.sub;
        return this.usecases.deliverBatchToAirport(payload.data, userId);
    }
    async collectFromAirport(payload) {
        const userId = payload.user?.sub;
        return this.usecases.scanOrder(payload.data.scannedBy, payload.data.token, userId);
    }
    async comapreOrders(payload) {
        const userId = payload.user?.sub;
        return this.usecases.compareOrders(payload.officerId, userId);
    }
    async arriveAndInbound(payload) {
        return this.usecases.confirmHandover(payload.data);
    }
    async getDeliveredAndOnGoingDispatches(payload) {
        const userId = payload.user?.sub;
        return this.usecases.getDeliveredAndOnGoingDispatches(userId);
    }
    async assignDriverForDelivery(payload) {
        const userId = payload.user?.sub;
        return this.usecases.assignDriverToOrder(payload.data, userId);
    }
    async lastMileDelivery(payload) {
        const userId = payload.user?.sub;
        return this.usecases.lastMileDelivery(payload.data.orderId, payload.data.driverId, userId, payload.data.notes);
    }
    async completeDelivery(payload) {
        const userId = payload.user?.sub;
        const result = await this.usecases.completeDelivery(payload.data, userId);
        return types_1.IResponse.success('Delivery completed successfully', result);
    }
    async removeDriverFromOrder(payload) {
        const result = await this.usecases.removeDriverFromOrder(payload.orderId);
        return types_1.IResponse.success('Driver removed successfully', result);
    }
    async changeDriverForOrder(payload) {
        const result = await this.usecases.changeDriverForOrder(payload.data);
        return types_1.IResponse.success('Driver changed successfully', result);
    }
    async generateQrCode(payload) {
        const result = await this.usecases.prepareQRCodes(payload.data);
        return types_1.IResponse.success('Qr code generated successfully', result);
    }
    async createDriver(payload) {
        const result = await this.usecases.createDriver(payload.data);
        return types_1.IResponse.success('Driver with id [' +
            payload.data.userId +
            '] is successfully created for vehicle with id [' +
            payload.data.vehicleId +
            '].', result);
    }
    async findDriver(payload) {
        const result = await this.usecases.findDriver(payload.query);
        return types_1.IResponse.success('Officer created successfully', result);
    }
    async createDriverAssignmentRequests(payload) {
        const userId = payload.user?.sub;
        await this.usecases.createDriverAssignmentRequests(payload.data, userId);
        return types_1.IResponse.success(`Driver assignment requests created successfully for order ${payload.data.orderId} and notification sent to drivers`);
    }
    async driverAccept(payload) {
        const userId = payload.user?.sub;
        const result = await this.usecases.driverAccept(payload.orderId, userId);
        return types_1.IResponse.success('Successfully driver is assigned to order', result);
    }
};
exports.DispatchMessageController = DispatchMessageController;
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Dispatch', permission_actions_enum_1.PermissionActions.CREATE, permission_actions_enum_1.ScopeAction.ASSIGN),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.DISPATCH_ASSIGN_DRIVER_FOR_PICKUP),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DispatchMessageController.prototype, "assignDriverForPickup", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Dispatch', permission_actions_enum_1.PermissionActions.CREATE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.DISPATCH_APPROVE_CATEGORIZATION),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DispatchMessageController.prototype, "createBatchDispatch", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Dispatch', permission_actions_enum_1.PermissionActions.READ),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.DISPATCH_FIND_ALL),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DispatchMessageController.prototype, "findDispatches", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Dispatch', permission_actions_enum_1.PermissionActions.UPDATE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.DISPATCH_ADD_ORDERS_TO_BATCH),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DispatchMessageController.prototype, "addOrdersToBatch", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Dispatch', permission_actions_enum_1.PermissionActions.CREATE, permission_actions_enum_1.ScopeAction.ASSIGN),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.DISPATCH_ASSIGN_OFFICER_TO_BATCH),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DispatchMessageController.prototype, "assignOfficerToBatch", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Dispatch', permission_actions_enum_1.PermissionActions.UPDATE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.DISPATCH_COLLECT_BATCH_BY_CARGO_OFFICER),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DispatchMessageController.prototype, "collectBatchByCargoOfficer", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Dispatch', permission_actions_enum_1.PermissionActions.UPDATE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.DISPATCH_HAND_OVER_BATCHES_TO_AIRPORT),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DispatchMessageController.prototype, "handoverBatchesToAirport", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Dispatch', permission_actions_enum_1.PermissionActions.UPDATE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.DISPATCH_COLLECT_FROM_AIRPORT),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DispatchMessageController.prototype, "collectFromAirport", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Dispatch', permission_actions_enum_1.PermissionActions.UPDATE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.DISPATCH_COMPARE_SCANNED_ORDERS),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DispatchMessageController.prototype, "comapreOrders", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Dispatch', permission_actions_enum_1.PermissionActions.UPDATE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.DISPATCH_CONFIRM_ARRIVAL_AND_HANDOVER),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DispatchMessageController.prototype, "arriveAndInbound", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Dispatch', permission_actions_enum_1.PermissionActions.READ),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.DISPATCH_FIND_DELIVERED_AND_ONGOING),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DispatchMessageController.prototype, "getDeliveredAndOnGoingDispatches", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Dispatch', permission_actions_enum_1.PermissionActions.CREATE, permission_actions_enum_1.ScopeAction.ASSIGN),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.DISPATCH_ASSIGN_DRIVER_FOR_DELIVERY),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DispatchMessageController.prototype, "assignDriverForDelivery", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Dispatch', permission_actions_enum_1.PermissionActions.CREATE, permission_actions_enum_1.ScopeAction.DELIVERY),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.DISPATCH_ACCEPT_LAST_MILE_DELIVERY),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DispatchMessageController.prototype, "lastMileDelivery", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Dispatch', permission_actions_enum_1.PermissionActions.CREATE, permission_actions_enum_1.ScopeAction.DELIVERY),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.DISPATCH_COMPLETE_DELIVERY),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DispatchMessageController.prototype, "completeDelivery", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Dispatch', permission_actions_enum_1.PermissionActions.DELETE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.DISPATCH_REMOVE_DRIVER_FROM_ORDER),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DispatchMessageController.prototype, "removeDriverFromOrder", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Dispatch', permission_actions_enum_1.PermissionActions.UPDATE, permission_actions_enum_1.ScopeAction.APPROVE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.DISPATCH_CHANGE_DRIVER_FOR_ORDER),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DispatchMessageController.prototype, "changeDriverForOrder", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Dispatch', permission_actions_enum_1.PermissionActions.CREATE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.DISPATCH_GENERATE_QR_CODE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DispatchMessageController.prototype, "generateQrCode", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Dispatch', permission_actions_enum_1.PermissionActions.CREATE, permission_actions_enum_1.ScopeAction.APPROVE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.DISPATCH_CREATE_DRIVER),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DispatchMessageController.prototype, "createDriver", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Dispatch', permission_actions_enum_1.PermissionActions.READ),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.DISPATCH_FIND_DRIVER),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DispatchMessageController.prototype, "findDriver", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Dispatch', permission_actions_enum_1.PermissionActions.CREATE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.DISPATCH_CREATE_ASSIGNEMENT_REQUEST),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DispatchMessageController.prototype, "createDriverAssignmentRequests", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Dispatch', permission_actions_enum_1.PermissionActions.UPDATE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.DISPATCH_ACCEPT_ASSIGNEMENT_REQUEST),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DispatchMessageController.prototype, "driverAccept", null);
exports.DispatchMessageController = DispatchMessageController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [dispatch_usecase_impl_1.DispatchUseCasesImpl])
], DispatchMessageController);
//# sourceMappingURL=dispatch.controller.js.map