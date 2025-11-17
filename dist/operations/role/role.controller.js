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
exports.RoleMessageController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const types_1 = require("../../common/types");
const role_useCase_impl_1 = require("./role.useCase.impl");
const contracts_1 = require("../../contracts");
const check_permission_decorator_1 = require("../../common/decorator/check-permission.decorator");
const permission_guard_1 = require("../../common/permission.guard");
const permission_actions_enum_1 = require("../../contracts/permission-actions.enum");
const rate_limit_guard_1 = require("../../common/rate-limit.guard");
const public_decorator_1 = require("../../common/decorator/public.decorator");
let RoleMessageController = class RoleMessageController {
    constructor(usecases) {
        this.usecases = usecases;
    }
    async createRole(payload) {
        const result = await this.usecases.createRole(payload.data);
        return types_1.IResponse.success('Role created successfully', result);
    }
    async findRole(payload) {
        const result = await this.usecases.findRole(payload.id);
        return types_1.IResponse.success('Role fetched successfully', result);
    }
    async getAllRoles(payload) {
        const user = payload.headers;
        const result = await this.usecases.findAllRoles(payload.query);
        return types_1.IResponse.success('Roles fetched successfully', result.roles, result.pagination);
    }
    async getAllRolesFree(payload) {
        const result = await this.usecases.findAllRoles(payload.query);
        return types_1.IResponse.success('Roles fetched successfully', result.roles, result.pagination);
    }
    async deleteRole(payload) {
        const result = await this.usecases.deleteRole(payload.id);
        return types_1.IResponse.success('Role deleted successfully', result);
    }
    async updateRole(payload) {
        const result = await this.usecases.updateRole(payload.id, payload.data);
        return types_1.IResponse.success('Role updated successfully', result);
    }
};
exports.RoleMessageController = RoleMessageController;
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Role', permission_actions_enum_1.PermissionActions.CREATE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.ROLE_CREATE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RoleMessageController.prototype, "createRole", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.ROLE_FIND_BY_ID),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RoleMessageController.prototype, "findRole", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Role', permission_actions_enum_1.PermissionActions.READ),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.ROLE_FIND_ALL),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RoleMessageController.prototype, "getAllRoles", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.ROLE_FIND_ALL_FREE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RoleMessageController.prototype, "getAllRolesFree", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Role', permission_actions_enum_1.PermissionActions.DELETE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.ROLE_DELETE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RoleMessageController.prototype, "deleteRole", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Role', permission_actions_enum_1.PermissionActions.UPDATE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.ROLE_UPDATE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RoleMessageController.prototype, "updateRole", null);
exports.RoleMessageController = RoleMessageController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [role_useCase_impl_1.RoleUseCaseImpl])
], RoleMessageController);
//# sourceMappingURL=role.controller.js.map