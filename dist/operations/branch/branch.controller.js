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
exports.BranchMessageController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const contracts_1 = require("../../contracts");
const types_1 = require("../../common/types");
const branch_useCase_impl_1 = require("./branch.useCase.impl");
const permission_guard_1 = require("../../common/permission.guard");
const permission_actions_enum_1 = require("../../contracts/permission-actions.enum");
const check_permission_decorator_1 = require("../../common/decorator/check-permission.decorator");
const rate_limit_guard_1 = require("../../common/rate-limit.guard");
const public_decorator_1 = require("../../common/decorator/public.decorator");
let BranchMessageController = class BranchMessageController {
    constructor(usecases) {
        this.usecases = usecases;
    }
    async createBranch(payload) {
        const userId = payload?.user?.sub;
        const result = await this.usecases.createBranch(payload.data, userId);
        return new types_1.IResponse(true, 'Branch is created Succuessfuly', result);
    }
    async findBranchById(data) {
        const result = await this.usecases.findBranchById(data.id);
        return types_1.IResponse.success('Branches fetched successfullyy', result);
    }
    async updateBranch(payload) {
        const result = await this.usecases.updateBranch(payload.id, payload.data);
        return new types_1.IResponse(true, 'Branch is Updated Succuessfuly', result);
    }
    async deleteBranch(data) {
        const result = await this.usecases.deleteBranch(data.id);
        return new types_1.IResponse(true, 'Branch is Deleted Succuessfuly', result);
    }
    async assignManager(payload) {
        const result = await this.usecases.assignManager(payload.branchId, payload.managerId);
        return new types_1.IResponse(true, 'Branch Manager assigned Succuessfuly', result);
    }
    async revokeManager(payload) {
        const result = await this.usecases.revokeManager(payload.branchId, payload.managerId);
        return new types_1.IResponse(true, 'Branch Manager revoked Succuessfuly', result);
    }
    async findAllBranches(payload) {
        const branches = await this.usecases.findAllBranch(payload.query);
        return types_1.IResponse.success('Branches fetched successfullyy', branches.branches, branches.pagination);
    }
    async findAllBranchFree(payload) {
        const branches = await this.usecases.findAllBranchFree(payload.query);
        return types_1.IResponse.success('Branches fetched successfullyy', branches.branches, branches.pagination);
    }
};
exports.BranchMessageController = BranchMessageController;
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Branch', permission_actions_enum_1.PermissionActions.CREATE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.BRANCH_CREATE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BranchMessageController.prototype, "createBranch", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Branch', permission_actions_enum_1.PermissionActions.READ),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.BRANCH_FIND_BY_ID),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BranchMessageController.prototype, "findBranchById", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Branch', permission_actions_enum_1.PermissionActions.UPDATE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.BRANCH_UPDATE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BranchMessageController.prototype, "updateBranch", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Branch', permission_actions_enum_1.PermissionActions.DELETE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.BRANCH_DELETE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BranchMessageController.prototype, "deleteBranch", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Branch', permission_actions_enum_1.PermissionActions.CREATE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.BRANCH_ASSIGN_MANAGER),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BranchMessageController.prototype, "assignManager", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Branch', permission_actions_enum_1.PermissionActions.DELETE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.BRANCH_REVOKE_MANAGER),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BranchMessageController.prototype, "revokeManager", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Branch', permission_actions_enum_1.PermissionActions.READ),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.BRANCH_FIND_ALL),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BranchMessageController.prototype, "findAllBranches", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.BRANCH_FIND_ALL_FREE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BranchMessageController.prototype, "findAllBranchFree", null);
exports.BranchMessageController = BranchMessageController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [branch_useCase_impl_1.BranchUseCaseImpl])
], BranchMessageController);
//# sourceMappingURL=branch.controller.js.map