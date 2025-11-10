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
exports.StaffMessageController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const types_1 = require("../../common/types");
const contracts_1 = require("../../contracts");
const staff_useCase_impl_1 = require("./staff.useCase.impl");
const check_permission_decorator_1 = require("../../common/decorator/check-permission.decorator");
const permission_guard_1 = require("../../common/permission.guard");
const permission_actions_enum_1 = require("../../contracts/permission-actions.enum");
const rate_limit_guard_1 = require("../../common/rate-limit.guard");
let StaffMessageController = class StaffMessageController {
    constructor(usecases) {
        this.usecases = usecases;
    }
    async createStaff(payload) {
        const userId = payload?.user?.sub;
        const result = await this.usecases.createStaff(payload.data, userId);
        return types_1.IResponse.success('Staff created successfully', result);
    }
    async findStaffByRole(payload) {
        const result = await this.usecases.findStaffByRole(payload.query, payload.role);
        return types_1.IResponse.success('Staff fetched successfully for role', result.Staffs, result.pagination);
    }
    async findStaff(payload) {
        const result = await this.usecases.findAllStaff(payload.query);
        return types_1.IResponse.success('Staff fetched successfully', result.Staffs, result.pagination);
    }
    async changeUserRole(payload) {
        const result = await this.usecases.changeUserRole(payload.data);
        return types_1.IResponse.success('Role changed successfully', result);
    }
    async deleteStaff(payload) {
        const result = await this.usecases.deleteStaff(payload.id);
        return types_1.IResponse.success('Staff deleted successfully', result);
    }
    async findStaffById(payload) {
        const result = await this.usecases.findStaffById(payload.id);
        return types_1.IResponse.success('User fetched successfully', result);
    }
    async updateStaff(payload) {
        const result = await this.usecases.updateStaff(payload.id, payload.data);
        return types_1.IResponse.success('User updated successfully', result);
    }
    async findStaffByBranch(payload) {
        const result = await this.usecases.findStaffByBranch(payload.query, payload.branchId);
        return types_1.IResponse.success('Users fetched successfully', result.Staffs, result.pagination);
    }
    async assignStaffToBranch(payload) {
        const { staffIds, branchId } = payload.data;
        const result = await this.usecases.assignStaffToBranch(staffIds, branchId);
        return types_1.IResponse.success('Staffs assigned successfully', result);
    }
};
exports.StaffMessageController = StaffMessageController;
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Staff', permission_actions_enum_1.PermissionActions.CREATE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.STAFF_CREATE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StaffMessageController.prototype, "createStaff", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Staff', permission_actions_enum_1.PermissionActions.READ),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.STAFF_FIND_BY_ROLE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StaffMessageController.prototype, "findStaffByRole", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Staff', permission_actions_enum_1.PermissionActions.READ),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.STAFF_FIND_ALL),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StaffMessageController.prototype, "findStaff", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Staff', permission_actions_enum_1.PermissionActions.UPDATE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.USER_CHANGE_ROLE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StaffMessageController.prototype, "changeUserRole", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Staff', permission_actions_enum_1.PermissionActions.DELETE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.STAFF_DELETE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StaffMessageController.prototype, "deleteStaff", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Staff', permission_actions_enum_1.PermissionActions.READ),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.STAFF_FIND_BY_ID),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StaffMessageController.prototype, "findStaffById", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Staff', permission_actions_enum_1.PermissionActions.UPDATE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.STAFF_UPDATE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StaffMessageController.prototype, "updateStaff", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Staff', permission_actions_enum_1.PermissionActions.READ),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.STAFF_FIND_BY_BRANCH),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StaffMessageController.prototype, "findStaffByBranch", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Staff', permission_actions_enum_1.PermissionActions.CREATE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.STAFF_ASSIGN_BRANCH),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StaffMessageController.prototype, "assignStaffToBranch", null);
exports.StaffMessageController = StaffMessageController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [staff_useCase_impl_1.StaffUseCasesImpl])
], StaffMessageController);
//# sourceMappingURL=staff.controller.js.map