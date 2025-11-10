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
var DriverLocationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriverLocationService = void 0;
const common_1 = require("@nestjs/common");
const redis_service_1 = require("../../redis/redis.service");
const prisma_service_1 = require("../../prisma/prisma.service");
const websocket_event_service_1 = require("../../websocket/services/websocket-event.service");
let DriverLocationService = DriverLocationService_1 = class DriverLocationService {
    constructor(redisService, prisma, websocketEventService) {
        this.redisService = redisService;
        this.prisma = prisma;
        this.websocketEventService = websocketEventService;
        this.GEO_KEY = 'drivers:locations';
        this.LOCATION_TTL_SECONDS = 300;
        this.STATUS_PERSIST_MINUTES = 3;
        this.LOCATION_LOG_INTERVAL_SECONDS = 120;
        this.logger = new common_1.Logger(DriverLocationService_1.name);
        this.onlineEmitter = this.websocketEventService.emitDriverStatus.bind(this.websocketEventService);
    }
    async updateDriverLocation(data) {
        const client = this.redisService.getClient();
        try {
            const isOnlineAlready = await client.exists(`driver:${data.driverId}:online`);
            const pipeline = client.multi();
            pipeline.geoAdd(this.GEO_KEY, {
                longitude: data.lon,
                latitude: data.lat,
                member: data.driverId,
            });
            pipeline.hSet(`driver:${data.driverId}:location`, {
                lon: data.lon.toString(),
                lat: data.lat.toString(),
                speed: data.speed?.toString() ?? '',
                heading: data.heading?.toString() ?? '',
                updatedAt: new Date().toISOString(),
                status: 'ONLINE',
            });
            pipeline.expire(`driver:${data.driverId}:location`, this.LOCATION_TTL_SECONDS);
            pipeline.set(`driver:${data.driverId}:online`, '1', {
                EX: this.STATUS_PERSIST_MINUTES * 60,
            });
            await pipeline.exec();
            if (this.onlineEmitter) {
                this.onlineEmitter(data.driverId, 'ONLINE');
            }
            if (!isOnlineAlready) {
                await this.prisma.driver.update({
                    where: { userId: data.driverId },
                    data: {
                        status: 'ONLINE',
                        updatedAt: new Date(),
                    },
                });
                this.logger.log(`Driver ${data.driverId} came ONLINE — recorded immediately in DB.`);
            }
            this.websocketEventService.emitDriverLocationToSubscribers({
                driverId: data.driverId,
                lat: data.lat,
                lon: data.lon,
                speed: data.speed,
                heading: data.heading,
            });
        }
        catch (err) {
            this.logger.error(`Failed to update location for driver ${data.driverId}`, err);
        }
    }
    setOnlineEmitter(fn) {
        this.onlineEmitter = fn;
    }
    async findNearbyDrivers(lon, lat, radiusKm) {
        const client = this.redisService.getClient();
        const rawDrivers = (await client.sendCommand([
            'GEOSEARCH',
            this.GEO_KEY,
            'FROMLONLAT',
            lon.toString(),
            lat.toString(),
            'BYRADIUS',
            radiusKm.toString(),
            'km',
            'WITHDIST',
            'WITHCOORD',
        ]));
        if (!Array.isArray(rawDrivers) || rawDrivers.length === 0)
            return [];
        const drivers = rawDrivers.map((d) => ({
            driverId: d[0],
            distanceKm: parseFloat(d[1]),
            coordinates: {
                lon: parseFloat(d[2][0]),
                lat: parseFloat(d[2][1]),
            },
        }));
        const driverRecords = await this.prisma.driver.findMany({
            where: {
                userId: { in: drivers.map((d) => d.driverId) },
                status: 'ONLINE',
            },
            include: {
                user: {
                    include: {
                        pickupOrders: {
                            where: { status: { in: ['ASSIGNED', 'OUT_FOR_DELIVERY'] } },
                            select: { id: true },
                        },
                        deliveryOrders: {
                            where: { status: { in: ['ASSIGNED', 'OUT_FOR_DELIVERY'] } },
                            select: { id: true },
                        },
                    },
                },
            },
        });
        const rankedDrivers = driverRecords.map((d) => {
            const geo = drivers.find((g) => g.driverId === d.userId);
            const activeOrders = (d.user?.pickupOrders?.length || 0) +
                (d.user?.deliveryOrders?.length || 0);
            const distanceScore = 1 / (geo.distanceKm + 0.1);
            const workloadScore = 1 / (activeOrders + 1);
            const lastUpdatedScore = d.updatedAt &&
                new Date().getTime() - d.updatedAt.getTime() < 5 * 60 * 1000
                ? 1
                : 0.5;
            return {
                driverId: d.id,
                userId: d.userId,
                distanceKm: geo.distanceKm,
                currentLat: geo.coordinates.lat,
                currentLon: geo.coordinates.lon,
                activeOrders,
                lastUpdated: d.updatedAt,
                score: distanceScore * 0.6 + workloadScore * 0.3 + lastUpdatedScore * 0.1,
            };
        });
        return rankedDrivers
            .sort((a, b) => b.score - a.score)
            .map((d) => ({
            driverId: d.driverId,
            userId: d.userId,
            distanceKm: d.distanceKm,
            currentLat: d.currentLat,
            currentLon: d.currentLon,
            activeOrders: d.activeOrders,
            lastUpdated: d.lastUpdated,
            score: d.score,
        }));
    }
    async syncToDatabase() {
        const client = this.redisService.getClient();
        const driverUserIds = await client.zRange(this.GEO_KEY, 0, -1);
        for (const userId of driverUserIds) {
            const data = await client.hGetAll(`driver:${userId}:location`);
            if (Object.keys(data).length === 0)
                continue;
            const lat = parseFloat(data.lat);
            const lon = parseFloat(data.lon);
            const speed = data.speed ? parseFloat(data.speed) : 0;
            const heading = data.heading ? parseFloat(data.heading) : 0;
            const status = data.status || 'OFFLINE';
            const driver = await this.prisma.driver.findUnique({
                where: { userId },
                select: { id: true, updatedAt: true, status: true },
            });
            if (!driver) {
                console.warn(`⚠️ No driver found for userId: ${userId}`);
                continue;
            }
            const now = new Date();
            if (!driver.updatedAt ||
                (now.getTime() - driver.updatedAt.getTime()) / 1000 >
                    this.STATUS_PERSIST_MINUTES * 60) {
                await this.prisma.driver.update({
                    where: { userId },
                    data: {
                        currentLat: lat,
                        currentLon: lon,
                        updatedAt: now,
                        status,
                    },
                });
            }
            const lastLog = await this.prisma.driverLocationLog.findFirst({
                where: { driverId: driver.id },
                orderBy: { timestamp: 'desc' },
            });
            if (!lastLog ||
                (now.getTime() - lastLog.timestamp.getTime()) / 1000 >
                    this.LOCATION_LOG_INTERVAL_SECONDS) {
                await this.prisma.driverLocationLog.create({
                    data: {
                        driverId: driver.id,
                        latitude: lat,
                        longitude: lon,
                        speed,
                        heading,
                    },
                });
            }
        }
    }
    async updateOfflineDrivers() {
        const client = this.redisService.getClient();
        try {
            const driverUserIds = await client.zRange(this.GEO_KEY, 0, -1);
            const offlineDriverIds = [];
            for (const userId of driverUserIds) {
                const isOnline = await client.exists(`driver:${userId}:online`);
                if (!isOnline)
                    offlineDriverIds.push(userId);
            }
            if (offlineDriverIds.length === 0)
                return;
            await this.prisma.driver.updateMany({
                where: { userId: { in: offlineDriverIds } },
                data: { status: 'OFFLINE', updatedAt: new Date() },
            });
            offlineDriverIds.forEach((driverId) => {
                if (this.onlineEmitter)
                    this.onlineEmitter(driverId, 'OFFLINE');
            });
            console.log('Emited offline envents : ');
            this.logger.log(`✅ Marked ${offlineDriverIds.length} drivers OFFLINE`);
        }
        catch (err) {
            this.logger.error('Error updating offline drivers:', err);
        }
    }
    async markOfflineByDriverId(driverId) {
        const client = this.redisService.getClient();
        await client.del(`driver:${driverId}:online`);
        await this.prisma.driver.updateMany({
            where: { userId: driverId },
            data: { status: 'OFFLINE', updatedAt: new Date() },
        });
        if (this.onlineEmitter) {
            this.onlineEmitter(driverId, 'OFFLINE');
        }
    }
};
exports.DriverLocationService = DriverLocationService;
exports.DriverLocationService = DriverLocationService = DriverLocationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => websocket_event_service_1.WebSocketEventService))),
    __metadata("design:paramtypes", [redis_service_1.RedisService,
        prisma_service_1.PrismaService,
        websocket_event_service_1.WebSocketEventService])
], DriverLocationService);
//# sourceMappingURL=driver-location.service.js.map