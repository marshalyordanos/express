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
exports.MapGatewayController = void 0;
const common_1 = require("@nestjs/common");
const contracts_1 = require("../contracts");
const microservices_1 = require("@nestjs/microservices");
const jwt = require("jsonwebtoken");
const maps_entity_1 = require("../fulfillment/maps/maps.entity");
let MapGatewayController = class MapGatewayController {
    constructor(mapClient) {
        this.mapClient = mapClient;
    }
    async nearbyDrivers(lat, lon, radius, req) {
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
        console.log('lat', lat, 'lon', lon, 'radius', radius);
        return this.mapClient.send(contracts_1.PATTERNS.MAP_NEARBY_DRIVERS, {
            lat: parseFloat(lat),
            lon: parseFloat(lon),
            radius: parseFloat(radius),
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async markStopVisited(driverId, dto, req) {
        const { orderId } = dto;
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
        return this.mapClient.send(contracts_1.PATTERNS.MAP_MARK_STOP_VISITED, {
            driverId,
            orderId,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async getRouteStatus(driverId, req) {
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
        return this.mapClient.send(contracts_1.PATTERNS.MAP_GET_CURRENT_ROUTE_STATUS, {
            driverId,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async getRoute(driverId, req) {
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
        return this.mapClient.send(contracts_1.PATTERNS.MAP_GET_ROUTE, {
            driverId,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
};
exports.MapGatewayController = MapGatewayController;
__decorate([
    (0, common_1.Get)('nearby-drivers'),
    __param(0, (0, common_1.Query)('lat')),
    __param(1, (0, common_1.Query)('lon')),
    __param(2, (0, common_1.Query)('radius')),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], MapGatewayController.prototype, "nearbyDrivers", null);
__decorate([
    (0, common_1.Post)('route/:driverId/driver-stop'),
    __param(0, (0, common_1.Param)('driverId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, maps_entity_1.OrderIdDto, Object]),
    __metadata("design:returntype", Promise)
], MapGatewayController.prototype, "markStopVisited", null);
__decorate([
    (0, common_1.Get)('/route/:driverId/status'),
    __param(0, (0, common_1.Param)('driverId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MapGatewayController.prototype, "getRouteStatus", null);
__decorate([
    (0, common_1.Get)('route/:driverId'),
    __param(0, (0, common_1.Param)('driverId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MapGatewayController.prototype, "getRoute", null);
exports.MapGatewayController = MapGatewayController = __decorate([
    (0, common_1.Controller)('maps'),
    __param(0, (0, common_1.Inject)('FULFILLMENT_SERVICE')),
    __metadata("design:paramtypes", [microservices_1.ClientProxy])
], MapGatewayController);
//# sourceMappingURL=maps.gateway.controller.js.map