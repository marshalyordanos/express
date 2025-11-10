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
exports.AuthGatewayController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const contracts_1 = require("../contracts");
const auth_entity_1 = require("../auth/auth.entity");
const jwt = require("jsonwebtoken");
let AuthGatewayController = class AuthGatewayController {
    constructor(authClient) {
        this.authClient = authClient;
    }
    async register(dto) {
        try {
            return this.authClient.send(contracts_1.PATTERNS.AUTH_REGISTER, dto);
        }
        catch (error) {
            const err = error;
            const status = err?.statusCode || 500;
            throw new common_1.HttpException(err?.message || 'Internal server error', status);
        }
    }
    async login(dto, req) {
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        return this.authClient.send(contracts_1.PATTERNS.AUTH_LOGIN, { dto, ip });
    }
    async loginMobile(dto, req) {
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        return this.authClient.send(contracts_1.PATTERNS.AUTH_LOGIN_MOBILE, {
            dto,
            ip,
        });
    }
    async refreshToken(req) {
        const authHeader = req.headers['authorization'] || null;
        let token = req.headers['authorization']?.replace('Bearer ', '') || null;
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        let decodedUser = null;
        try {
            decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
        }
        catch (err) {
            throw new common_1.HttpException('Invalid token', common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.authClient.send(contracts_1.PATTERNS.AUTH_REFRESH_TOKEN, {
            refreshToken: token,
            user: decodedUser,
            ip,
            headers: { authorization: authHeader },
        });
    }
    async changePassword(req, body) {
        const authHeader = req.headers['authorization'] || null;
        let token = req.headers['authorization']?.replace('Bearer ', '') || null;
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        let decodedUser = null;
        try {
            decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
        }
        catch (err) {
            throw new common_1.HttpException('Invalid token', common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.authClient.send(contracts_1.PATTERNS.AUTH_CHANGE_PASSWORD, {
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
            body,
        });
    }
    async getAuthenticatedUser(req) {
        const authHeader = req.headers['authorization'] || null;
        let token = req.headers['authorization']?.replace('Bearer ', '') || null;
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        let decodedUser = null;
        try {
            decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
        }
        catch (err) {
            throw new common_1.HttpException('Invalid token', common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.authClient.send(contracts_1.PATTERNS.AUTH_FIND_AUTHENTICATED_USER, {
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async superAdmin(dto) {
        return this.authClient.send('SUPPER_ADDMIN', {});
    }
};
exports.AuthGatewayController = AuthGatewayController;
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_entity_1.AuthRegisterDto]),
    __metadata("design:returntype", Promise)
], AuthGatewayController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_entity_1.AuthLoginDto, Object]),
    __metadata("design:returntype", Promise)
], AuthGatewayController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('login-mobile'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_entity_1.AuthLoginMobileDto, Object]),
    __metadata("design:returntype", Promise)
], AuthGatewayController.prototype, "loginMobile", null);
__decorate([
    (0, common_1.Get)('refresh'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthGatewayController.prototype, "refreshToken", null);
__decorate([
    (0, common_1.Post)('change-password'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, auth_entity_1.AuthChangePasswordDto]),
    __metadata("design:returntype", Promise)
], AuthGatewayController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Get)('user'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthGatewayController.prototype, "getAuthenticatedUser", null);
__decorate([
    (0, common_1.Post)('superAdmin'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthGatewayController.prototype, "superAdmin", null);
exports.AuthGatewayController = AuthGatewayController = __decorate([
    (0, common_1.Controller)('auth'),
    __param(0, (0, common_1.Inject)('AUTH_SERVICE')),
    __metadata("design:paramtypes", [microservices_1.ClientProxy])
], AuthGatewayController);
//# sourceMappingURL=auth.gateway.controller.js.map