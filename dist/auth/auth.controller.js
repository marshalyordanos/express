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
var AuthMessageController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthMessageController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const contracts_1 = require("../contracts");
const auth_usecase_impl_1 = require("./auth.usecase.impl");
const auth_entity_1 = require("./auth.entity");
const public_decorator_1 = require("../common/decorator/public.decorator");
const types_1 = require("../common/types");
const check_permission_decorator_1 = require("../common/decorator/check-permission.decorator");
const permission_guard_1 = require("../common/permission.guard");
const permission_actions_enum_1 = require("../contracts/permission-actions.enum");
const rate_limit_guard_1 = require("../common/rate-limit.guard");
let AuthMessageController = AuthMessageController_1 = class AuthMessageController {
    constructor(usecases) {
        this.usecases = usecases;
        this.logger = new common_1.Logger(AuthMessageController_1.name);
    }
    async register(dto) {
        const user = await this.usecases.register(dto);
        return new types_1.IResponse(true, 'User is registered Succuessfuly', user);
    }
    async login(payload) {
        const { dto } = payload;
        const data = await this.usecases.login(dto);
        return new types_1.IResponse(true, 'User is logged in Succuessfuly', data);
    }
    async loginMobile(payload) {
        const { dto } = payload;
        const data = await this.usecases.loginMobile(dto);
        return new types_1.IResponse(true, 'User is logged in Succuessfuly', data);
    }
    async refreshToken(data) {
        const user = data.user;
        if (!user?.sub)
            throw new common_1.ForbiddenException('Unauthorized');
        const tokens = await this.usecases.refreshToken(user?.sub, data.refreshToken);
        return new types_1.IResponse(true, 'Token has been refreshed!', tokens);
    }
    async getAuthenticatedUser(data) {
        const user = data.user;
        if (!user?.sub)
            throw new common_1.ForbiddenException('Unauthorized');
        const userData = await this.usecases.getAuthenticatedUser(user?.sub);
        return new types_1.IResponse(true, 'User Fetched successfully!', userData);
    }
    async changePassword(data) {
        const user = data.user;
        const body = data.body;
        if (!user?.sub)
            throw new common_1.ForbiddenException('Unauthorized');
        await this.usecases.changePassword(user?.sub, body);
        return new types_1.IResponse(true, 'Password changed successfully. Please log in again.');
    }
    async superAdmin(dto) {
        const user = await this.usecases.createSuperAdmin();
        return new types_1.IResponse(true, 'User is registered Succuessfuly', user);
    }
};
exports.AuthMessageController = AuthMessageController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.AUTH_REGISTER),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_entity_1.AuthRegisterDto]),
    __metadata("design:returntype", Promise)
], AuthMessageController.prototype, "register", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.UseGuards)(rate_limit_guard_1.RateLimitGuard),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.AUTH_LOGIN),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthMessageController.prototype, "login", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.UseGuards)(rate_limit_guard_1.RateLimitGuard),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.AUTH_LOGIN_MOBILE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthMessageController.prototype, "loginMobile", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Auth', permission_actions_enum_1.PermissionActions.READ),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.AUTH_REFRESH_TOKEN),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthMessageController.prototype, "refreshToken", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Auth', permission_actions_enum_1.PermissionActions.READ),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.AUTH_FIND_AUTHENTICATED_USER),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthMessageController.prototype, "getAuthenticatedUser", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Auth', permission_actions_enum_1.PermissionActions.UPDATE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.AUTH_CHANGE_PASSWORD),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthMessageController.prototype, "changePassword", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, microservices_1.MessagePattern)('SUPPER_ADDMIN'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthMessageController.prototype, "superAdmin", null);
exports.AuthMessageController = AuthMessageController = AuthMessageController_1 = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [auth_usecase_impl_1.AuthUseCaseImpl])
], AuthMessageController);
//# sourceMappingURL=auth.controller.js.map