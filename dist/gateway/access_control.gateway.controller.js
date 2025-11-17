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
exports.AccessControlGatewayController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const contracts_1 = require("../contracts");
const access_control_entity_1 = require("../operations/acl/access_control.entity");
const jwt = require("jsonwebtoken");
const query_dto_1 = require("../common/query/query.dto");
let AccessControlGatewayController = class AccessControlGatewayController {
    constructor(accessClient) {
        this.accessClient = accessClient;
    }
    async findAllRole(req, query) {
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        let decodedUser = null;
        return this.accessClient.send(contracts_1.PATTERNS.ROLE_FIND_ALL_FREE, {
            user: decodedUser,
            ip,
            query,
        });
    }
    async findRoleById(req, id) {
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
        return this.accessClient.send(contracts_1.PATTERNS.ROLE_FIND_BY_ID, {
            id,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async findAllRoles(req, page, pageSize, search) {
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
        return this.accessClient.send(contracts_1.PATTERNS.ROLE_FIND_ALL, {
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
            page: page ? Number(page) : 1,
            pageSize: pageSize ? Number(pageSize) : 10,
            search: search || null,
        });
    }
    async createRole(req, dto) {
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
        return this.accessClient.send(contracts_1.PATTERNS.ROLE_CREATE, {
            data: dto,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async updateRole(req, id, dto) {
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
        return this.accessClient.send(contracts_1.PATTERNS.ROLE_UPDATE, {
            id,
            data: dto,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async deleteRole(req, id) {
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
        return this.accessClient.send(contracts_1.PATTERNS.ROLE_DELETE, {
            id,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async findPermissionById(req, id) {
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
        return this.accessClient.send(contracts_1.PATTERNS.PERMISSION_FIND_BY_ID, {
            id,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async findAllPermissions(req, page, pageSize, search) {
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
        return this.accessClient.send(contracts_1.PATTERNS.PERMISSION_FIND_ALL, {
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
            page: page ? Number(page) : 1,
            pageSize: pageSize ? Number(pageSize) : 10,
            search: search || null,
        });
    }
    async createPermission(req, dto) {
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
        return this.accessClient.send(contracts_1.PATTERNS.PERMISSION_CREATE, {
            data: dto,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async updatePermission(req, id, dto) {
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
        return this.accessClient.send(contracts_1.PATTERNS.PERMISSION_UPDATE, {
            id,
            data: dto,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async deletePermission(req, id) {
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
        return this.accessClient.send(contracts_1.PATTERNS.PERMISSION_DELETE, {
            id,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async assignPermissionsToRole(req, dto) {
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
        return this.accessClient.send(contracts_1.PATTERNS.ROLE_ASSIGN_PERMISSIONS, {
            data: dto,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async removePermissionFromRole(req, roleId, dto) {
        const { permissionId } = dto;
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
        return this.accessClient.send(contracts_1.PATTERNS.ROLE_REMOVE_PERMISSION, {
            roleId,
            permissionId: permissionId,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async updatePermissionFromRole(req, roleId, data) {
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
        return this.accessClient.send(contracts_1.PATTERNS.ROLE_UPDATE_PERMISSION, {
            roleId,
            data: data,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async assignUserRole(req, dto) {
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
        return this.accessClient.send(contracts_1.PATTERNS.ROLE_ASSIGN_USER, {
            data: dto,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
};
exports.AccessControlGatewayController = AccessControlGatewayController;
__decorate([
    (0, common_1.Get)('roles/all'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, query_dto_1.ListQueryDto]),
    __metadata("design:returntype", Promise)
], AccessControlGatewayController.prototype, "findAllRole", null);
__decorate([
    (0, common_1.Get)('roles/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AccessControlGatewayController.prototype, "findRoleById", null);
__decorate([
    (0, common_1.Get)('roles'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('pageSize')),
    __param(3, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, String]),
    __metadata("design:returntype", Promise)
], AccessControlGatewayController.prototype, "findAllRoles", null);
__decorate([
    (0, common_1.Post)('roles'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AccessControlGatewayController.prototype, "createRole", null);
__decorate([
    (0, common_1.Patch)('roles/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], AccessControlGatewayController.prototype, "updateRole", null);
__decorate([
    (0, common_1.Delete)('roles/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AccessControlGatewayController.prototype, "deleteRole", null);
__decorate([
    (0, common_1.Get)('permissions/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AccessControlGatewayController.prototype, "findPermissionById", null);
__decorate([
    (0, common_1.Get)('permissions'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('pageSize')),
    __param(3, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, String]),
    __metadata("design:returntype", Promise)
], AccessControlGatewayController.prototype, "findAllPermissions", null);
__decorate([
    (0, common_1.Post)('permissions'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AccessControlGatewayController.prototype, "createPermission", null);
__decorate([
    (0, common_1.Patch)('permissions/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], AccessControlGatewayController.prototype, "updatePermission", null);
__decorate([
    (0, common_1.Delete)('permissions/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AccessControlGatewayController.prototype, "deletePermission", null);
__decorate([
    (0, common_1.Post)('roles/permissions/assign'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, access_control_entity_1.ChangeRolePermissionDto]),
    __metadata("design:returntype", Promise)
], AccessControlGatewayController.prototype, "assignPermissionsToRole", null);
__decorate([
    (0, common_1.Post)('roles/:roleId/permissions/remove'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('roleId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, access_control_entity_1.RemovePermissionDto]),
    __metadata("design:returntype", Promise)
], AccessControlGatewayController.prototype, "removePermissionFromRole", null);
__decorate([
    (0, common_1.Post)('roles/:roleId/permissions/update'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('roleId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, access_control_entity_1.PermissionActionDto]),
    __metadata("design:returntype", Promise)
], AccessControlGatewayController.prototype, "updatePermissionFromRole", null);
__decorate([
    (0, common_1.Patch)('assign-user-role'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, access_control_entity_1.AssignUserRoleDto]),
    __metadata("design:returntype", Promise)
], AccessControlGatewayController.prototype, "assignUserRole", null);
exports.AccessControlGatewayController = AccessControlGatewayController = __decorate([
    (0, common_1.Controller)('access-control'),
    __param(0, (0, common_1.Inject)('USER_SERVICE')),
    __metadata("design:paramtypes", [microservices_1.ClientProxy])
], AccessControlGatewayController);
//# sourceMappingURL=access_control.gateway.controller.js.map