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
exports.StaffGatewayController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const contracts_1 = require("../contracts");
const staff_entity_1 = require("../operations/staff/staff.entity");
const query_dto_1 = require("../common/query/query.dto");
const jwt = require("jsonwebtoken");
const platform_express_1 = require("@nestjs/platform-express");
let StaffGatewayController = class StaffGatewayController {
    constructor(staffClient) {
        this.staffClient = staffClient;
    }
    async changeUserRole(dto, req) {
        console.log('dto: ', dto);
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
        return this.staffClient.send(contracts_1.PATTERNS.USER_CHANGE_ROLE, {
            data: dto,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async findUserByEmail(email, req) {
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
        return this.staffClient.send(contracts_1.PATTERNS.USER_FIND_BY_EMAIL, {
            email,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async createStaff(req, dto) {
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
        console.log('=========================: ', authHeader);
        return this.staffClient.send(contracts_1.PATTERNS.STAFF_CREATE, {
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
            data: dto,
        });
    }
    async findStaff(req, query) {
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
        return this.staffClient.send(contracts_1.PATTERNS.STAFF_FIND_ALL, {
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
            query,
        });
    }
    async findStaffByRole(req, id, query) {
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
        return this.staffClient.send(contracts_1.PATTERNS.STAFF_FIND_BY_ROLE, {
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
            query: { ...query },
            role: id,
        });
    }
    async deleteStaff(id, req) {
        console.log('Deleting....');
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
        return this.staffClient.send(contracts_1.PATTERNS.STAFF_DELETE, {
            id,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async updateStaff(id, dto, req) {
        console.log('this is dto : ', dto);
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
        return this.staffClient.send(contracts_1.PATTERNS.STAFF_UPDATE, {
            id,
            data: dto,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async findStaffById(id, req) {
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
        return this.staffClient.send(contracts_1.PATTERNS.STAFF_FIND_BY_ID, {
            id,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async findStaffByBranch(req, branchId, query) {
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
        return this.staffClient.send(contracts_1.PATTERNS.STAFF_FIND_BY_BRANCH, {
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
            branchId,
            query,
        });
    }
    async createDriver(files, body, req) {
        if (files?.length > 0) {
            body.licenseFront = files[0]?.buffer || null;
            body.licenseBack = files[1]?.buffer || null;
        }
        const forwarded = req.headers['x-forwarded-for'];
        const ip = forwarded?.split(',')[0] || req.ip;
        return this.staffClient.send(contracts_1.PATTERNS.STAFF_CREATE_DRIVER, {
            data: body,
            user: null,
            ip,
        });
    }
    async findDriver(query, req) {
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        let decodedUser = null;
        return this.staffClient.send(contracts_1.PATTERNS.STAFF_FIND_DRIVER, {
            query,
            user: decodedUser,
            ip,
        });
    }
    async assignBranch(dto, req) {
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
        return this.staffClient.send(contracts_1.PATTERNS.STAFF_ASSIGN_BRANCH, {
            data: dto,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
};
exports.StaffGatewayController = StaffGatewayController;
__decorate([
    (0, common_1.Patch)('role/change'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [staff_entity_1.ChangeRoleDto, Object]),
    __metadata("design:returntype", Promise)
], StaffGatewayController.prototype, "changeUserRole", null);
__decorate([
    (0, common_1.Get)('email/:email'),
    __param(0, (0, common_1.Param)('email')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], StaffGatewayController.prototype, "findUserByEmail", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, staff_entity_1.RegisterStaffDto]),
    __metadata("design:returntype", Promise)
], StaffGatewayController.prototype, "createStaff", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, query_dto_1.ListQueryDto]),
    __metadata("design:returntype", Promise)
], StaffGatewayController.prototype, "findStaff", null);
__decorate([
    (0, common_1.Get)('role/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, query_dto_1.ListQueryDto]),
    __metadata("design:returntype", Promise)
], StaffGatewayController.prototype, "findStaffByRole", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], StaffGatewayController.prototype, "deleteStaff", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, staff_entity_1.UpdateStaffDto, Object]),
    __metadata("design:returntype", Promise)
], StaffGatewayController.prototype, "updateStaff", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], StaffGatewayController.prototype, "findStaffById", null);
__decorate([
    (0, common_1.Get)('/branch/:branchId'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('branchId')),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, query_dto_1.ListQueryDto]),
    __metadata("design:returntype", Promise)
], StaffGatewayController.prototype, "findStaffByBranch", null);
__decorate([
    (0, common_1.Post)('/driver'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('licenseImages', 2)),
    __param(0, (0, common_1.UploadedFiles)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object, Object]),
    __metadata("design:returntype", Promise)
], StaffGatewayController.prototype, "createDriver", null);
__decorate([
    (0, common_1.Get)('/driver'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_dto_1.ListQueryDto, Object]),
    __metadata("design:returntype", Promise)
], StaffGatewayController.prototype, "findDriver", null);
__decorate([
    (0, common_1.Post)('assign-branch'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [staff_entity_1.AssignStaffToBranchDto, Object]),
    __metadata("design:returntype", Promise)
], StaffGatewayController.prototype, "assignBranch", null);
exports.StaffGatewayController = StaffGatewayController = __decorate([
    (0, common_1.Controller)('staff'),
    __param(0, (0, common_1.Inject)('USER_SERVICE')),
    __metadata("design:paramtypes", [microservices_1.ClientProxy])
], StaffGatewayController);
//# sourceMappingURL=staff.gateway.controller.js.map