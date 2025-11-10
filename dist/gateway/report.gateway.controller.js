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
exports.ReportGatewayController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const client_1 = require("@prisma/client");
const contracts_1 = require("../contracts");
const jwt = require("jsonwebtoken");
let ReportGatewayController = class ReportGatewayController {
    constructor(reportClient) {
        this.reportClient = reportClient;
    }
    async getOverview(req) {
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
        return this.reportClient.send(contracts_1.PATTERNS.REPORT_DASHBOARD_OVERVIEW, {
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async getShipmentPerformance(req) {
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
        return this.reportClient.send(contracts_1.PATTERNS.REPORT_DASHBOARD_SHIPMENT_PERFORMANCE, {
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async getRevenueTrends(period, req) {
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
        return this.reportClient.send(contracts_1.PATTERNS.REPORT_DASHBOARD_REVENUE_TRENDS, {
            period,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async getBranchPerformance(metric, req) {
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
        return this.reportClient.send(contracts_1.PATTERNS.REPORT_DASHBOARD_BRANCH_PERFORMANCE, {
            metric,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async getDriverPerformance(regionId, req) {
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
        return this.reportClient.send(contracts_1.PATTERNS.REPORT_DASHBOARD_DRIVER_PERFORMANCE, {
            regionId,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async getBranchDashboardSummary(regionId, req) {
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
        return this.reportClient.send(contracts_1.PATTERNS.REPORT_DASHBOARD_BRANCH_SUMMARY, {
            regionId,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async getStaffDashboardSummary(regionId, req) {
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
        return this.reportClient.send(contracts_1.PATTERNS.REPORT_DASHBOARD_STAFF_SUMMARY, {
            regionId,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async getOrderDashboardSummary(req) {
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
        return this.reportClient.send(contracts_1.PATTERNS.REPORT_DASHBOARD_ORDER_SUMMARY, {
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async getCustomerDashboardSummary(req) {
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
        return this.reportClient.send(contracts_1.PATTERNS.REPORT_DASHBOARD_CUSTOMER_SUMMARY, {
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async getRevenueDashboardSummary(req) {
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
        return this.reportClient.send(contracts_1.PATTERNS.REPORT_DASHBOARD_REVENUE_SUMMARY, {
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async getFleetDashboardSummary(req) {
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
        return this.reportClient.send(contracts_1.PATTERNS.REPORT_DASHBOARD_FLEET_SUMMARY, {
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async getDispatchDashboardSummary(req) {
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
        return this.reportClient.send(contracts_1.PATTERNS.REPORT_DASHBOARD_DISPATCH_SUMMARY, {
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async getShipmentSummary(req) {
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
        return this.reportClient.send(contracts_1.PATTERNS.REPORT_SHIPMENT_SUMMARY, {
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async getShipmentStatusBreakdown(req) {
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
        return this.reportClient.send(contracts_1.PATTERNS.REPORT_SHIPMENT_STATUS_BREAKDOWN, {
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async getShipmentByType(serviceType, req) {
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
        return this.reportClient.send(contracts_1.PATTERNS.REPORT_SHIPMENT_BY_TYPE, {
            serviceType,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async getShipmentByCustomer(customerId, req) {
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
        return this.reportClient.send(contracts_1.PATTERNS.REPORT_SHIPMENT_BY_CUSTOMER, {
            customerId,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async getDelayedShipments(req) {
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
        return this.reportClient.send(contracts_1.PATTERNS.REPORT_SHIPMENT_DELAYED, {
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async getBranchOverview(req) {
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
        return this.reportClient.send(contracts_1.PATTERNS.REPORT_PERFORMANCE_BRANCH_OVERVIEW, {
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async getBranchDetails(branchId, req) {
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
        return this.reportClient.send(contracts_1.PATTERNS.REPORT_PERFORMANCE_BRANCH_DETAILS, {
            branchId,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async getDriverOverview(req) {
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
        return this.reportClient.send(contracts_1.PATTERNS.REPORT_PERFORMANCE_DRIVER_OVERVIEW, {
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async getDriverDetails(driverId, req) {
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
        return this.reportClient.send(contracts_1.PATTERNS.REPORT_PERFORMANCE_DRIVER_DETAILS, {
            driverId,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async getTopBranches(metric, req) {
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
        return this.reportClient.send(contracts_1.PATTERNS.REPORT_PERFORMANCE_TOP_BRANCHES, {
            metric,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async getTopDrivers(metric, req) {
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
        return this.reportClient.send(contracts_1.PATTERNS.REPORT_PERFORMANCE_TOP_DRIVERS, {
            metric,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
};
exports.ReportGatewayController = ReportGatewayController;
__decorate([
    (0, common_1.Get)('dashboard/overview'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReportGatewayController.prototype, "getOverview", null);
__decorate([
    (0, common_1.Get)('dashboard/shipment-performance'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReportGatewayController.prototype, "getShipmentPerformance", null);
__decorate([
    (0, common_1.Get)('dashboard/revenue-trends'),
    __param(0, (0, common_1.Query)('period')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ReportGatewayController.prototype, "getRevenueTrends", null);
__decorate([
    (0, common_1.Get)('dashboard/branch-performance'),
    __param(0, (0, common_1.Query)('metric')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ReportGatewayController.prototype, "getBranchPerformance", null);
__decorate([
    (0, common_1.Get)('dashboard/driver-performance'),
    __param(0, (0, common_1.Query)('region')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ReportGatewayController.prototype, "getDriverPerformance", null);
__decorate([
    (0, common_1.Get)('dashboard/branch-summary'),
    __param(0, (0, common_1.Query)('region')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ReportGatewayController.prototype, "getBranchDashboardSummary", null);
__decorate([
    (0, common_1.Get)('dashboard/staff-summary'),
    __param(0, (0, common_1.Query)('region')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ReportGatewayController.prototype, "getStaffDashboardSummary", null);
__decorate([
    (0, common_1.Get)('dashboard/order-summary'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReportGatewayController.prototype, "getOrderDashboardSummary", null);
__decorate([
    (0, common_1.Get)('dashboard/customer-summary'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReportGatewayController.prototype, "getCustomerDashboardSummary", null);
__decorate([
    (0, common_1.Get)('dashboard/revenue-summary'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReportGatewayController.prototype, "getRevenueDashboardSummary", null);
__decorate([
    (0, common_1.Get)('dashboard/fleet-summary'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReportGatewayController.prototype, "getFleetDashboardSummary", null);
__decorate([
    (0, common_1.Get)('dashboard/dispatch-summary'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReportGatewayController.prototype, "getDispatchDashboardSummary", null);
__decorate([
    (0, common_1.Get)('shipment/summary'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReportGatewayController.prototype, "getShipmentSummary", null);
__decorate([
    (0, common_1.Get)('shipment/status'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReportGatewayController.prototype, "getShipmentStatusBreakdown", null);
__decorate([
    (0, common_1.Get)('shipment/by-type'),
    __param(0, (0, common_1.Query)('serviceType')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ReportGatewayController.prototype, "getShipmentByType", null);
__decorate([
    (0, common_1.Get)('shipment/by-customer/:customerId'),
    __param(0, (0, common_1.Param)('customerId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ReportGatewayController.prototype, "getShipmentByCustomer", null);
__decorate([
    (0, common_1.Get)('shipment/delayed'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReportGatewayController.prototype, "getDelayedShipments", null);
__decorate([
    (0, common_1.Get)('performance/branch-overview'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReportGatewayController.prototype, "getBranchOverview", null);
__decorate([
    (0, common_1.Get)('performance/branch/:branchId/details'),
    __param(0, (0, common_1.Param)('branchId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ReportGatewayController.prototype, "getBranchDetails", null);
__decorate([
    (0, common_1.Get)('performance/driver-overview'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReportGatewayController.prototype, "getDriverOverview", null);
__decorate([
    (0, common_1.Get)('performance/driver/:driverId/details'),
    __param(0, (0, common_1.Param)('driverId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ReportGatewayController.prototype, "getDriverDetails", null);
__decorate([
    (0, common_1.Get)('performance/top-branches'),
    __param(0, (0, common_1.Query)('metric')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ReportGatewayController.prototype, "getTopBranches", null);
__decorate([
    (0, common_1.Get)('performance/top-drivers'),
    __param(0, (0, common_1.Query)('metric')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ReportGatewayController.prototype, "getTopDrivers", null);
exports.ReportGatewayController = ReportGatewayController = __decorate([
    (0, common_1.Controller)('report'),
    __param(0, (0, common_1.Inject)('USER_SERVICE')),
    __metadata("design:paramtypes", [microservices_1.ClientProxy])
], ReportGatewayController);
//# sourceMappingURL=report.gateway.controller.js.map