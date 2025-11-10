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
exports.AccessControlMessageController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const contracts_1 = require("../../contracts");
const access_control_usecase_impl_1 = require("./access_control.usecase.impl");
const types_1 = require("../../common/types");
const check_permission_decorator_1 = require("../../common/decorator/check-permission.decorator");
const permission_guard_1 = require("../../common/permission.guard");
const permission_actions_enum_1 = require("../../contracts/permission-actions.enum");
const rate_limit_guard_1 = require("../../common/rate-limit.guard");
let AccessControlMessageController = class AccessControlMessageController {
    constructor(usecases) {
        this.usecases = usecases;
    }
    async findRoleById(payload) {
        const result = await this.usecases.getRole(payload.id);
        return types_1.IResponse.success('Role fetched successfully', result);
    }
    async findAllRoles(payload) {
        const { page = 1, pageSize = 10, search } = payload;
        const result = await this.usecases.getAllRoles(page, pageSize, search);
        return types_1.IResponse.success('Roles fetched successfully', result.roles, result.pagination);
    }
    async createRole(payload) {
        const result = await this.usecases.createRole(payload.data);
        return types_1.IResponse.success('Role created successfully', result);
    }
    async updateRole(payload) {
        const result = await this.usecases.updateRole(payload.id, payload.data);
        return types_1.IResponse.success('Role updated successfully', result);
    }
    async deleteRole(payload) {
        const result = await this.usecases.deleteRole(payload.id);
        return types_1.IResponse.success('Role deleted successfully', result);
    }
    async findPermissionById(payload) {
        const result = await this.usecases.getPermission(payload.id);
        return types_1.IResponse.success('Permission fetched successfully', result);
    }
    async findAllPermissions(payload) {
        const { page = 1, pageSize = 10, search } = payload;
        const result = await this.usecases.getAllPermissions(page, pageSize, search);
        return types_1.IResponse.success('Permissions fetched successfully', result.permissions, result.pagination);
    }
    async createPermission(payload) {
        const result = await this.usecases.createPermission(payload.data);
        return types_1.IResponse.success('Permission created successfully', result);
    }
    async updatePermission(payload) {
        const result = await this.usecases.updatePermission(payload.id, payload.data);
        return types_1.IResponse.success('Permission updated successfully', result);
    }
    async deletePermission(payload) {
        const result = await this.usecases.deletePermission(payload.id);
        return types_1.IResponse.success('Permission deleted successfully', result);
    }
    async assignPermissionsToRole(payload) {
        const result = await this.usecases.assignPermissionsToRole(payload.data);
        return types_1.IResponse.success('Permissions assigned to role successfully', result);
    }
    async updatePermissionFromRole(payload) {
        const result = await this.usecases.updatedPermissionFromRole(payload.roleId, payload.data);
        return types_1.IResponse.success('Permission updated from role successfully', result);
    }
    async removePermissionFromRole(payload) {
        const result = await this.usecases.removePermissionFromRole(payload.roleId, payload.permissionId);
        return types_1.IResponse.success('Permission removed from role successfully', result);
    }
    async assignUserRole(payload) {
        const result = await this.usecases.assignRoleToUser(payload.data.userId, payload.data.roleId);
        return types_1.IResponse.success('Role assigned to user successfully', result);
    }
};
exports.AccessControlMessageController = AccessControlMessageController;
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Role', permission_actions_enum_1.PermissionActions.READ),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.ROLE_FIND_BY_ID),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AccessControlMessageController.prototype, "findRoleById", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Role', permission_actions_enum_1.PermissionActions.READ),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.ROLE_FIND_ALL),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AccessControlMessageController.prototype, "findAllRoles", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Role', permission_actions_enum_1.PermissionActions.CREATE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.ROLE_CREATE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AccessControlMessageController.prototype, "createRole", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Role', permission_actions_enum_1.PermissionActions.UPDATE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.ROLE_UPDATE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AccessControlMessageController.prototype, "updateRole", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Role', permission_actions_enum_1.PermissionActions.DELETE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.ROLE_DELETE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AccessControlMessageController.prototype, "deleteRole", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Permission', permission_actions_enum_1.PermissionActions.READ),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.PERMISSION_FIND_BY_ID),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AccessControlMessageController.prototype, "findPermissionById", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Permission', permission_actions_enum_1.PermissionActions.READ),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.PERMISSION_FIND_ALL),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AccessControlMessageController.prototype, "findAllPermissions", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Permission', permission_actions_enum_1.PermissionActions.CREATE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.PERMISSION_CREATE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AccessControlMessageController.prototype, "createPermission", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Permission', permission_actions_enum_1.PermissionActions.UPDATE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.PERMISSION_UPDATE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AccessControlMessageController.prototype, "updatePermission", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Permission', permission_actions_enum_1.PermissionActions.DELETE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.PERMISSION_DELETE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AccessControlMessageController.prototype, "deletePermission", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('PermissionRole', permission_actions_enum_1.PermissionActions.CREATE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.ROLE_ASSIGN_PERMISSIONS),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AccessControlMessageController.prototype, "assignPermissionsToRole", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('PermissionRole', permission_actions_enum_1.PermissionActions.UPDATE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.ROLE_UPDATE_PERMISSION),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AccessControlMessageController.prototype, "updatePermissionFromRole", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('PermissionRole', permission_actions_enum_1.PermissionActions.DELETE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.ROLE_REMOVE_PERMISSION),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AccessControlMessageController.prototype, "removePermissionFromRole", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('PermissionRole', permission_actions_enum_1.PermissionActions.CREATE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.ROLE_ASSIGN_USER),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AccessControlMessageController.prototype, "assignUserRole", null);
exports.AccessControlMessageController = AccessControlMessageController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [access_control_usecase_impl_1.AccessControlUsecaseImpl])
], AccessControlMessageController);
//# sourceMappingURL=access_control.controller.js.map