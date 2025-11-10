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
exports.OrderMessageController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const contracts_1 = require("../../contracts");
const order_usecase_impl_1 = require("./order.usecase.impl");
const types_1 = require("../../common/types");
const check_permission_decorator_1 = require("../../common/decorator/check-permission.decorator");
const permission_guard_1 = require("../../common/permission.guard");
const permission_actions_enum_1 = require("../../contracts/permission-actions.enum");
const rate_limit_guard_1 = require("../../common/rate-limit.guard");
const public_decorator_1 = require("../../common/decorator/public.decorator");
let OrderMessageController = class OrderMessageController {
    constructor(orderUseCases) {
        this.orderUseCases = orderUseCases;
    }
    async createOrder(payload) {
        const userId = payload.user?.sub;
        const result = await this.orderUseCases.createOrder(payload.data, userId);
        return types_1.IResponse.success('Order created successfully', result);
    }
    async createUserOrder(payload) {
        const result = await this.orderUseCases.createUserOrder(payload.data);
        return types_1.IResponse.success('Order created successfully.', result);
    }
    async acceptDropOffOrder(payload) {
        console.log('data: ', payload.data);
        const trackingCode = payload.data?.trackingCode;
        console.log('trackingCode: ', trackingCode);
        const userId = payload.user?.sub;
        const result = await this.orderUseCases.acceptDropOff(trackingCode);
        return types_1.IResponse.success('Drop Off Order accepted successfully', result);
    }
    async confirmPickup(payload) {
        const { orderId, driverId } = payload.data;
        const userId = payload.user?.sub;
        const result = await this.orderUseCases.confirmPickupOrder(orderId, driverId, userId);
        return types_1.IResponse.success('Pick Up Order Confirmed successfully', result);
    }
    async validateOrder(payload) {
        const { id, data } = payload;
        const userId = payload.user?.sub;
        const { officerId, updates } = payload.data;
        const result = await this.orderUseCases.validateOrder(id, data, userId);
        return types_1.IResponse.success('Order validated successfully', result);
    }
    async markUnusualOrder(payload) {
        const { orderId, data } = payload;
        const result = await this.orderUseCases.markUnusualOrder(payload.orderId, payload.data);
        return types_1.IResponse.success('Order Marked as Unusual successfully', result);
    }
    async updateOrder(payload) {
        const userId = payload.user?.sub;
        const result = await this.orderUseCases.updateOrder(payload.id, payload.data, userId);
        return types_1.IResponse.success('Order updated successfully', result);
    }
    async approveOrder(payload) {
        const orderId = payload.data.orderId;
        const reason = payload.data.reason;
        console.log('Order : ', orderId);
        const userId = payload.user?.sub;
        const result = await this.orderUseCases.approveOrder(orderId, reason, userId);
        return types_1.IResponse.success(`Order with id: ${orderId} approved by Operation Manager.`, result);
    }
    async cancelOrder(payload) {
        console.log('payload: ', payload);
        const { data } = payload;
        const orderId = data.orderId;
        const userId = payload.user?.sub;
        const result = await this.orderUseCases.cancelOrder(data, userId);
        return types_1.IResponse.success(`Order with id: ${orderId} cancelled.`, result);
    }
    async getPendingApproval(payload) {
        const result = await this.orderUseCases.getPendingApproval(payload.query);
        return types_1.IResponse.success(`Order pending for approval fetched successfully.`, result.approvals, result.pagination);
    }
    async addException(payload) {
        const orderId = payload.data.orderId;
        const userId = payload.user?.sub;
        const result = await this.orderUseCases.addException(payload.data, userId);
        return types_1.IResponse.success(`Order with id: ${orderId} Added to Exception successfully.`, result);
    }
    async getException(payload) {
        const result = await this.orderUseCases.getException(payload.query);
        return types_1.IResponse.success(`Order Exception fetched successfully.`, result.orders, result.pagination);
    }
    async solveExceptions(payload) {
        const { orderId, data } = payload;
        const userId = payload.user?.sub;
        const result = await this.orderUseCases.solveExceptions(orderId, data, userId);
        return types_1.IResponse.success(`Order exception resolved successfully.`, result);
    }
    async getOrdersGroupedByScope(payload) {
        const result = await this.orderUseCases.getOrdersGroupedByScope(payload.query);
        return types_1.IResponse.success('Categorization Orders fetched successfully ', result);
    }
    async getAllOrders(payload) {
        const result = await this.orderUseCases.getAllOrders(payload.query);
        return types_1.IResponse.success('Orders fetched successfully', result.orders, result.pagination);
    }
    async getOrdersStatusLog(payload) {
        const result = await this.orderUseCases.getOrderStatusLog(payload.query);
        return types_1.IResponse.success('Orders Log with status fetched successfully', result.orders, result.pagination);
    }
    async getOrderById(payload) {
        const result = await this.orderUseCases.getOrderById(payload.id);
        return types_1.IResponse.success('Order fetched successfully', result);
    }
    async trackOrder(payload) {
        const result = await this.orderUseCases.trackOrder(payload.code);
        return types_1.IResponse.success('Order Tracking fetched successfully', result);
    }
    async trackUserOrder(payload) {
        const userId = payload.user?.sub;
        const result = await this.orderUseCases.trackUserOrder(payload.code, userId);
        return types_1.IResponse.success('Order Tracking fetched successfully', result);
    }
    async getMyOrders(payload) {
        const user = payload.user;
        const userId = user.sub;
        const result = await this.orderUseCases.getMyOrders(userId, payload.query);
        return types_1.IResponse.success('Orders fetched successfully', result.orders, result.pagination);
    }
};
exports.OrderMessageController = OrderMessageController;
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Order', permission_actions_enum_1.PermissionActions.CREATE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.ORDER_CREATE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrderMessageController.prototype, "createOrder", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.ORDER_CREATE_NOT_LOGGED_IN_CUSTOMER),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrderMessageController.prototype, "createUserOrder", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Order', permission_actions_enum_1.PermissionActions.UPDATE, permission_actions_enum_1.ScopeAction.FULL),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.ORDER_ACCEPT_DROP_OFF),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrderMessageController.prototype, "acceptDropOffOrder", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Order', permission_actions_enum_1.PermissionActions.UPDATE, permission_actions_enum_1.ScopeAction.DELIVERY),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.ORDER_CONFIRM_PICKUP),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrderMessageController.prototype, "confirmPickup", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Order', permission_actions_enum_1.PermissionActions.UPDATE, permission_actions_enum_1.ScopeAction.FULL),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.ORDER_VALIDATE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrderMessageController.prototype, "validateOrder", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Order', permission_actions_enum_1.PermissionActions.UPDATE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.ORDER_MARK_UNUSUAL),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrderMessageController.prototype, "markUnusualOrder", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Order', permission_actions_enum_1.PermissionActions.UPDATE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.ORDER_UPDATE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrderMessageController.prototype, "updateOrder", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Order', permission_actions_enum_1.PermissionActions.UPDATE, permission_actions_enum_1.ScopeAction.APPROVE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.ORDER_APPROVE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrderMessageController.prototype, "approveOrder", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Order', permission_actions_enum_1.PermissionActions.UPDATE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.ORDER_CANCEL),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrderMessageController.prototype, "cancelOrder", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Order', permission_actions_enum_1.PermissionActions.READ, permission_actions_enum_1.ScopeAction.APPROVE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.ORDER_FIND_PENDING_APPROVAL),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrderMessageController.prototype, "getPendingApproval", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Order', permission_actions_enum_1.PermissionActions.CREATE, permission_actions_enum_1.ScopeAction.FULL),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.ORDER_ADD_EXCEPTION),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrderMessageController.prototype, "addException", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Order', permission_actions_enum_1.PermissionActions.READ),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.ORDER_FIND_EXCEPTIONS),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrderMessageController.prototype, "getException", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Order', permission_actions_enum_1.PermissionActions.UPDATE, permission_actions_enum_1.ScopeAction.FULL),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.ORDER_REMOVE_EXCEPTION),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrderMessageController.prototype, "solveExceptions", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Order', permission_actions_enum_1.PermissionActions.READ, permission_actions_enum_1.ScopeAction.FULL),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.ORDER_FIND_CATEGORICAL),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrderMessageController.prototype, "getOrdersGroupedByScope", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Order', permission_actions_enum_1.PermissionActions.READ, permission_actions_enum_1.ScopeAction.FULL),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.ORDER_FIND_ALL),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrderMessageController.prototype, "getAllOrders", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Order', permission_actions_enum_1.PermissionActions.READ, permission_actions_enum_1.ScopeAction.FULL),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.ORDER_FIND_STATUS_LOG),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrderMessageController.prototype, "getOrdersStatusLog", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Order', permission_actions_enum_1.PermissionActions.READ),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.ORDER_FIND_BY_ID),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrderMessageController.prototype, "getOrderById", null);
__decorate([
    (0, common_1.UseGuards)(rate_limit_guard_1.RateLimitGuard),
    (0, public_decorator_1.Public)(),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.ORDER_FIND_BY_TRACK_CODE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrderMessageController.prototype, "trackOrder", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Order', permission_actions_enum_1.PermissionActions.READ),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.ORDER_FIND_BY_USER_AND_TRACK_CODE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrderMessageController.prototype, "trackUserOrder", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Order', permission_actions_enum_1.PermissionActions.READ),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.ORDER_FIND_MY_ORDERS),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrderMessageController.prototype, "getMyOrders", null);
exports.OrderMessageController = OrderMessageController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [order_usecase_impl_1.OrderUseCasesImpl])
], OrderMessageController);
//# sourceMappingURL=order.controller.js.map