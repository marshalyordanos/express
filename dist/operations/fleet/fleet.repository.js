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
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehicleRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let VehicleRepository = class VehicleRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createVehicle(data) {
        const { driverId, status, ...vehicleData } = data;
        console.log('vehicleData: ', vehicleData);
        return this.prisma.vehicle.create({
            data: {
                ...vehicleData,
                status: status || 'ACTIVE',
                driver: driverId ? { connect: { id: driverId } } : undefined,
            },
        });
    }
    async findUserById(id) {
        return this.prisma.user.findUnique({
            where: { id },
            include: { role: true },
        });
    }
    async getAllVehicles(page = 1, pageSize = 10, status, search) {
        const skip = (page - 1) * pageSize;
        const where = {};
        if (status)
            where.status = status;
        if (search)
            where.plateNumber = { contains: search, mode: 'insensitive' };
        const [vehicles, total] = await Promise.all([
            this.prisma.vehicle.findMany({
                where,
                skip,
                take: pageSize,
                include: { driver: true },
            }),
            this.prisma.vehicle.count({ where }),
        ]);
        const totalPages = Math.ceil(total / pageSize);
        return {
            vehicles,
            pagination: {
                total,
                page,
                pageSize,
                totalPages,
            },
        };
    }
    async getVehicleById(id) {
        return this.prisma.vehicle.findUnique({
            where: { id },
            include: { driver: true },
        });
    }
    async updateVehicle(id, data) {
        return this.prisma.vehicle.update({ where: { id }, data });
    }
    async deleteVehicle(id) {
        return this.prisma.vehicle.delete({ where: { id } });
    }
    async assignVehicle(data) {
        return this.prisma.vehicle.update({
            where: { id: data.vehicleId },
            data: { driverId: data.driverId, status: 'ACTIVE' },
        });
    }
    async unassignVehicle(vehicleId) {
        return this.prisma.vehicle.update({
            where: { id: vehicleId },
            data: { driverId: null, status: 'INACTIVE' },
        });
    }
    async getVehiclesByDriver(driverId) {
        return this.prisma.vehicle.findMany({ where: { driverId } });
    }
    async logMaintenance(data) {
        return this.prisma.fleetLog.create({
            data: {
                vehicleId: data.vehicleId,
                maintenance: data.maintenance,
                cost: data.cost,
            },
        });
    }
    async getMaintenanceHistory(vehicleId, query) {
        const where = { vehicleId };
        if (query?.fromDate)
            where.date = { gte: query.fromDate };
        if (query?.toDate)
            where.date = { ...where.date, lte: query.toDate };
        return this.prisma.fleetLog.findMany({ where, orderBy: { date: 'desc' } });
    }
    async getFleetSummary() {
        const totalVehicles = await this.prisma.vehicle.count();
        const activeVehicles = await this.prisma.vehicle.count({
            where: { status: 'ACTIVE' },
        });
        const inMaintenance = await this.prisma.vehicle.count({
            where: { status: 'MAINTENANCE' },
        });
        const inactive = await this.prisma.vehicle.count({
            where: { status: 'INACTIVE' },
        });
        return { totalVehicles, activeVehicles, inMaintenance, inactive };
    }
    async getAvailableVehicles() {
        return this.prisma.vehicle.findMany({
            where: { status: 'ACTIVE', driverId: null },
        });
    }
    async getVehicleHistory(vehicleId) {
        const vehicle = await this.prisma.vehicle.findUnique({
            where: { id: vehicleId },
            include: { fleetLogs: true, driver: true },
        });
        return vehicle;
    }
    async retireVehicle(vehicleId) {
        return this.prisma.vehicle.update({
            where: { id: vehicleId },
            data: { status: 'INACTIVE', driverId: null },
        });
    }
    async getFleetAlerts() {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return this.prisma.fleetLog.findMany({
            where: { date: { gte: thirtyDaysAgo } },
            orderBy: { date: 'desc' },
        });
    }
    async getDriverVehicleHistory(driverId) {
        return this.prisma.vehicle.findMany({
            where: { driverId },
            include: { fleetLogs: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findUser(userId) {
        return this.prisma.user.findUnique({
            where: { id: userId },
            include: { role: true },
        });
    }
};
exports.VehicleRepository = VehicleRepository;
exports.VehicleRepository = VehicleRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], VehicleRepository);
//# sourceMappingURL=fleet.repository.js.map