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
exports.MapsRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let MapsRepository = class MapsRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createDriverLocation(body) {
        return this.prisma.$transaction(async (tx) => {
            const driverLocationLog = await tx.driverLocationLog.create({
                data: {
                    driverId: body.driverId,
                    latitude: body.latitude,
                    longitude: body.longitude,
                    speed: body.speed,
                    heading: body.heading,
                },
                include: { driver: true },
            });
            const driver = await tx.driver.update({
                where: { userId: body.driverId },
                data: {
                    currentLat: body.latitude,
                    currentLon: body.longitude,
                    updatedAt: new Date(),
                },
            });
        });
    }
    async createDriver(body) {
        return this.prisma.driver.create({
            data: {
                user: { connect: { id: body.userId } },
                vehicles: { connect: { id: body.vehicleId } },
                status: client_1.DriverStatus.OFFLINE,
                type: client_1.DriverType.INTERNAL,
            },
        });
    }
    async updateOptimizationJobStatus(jobId, status) {
        return this.prisma.optimizationJob.update({
            where: { id: jobId },
            data: { status },
        });
    }
    async createOptimizationJob(data) {
        return this.prisma.optimizationJob.create({
            data: {
                jobCode: data.jobCode,
                type: data.type,
                status: data.status,
                optimizedOrder: data.optimizedOrder,
                totalDistance: data.totalDistance,
                totalDuration: data.totalDuration,
                driver: { connect: { id: data.driverId } },
            },
        });
    }
    async upsertLocationFromCoords(data) {
        const { latitude, longitude, mapServiceResult } = data;
        const name = mapServiceResult?.name;
        const address = mapServiceResult?.address;
        const city = mapServiceResult?.city;
        const country = mapServiceResult?.country;
        const existing = await this.prisma.location.findFirst({
            where: { latitude, longitude },
        });
        if (existing) {
            return this.prisma.location.update({
                where: { id: existing.id },
                data: { name, address, city, country },
            });
        }
        return this.prisma.location.create({
            data: { latitude, longitude, name, address, city, country },
        });
    }
    async findAddressByCoords(lat, long) {
        return this.prisma.address.findFirst({
            where: { lat, long },
        });
    }
    async findRouteByOriginDest(originId, destinationId) {
        return this.prisma.route.findFirst({
            where: { originId, destinationId },
        });
    }
    async updateRoute(routeId, data) {
        return this.prisma.route.update({
            where: { id: routeId },
            data,
        });
    }
    async upsertLocation(data) {
        let loc = await this.prisma.location.findFirst({
            where: { latitude: data.latitude, longitude: data.longitude },
        });
        if (loc) {
            return this.prisma.location.update({
                where: { id: loc.id },
                data: { name: data.name },
            });
        }
        return this.prisma.location.create({ data });
    }
    async createRoute(data) {
        return this.prisma.route.create({ data: {
                originId: data.originId,
                destinationId: data.destinationId,
                distanceKm: data.distanceKm,
                durationMin: data.durationMin,
                routePath: data.routePath,
                optimized: data.optimized,
                trafficAware: data.trafficAware,
                optimizationJobs: { connect: { id: data.optimizationJobId } },
            } });
    }
    async linkOrdersToOptimizationJob(optimizationJobId, orderIds) {
        return this.prisma.order.updateMany({
            where: { id: { in: orderIds } },
            data: { optimizationJobId },
        });
    }
    async getDrivers(payload) {
        throw new Error('Method not implemented.');
    }
    async getDriverById(id) {
        throw new Error('Method not implemented.');
    }
    async findUserById(userId) {
        return this.prisma.user.findUnique({
            where: { id: userId },
        });
    }
    async findDriverById(driverId) {
        const driver = await this.prisma.driver.findUnique({
            where: { userId: driverId },
            select: {
                id: true,
                currentLon: true,
                currentLat: true,
                user: {
                    select: {
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
            },
        });
        if (!driver || !driver.user) {
            throw new Error(`Driver not found: ${driverId}`);
        }
        return {
            id: driver.id,
            lat: driver.currentLat,
            lon: driver.currentLon,
        };
    }
    async findOrdersByDriverId(driverId) {
        const orders = await this.prisma.order.findMany({
            where: {
                OR: [{ pickupDriverId: driverId }, { deliveryDriverId: driverId }],
                status: {
                    in: ['ASSIGNED', 'OUT_FOR_DELIVERY'],
                },
            },
            select: {
                id: true,
                pickupAddress: {
                    select: { lat: true, long: true },
                },
                deliveryAddress: {
                    select: { lat: true, long: true },
                },
                fulfillmentType: true,
            },
        });
        const stops = orders.map((o) => {
            let lat, lon;
            if (o.fulfillmentType === 'PICKUP') {
                lat = o.pickupAddress?.lat;
                lon = o.pickupAddress?.long;
            }
            else {
                lat = o.deliveryAddress?.lat;
                lon = o.deliveryAddress?.long;
            }
            if (lat == null || lon == null) {
                throw new Error(`Order ${o.id} missing coordinates`);
            }
            return {
                orderId: o.id,
                lat,
                lon,
            };
        });
        return stops;
    }
};
exports.MapsRepository = MapsRepository;
exports.MapsRepository = MapsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MapsRepository);
//# sourceMappingURL=maps.repository.js.map