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
exports.FleetGatewayController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const contracts_1 = require("../contracts");
const fleet_entity_1 = require("../operations/fleet/fleet.entity");
const jwt = require("jsonwebtoken");
let FleetGatewayController = class FleetGatewayController {
    constructor(fleetClient) {
        this.fleetClient = fleetClient;
    }
    async assignVehicle(req, dto) {
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
        console.log(dto);
        return this.fleetClient.send(contracts_1.PATTERNS.FLEET_ASSIGN_VEHICLE, {
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
            data: dto,
        });
    }
    async unassignVehicle(req, id) {
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
        return this.fleetClient.send(contracts_1.PATTERNS.FLEET_UNASSIGN_VEHICLE, {
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
            vehicleId: id,
        });
    }
    async getVehiclesByDriver(driverId, req) {
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
        return this.fleetClient.send(contracts_1.PATTERNS.FLEET_GET_DRIVER_VEHICLES, {
            driverId,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async logMaintenance(req, dto) {
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
        console.log('auth: ', authHeader);
        return this.fleetClient.send(contracts_1.PATTERNS.FLEET_LOG_MAINTENANCE, {
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
            data: dto,
        });
    }
    async getMaintenanceHistory(req, vehicleId) {
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
        return this.fleetClient.send(contracts_1.PATTERNS.FLEET_GET_MAINTENANCE_HISTORY, {
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
            vehicleId,
        });
    }
    async getFleetSummary(req) {
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
        return this.fleetClient.send(contracts_1.PATTERNS.FLEET_GET_SUMMARY, {
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async getAvailableVehicles(req) {
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
        return this.fleetClient.send(contracts_1.PATTERNS.FLEET_GET_AVAILABLE_VEHICLES, {
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async retireVehicle(vehicleId, req) {
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
        return this.fleetClient.send(contracts_1.PATTERNS.FLEET_RETIRE_VEHICLE, {
            vehicleId,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async getFleetAlerts(req) {
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
        return this.fleetClient.send(contracts_1.PATTERNS.FLEET_GET_ALERTS, {
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async getDriverVehicleHistory(driverId, req) {
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
        return this.fleetClient.send(contracts_1.PATTERNS.FLEET_GET_DRIVER_HISTORY, {
            driverId,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async createVehicle(dto, req) {
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
        return this.fleetClient.send(contracts_1.PATTERNS.FLEET_CREATE_VEHICLE, {
            data: dto,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async getAllVehicles(req, page = 1, pageSize = 10, search, status) {
        console.log('=============================: fleet');
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
        return this.fleetClient.send(contracts_1.PATTERNS.FLEET_GET_ALL_VEHICLES, {
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
            page: Number(page),
            pageSize: Number(pageSize),
            search: search || null,
            status: status || null,
        });
    }
    async getVehicleById(req, id) {
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
        return this.fleetClient.send(contracts_1.PATTERNS.FLEET_GET_VEHICLE_BY_ID, {
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
            id,
        });
    }
    async updateVehicle(req, id, dto) {
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
        return this.fleetClient.send(contracts_1.PATTERNS.FLEET_UPDATE_VEHICLE, {
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
            id,
            data: dto,
        });
    }
    async deleteVehicle(req, id) {
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
        return this.fleetClient.send(contracts_1.PATTERNS.FLEET_DELETE_VEHICLE, {
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
            id,
        });
    }
};
exports.FleetGatewayController = FleetGatewayController;
__decorate([
    (0, common_1.Patch)('assign-to-driver'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, fleet_entity_1.AssignVehicleDto]),
    __metadata("design:returntype", Promise)
], FleetGatewayController.prototype, "assignVehicle", null);
__decorate([
    (0, common_1.Patch)('unassign/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FleetGatewayController.prototype, "unassignVehicle", null);
__decorate([
    (0, common_1.Get)('driver/:driverId'),
    __param(0, (0, common_1.Param)('driverId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FleetGatewayController.prototype, "getVehiclesByDriver", null);
__decorate([
    (0, common_1.Post)('maintenance'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, fleet_entity_1.VehicleMaintenanceDto]),
    __metadata("design:returntype", Promise)
], FleetGatewayController.prototype, "logMaintenance", null);
__decorate([
    (0, common_1.Get)('maintenance/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FleetGatewayController.prototype, "getMaintenanceHistory", null);
__decorate([
    (0, common_1.Get)('summary'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FleetGatewayController.prototype, "getFleetSummary", null);
__decorate([
    (0, common_1.Get)('available'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FleetGatewayController.prototype, "getAvailableVehicles", null);
__decorate([
    (0, common_1.Patch)(':id/retire'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FleetGatewayController.prototype, "retireVehicle", null);
__decorate([
    (0, common_1.Get)('alerts'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FleetGatewayController.prototype, "getFleetAlerts", null);
__decorate([
    (0, common_1.Get)('driver/:driverId/history'),
    __param(0, (0, common_1.Param)('driverId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FleetGatewayController.prototype, "getDriverVehicleHistory", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FleetGatewayController.prototype, "createVehicle", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('pageSize')),
    __param(3, (0, common_1.Query)('search')),
    __param(4, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, String, String]),
    __metadata("design:returntype", Promise)
], FleetGatewayController.prototype, "getAllVehicles", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FleetGatewayController.prototype, "getVehicleById", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, fleet_entity_1.UpdateVehicleDto]),
    __metadata("design:returntype", Promise)
], FleetGatewayController.prototype, "updateVehicle", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FleetGatewayController.prototype, "deleteVehicle", null);
exports.FleetGatewayController = FleetGatewayController = __decorate([
    (0, common_1.Controller)('fleet'),
    __param(0, (0, common_1.Inject)('USER_SERVICE')),
    __metadata("design:paramtypes", [microservices_1.ClientProxy])
], FleetGatewayController);
//# sourceMappingURL=fleet.gatway.controller.js.map