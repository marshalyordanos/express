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
            if (this.onlineEmitter)
                this.onlineEmitter(data.driverId, 'ONLINE');
            if (!isOnlineAlready) {
                await this.prisma.driver.update({
                    where: { userId: data.driverId },
                    data: { status: 'ONLINE', updatedAt: new Date() },
                });
                this.logger.log(`Driver ${data.driverId} came ONLINE — saved in DB.`);
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
    async findNearbyDrivers(orderIds, radiusKm) {
        const client = this.redisService.getClient();
        const orders = await this.prisma.order.findMany({
            where: { id: { in: orderIds } },
            select: {
                id: true,
                weight: true,
                serviceType: true,
                fulfillmentType: true,
                shippingScope: true,
                pickupAddress: { select: { lat: true, long: true } },
                deliveryAddress: { select: { lat: true, long: true } },
                pickupDate: true,
                deliveryDate: true,
            },
        });
        if (!orders.length)
            return [];
        console.log('Orders fetched :::: ', orders);
        const batchWeightKg = orders.reduce((sum, o) => sum + (o.weight || 0), 0);
        console.log('Orders weight kg ::: ', batchWeightKg);
        const coordsForDistance = [];
        for (const o of orders) {
            const pickup = o.pickupAddress
                ? { lat: Number(o.pickupAddress.lat), lon: Number(o.pickupAddress.long) }
                : null;
            const delivery = o.deliveryAddress
                ? { lat: Number(o.deliveryAddress.lat), lon: Number(o.deliveryAddress.long) }
                : null;
            if (o.fulfillmentType === 'PICKUP') {
                if (pickup)
                    coordsForDistance.push(pickup);
                if (o.shippingScope === 'TOWN' && delivery)
                    coordsForDistance.push(delivery);
            }
            else if (o.fulfillmentType === 'DROPOFF') {
                if (delivery)
                    coordsForDistance.push(delivery);
            }
        }
        if (!coordsForDistance.length)
            coordsForDistance.push({ lat: 0, lon: 0 });
        const centroid = (points) => {
            const sum = points.reduce((acc, p) => ((acc.lat += p.lat), (acc.lon += p.lon), acc), { lat: 0, lon: 0 });
            return { lat: sum.lat / points.length, lon: sum.lon / points.length };
        };
        const target = centroid(coordsForDistance);
        console.log('target order :: ', target);
        const sameDayOrders = orders.filter((o) => o.serviceType === 'SAME_DAY');
        let earliestScheduledTimeMs = null;
        if (sameDayOrders.length) {
            for (const o of sameDayOrders) {
                const times = [];
                if (o.pickupDate)
                    times.push(o.pickupDate);
                if (o.deliveryDate)
                    times.push(o.deliveryDate);
                const validTs = times.filter(Boolean);
                if (!validTs.length)
                    continue;
                const minTime = Math.min(...validTs.map((d) => d.getTime()));
                earliestScheduledTimeMs =
                    earliestScheduledTimeMs == null
                        ? minTime
                        : Math.min(earliestScheduledTimeMs, minTime);
            }
        }
        console.log('Earliest schedule time ms :: ', earliestScheduledTimeMs);
        const rawDrivers = (await client.sendCommand([
            'GEOSEARCH',
            this.GEO_KEY,
            'FROMLONLAT',
            target.lon.toString(),
            target.lat.toString(),
            'BYRADIUS',
            radiusKm.toString(),
            'km',
            'WITHDIST',
            'WITHCOORD',
        ]));
        if (!rawDrivers?.length)
            return [];
        const nearbyMap = new Map();
        const userIds = [];
        for (const d of rawDrivers) {
            const member = d[0];
            const distanceKm = parseFloat(d[1]);
            const coord = d[2];
            nearbyMap.set(member, { distanceKm, lon: parseFloat(coord[0]), lat: parseFloat(coord[1]) });
            userIds.push(member);
        }
        const driverRecords = await this.prisma.driver.findMany({
            where: { userId: { in: userIds }, status: 'ONLINE' },
            include: {
                user: {
                    include: {
                        pickupOrders: {
                            where: { status: { in: ['ASSIGNED', 'OUT_FOR_DELIVERY', 'PICKED_UP', 'IN_TRANSIT'] } },
                            select: { id: true, weight: true },
                        },
                        deliveryOrders: {
                            where: { status: { in: ['ASSIGNED', 'OUT_FOR_DELIVERY', 'PICKED_UP', 'IN_TRANSIT'] } },
                            select: { id: true, weight: true },
                        },
                    },
                },
                vehicles: true,
            },
        });
        const results = [];
        const nowMs = Date.now();
        const WEIGHTS = { distance: 0.35, capacity: 0.25, eta: 0.2, freshness: 0.1, online: 0.1 };
        const DEFAULT_TRAVEL_BUFFER_MIN = 5;
        for (const drv of driverRecords) {
            const geo = nearbyMap.get(drv.userId);
            if (!geo)
                continue;
            const pickupLoad = (drv.user?.pickupOrders || []).reduce((s, o) => s + (o.weight || 0), 0);
            const deliveryLoad = (drv.user?.deliveryOrders || []).reduce((s, o) => s + (o.weight || 0), 0);
            const currentLoadKg = pickupLoad + deliveryLoad;
            const vehicle = drv.vehicles?.[0];
            if (!vehicle?.maxLoad)
                continue;
            const vehicleMaxLoadKg = Number(vehicle.maxLoad);
            if (currentLoadKg + batchWeightKg > vehicleMaxLoadKg)
                continue;
            const routeFinishKey = `driver:${drv.userId}:routeFinish`;
            let routeFinishMs = 0;
            try {
                const routeFinishStr = (await client.get(routeFinishKey));
                if (routeFinishStr)
                    routeFinishMs = new Date(routeFinishStr).getTime();
            }
            catch { }
            if (earliestScheduledTimeMs != null &&
                routeFinishMs > earliestScheduledTimeMs - DEFAULT_TRAVEL_BUFFER_MIN * 60000)
                continue;
            let distanceScore = 0;
            for (const o of orders) {
                const pickup = o.pickupAddress ? { lat: Number(o.pickupAddress.lat), lon: Number(o.pickupAddress.long) } : null;
                const delivery = o.deliveryAddress ? { lat: Number(o.deliveryAddress.lat), lon: Number(o.deliveryAddress.long) } : null;
                let dist = 0;
                if (o.fulfillmentType === 'PICKUP') {
                    if (pickup && delivery && o.shippingScope === 'TOWN')
                        dist = Math.min(this.calcDistanceKm(geo.lat, geo.lon, pickup.lat, pickup.lon), this.calcDistanceKm(geo.lat, geo.lon, delivery.lat, delivery.lon));
                    else if (pickup)
                        dist = this.calcDistanceKm(geo.lat, geo.lon, pickup.lat, pickup.lon);
                    else if (delivery)
                        dist = this.calcDistanceKm(geo.lat, geo.lon, delivery.lat, delivery.lon);
                }
                else if (o.fulfillmentType === 'DROPOFF') {
                    if (delivery)
                        dist = this.calcDistanceKm(geo.lat, geo.lon, delivery.lat, delivery.lon);
                }
                distanceScore += 1 / (dist + 0.1);
            }
            distanceScore /= orders.length;
            const capacityScore = 1 - (currentLoadKg + batchWeightKg) / vehicleMaxLoadKg;
            let etaScore = 1;
            if (earliestScheduledTimeMs) {
                const timeUntilEarliestMin = Math.max(0, (earliestScheduledTimeMs - nowMs) / 60000);
                const availableInMin = Math.max(0, (routeFinishMs - nowMs) / 60000);
                etaScore =
                    availableInMin <= 0 || availableInMin <= timeUntilEarliestMin
                        ? 1
                        : Math.max(0, (timeUntilEarliestMin - availableInMin) / Math.max(1, timeUntilEarliestMin));
            }
            const lastUpdatedScore = drv.updatedAt && nowMs - drv.updatedAt.getTime() < 5 * 60 * 1000 ? 1 : 0.5;
            const onlineScore = drv.status === 'ONLINE' ? 1 : 0;
            const finalScore = distanceScore * WEIGHTS.distance +
                capacityScore * WEIGHTS.capacity +
                etaScore * WEIGHTS.eta +
                lastUpdatedScore * WEIGHTS.freshness +
                onlineScore * WEIGHTS.online;
            const suggestedForOrders = orders
                .filter((o) => {
                const pickup = o.pickupAddress ? { lat: Number(o.pickupAddress.lat), lon: Number(o.pickupAddress.long) } : null;
                const delivery = o.deliveryAddress ? { lat: Number(o.deliveryAddress.lat), lon: Number(o.deliveryAddress.long) } : null;
                let dist = 0;
                if (o.fulfillmentType === 'PICKUP') {
                    if (pickup && delivery && o.shippingScope === 'TOWN')
                        dist = Math.min(this.calcDistanceKm(geo.lat, geo.lon, pickup.lat, pickup.lon), this.calcDistanceKm(geo.lat, geo.lon, delivery.lat, delivery.lon));
                    else if (pickup)
                        dist = this.calcDistanceKm(geo.lat, geo.lon, pickup.lat, pickup.lon);
                    else if (delivery)
                        dist = this.calcDistanceKm(geo.lat, geo.lon, delivery.lat, delivery.lon);
                }
                else if (o.fulfillmentType === 'DROPOFF') {
                    if (delivery)
                        dist = this.calcDistanceKm(geo.lat, geo.lon, delivery.lat, delivery.lon);
                }
                return dist <= radiusKm;
            })
                .map((o) => o.id);
            results.push({
                driverId: drv.id,
                userId: drv.userId,
                distanceKm: geo.distanceKm,
                currentLat: geo.lat,
                currentLon: geo.lon,
                activeOrders: (drv.user?.pickupOrders?.length || 0) + (drv.user?.deliveryOrders?.length || 0),
                lastUpdated: drv.updatedAt,
                score: finalScore,
                suggestedForOrders,
            });
        }
        results.sort((a, b) => b.score - a.score);
        results.forEach((r, idx) => (r.rank = idx + 1));
        return results;
    }
    async findNearbyExternalDrivers(lon, lat, radiusKm) {
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
        if (!rawDrivers?.length)
            return [];
        const drivers = [];
        for (const d of rawDrivers) {
            const driverId = d[0];
            const isOnline = await client.exists(`driver:${driverId}:online`);
            if (!isOnline)
                continue;
            const distanceKm = parseFloat(d[1]);
            const coord = d[2];
            drivers.push({
                driverId,
                distanceKm,
                coordinates: {
                    lon: parseFloat(coord[0]),
                    lat: parseFloat(coord[1]),
                },
            });
        }
        return drivers;
    }
    calcDistanceKm(lat1, lon1, lat2, lon2) {
        const toRad = (deg) => (deg * Math.PI) / 180;
        const R = 6371;
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
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
            if (!driver)
                continue;
            const now = new Date();
            if (!driver.updatedAt ||
                (now.getTime() - driver.updatedAt.getTime()) / 1000 >
                    this.STATUS_PERSIST_MINUTES * 60) {
                await this.prisma.driver.update({
                    where: { userId },
                    data: { currentLat: lat, currentLon: lon, updatedAt: now, status },
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
            if (!offlineDriverIds.length)
                return;
            await this.prisma.driver.updateMany({
                where: { userId: { in: offlineDriverIds } },
                data: { status: 'OFFLINE', updatedAt: new Date() },
            });
            offlineDriverIds.forEach((driverId) => {
                if (this.onlineEmitter)
                    this.onlineEmitter(driverId, 'OFFLINE');
            });
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
        if (this.onlineEmitter)
            this.onlineEmitter(driverId, 'OFFLINE');
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