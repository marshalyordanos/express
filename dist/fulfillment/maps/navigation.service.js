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
var RouteCacheService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouteCacheService = void 0;
const redis_service_1 = require("../../redis/redis.service");
const maps_repository_1 = require("./maps.repository");
const common_1 = require("@nestjs/common");
const route_optimizer_service_1 = require("./route-optimizer.service");
const maps_service_1 = require("./maps.service");
let RouteCacheService = RouteCacheService_1 = class RouteCacheService {
    constructor(mapRepo, redisClient, routeOptimizer, mapsService) {
        this.mapRepo = mapRepo;
        this.redisClient = redisClient;
        this.routeOptimizer = routeOptimizer;
        this.mapsService = mapsService;
        this.logger = new common_1.Logger(RouteCacheService_1.name);
    }
    async saveDriverRoute(driverId, route) {
        const key = `driver:${driverId}:currentRoute`;
        let remainingDurationSec = route.totalDuration ?? 0;
        if (!remainingDurationSec || remainingDurationSec <= 0) {
            const remainingKm = route.remainingDistance ??
                route.stops.reduce((acc, s) => acc + (s.distanceKm ?? 0), 0);
            const speedKmh = 40;
            remainingDurationSec = Math.round((remainingKm / speedKmh) * 3600);
        }
        route.remainingDurationSec = remainingDurationSec;
        const routeFinishMs = Date.now() + remainingDurationSec * 1000;
        const routeFinishISO = new Date(routeFinishMs).toISOString();
        await this.redisClient.set(key, JSON.stringify(route), { EX: 3600 });
        await this.redisClient.set(`driver:${driverId}:routeFinish`, routeFinishISO, { EX: 3600 });
        this.logger.debug(`Saved route for driver ${driverId} in Redis (finish: ${routeFinishISO})`);
    }
    async deleteDriverRoute(driverId) {
        await this.redisClient.del(`driver:${driverId}:currentRoute`);
        await this.redisClient.del(`driver:${driverId}:routeFinish`);
    }
    async getDriverRoute(driverId) {
        const key = `driver:${driverId}:currentRoute`;
        const data = (await this.redisClient.get(key));
        if (!data)
            return null;
        try {
            return JSON.parse(data);
        }
        catch (err) {
            this.logger.error(`Failed to parse driver route for ${driverId}: ${err.message}`);
            return null;
        }
    }
    async getDriverRouteWithStops(driverId, reportedStops) {
        const key = `driver:${driverId}:currentRoute`;
        const data = (await this.redisClient.get(key));
        if (!data)
            return null;
        try {
            const route = JSON.parse(data);
            if (reportedStops && reportedStops.length > 0) {
                const reportedIds = new Set(reportedStops.map((r) => r.orderId));
                route.stops = route.stops.filter((stop) => reportedIds.has(stop.orderId));
            }
            return route;
        }
        catch (err) {
            this.logger.error(`Failed to parse route for driver ${driverId}: ${err.message}`);
            return null;
        }
    }
    async removeDriverRoute(driverId) {
        await this.redisClient.del(`driver:${driverId}:currentRoute`);
        await this.redisClient.del(`driver:${driverId}:routeFinish`);
        this.logger.debug(`Removed route for driver ${driverId} from Redis`);
    }
    calculateDistanceKm(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
                Math.cos((lat2 * Math.PI) / 180) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    async updateLiveRouteProgress(driverId, lat, lon, speedKmh) {
        const route = await this.getDriverRoute(driverId);
        if (!route)
            return;
        const remainingStops = route.stops.filter((s) => !s.visited);
        if (!remainingStops || remainingStops.length === 0) {
            return;
        }
        const speed = speedKmh && speedKmh > 5 ? speedKmh : 40;
        const nextStop = remainingStops[0];
        const distanceToNextKm = this.calculateDistanceKm(lat, lon, nextStop.lat, nextStop.lon);
        const etaToNextMin = (distanceToNextKm / speed) * 60;
        nextStop.distanceKm = Number(distanceToNextKm.toFixed(3));
        nextStop.eta = Number(etaToNextMin.toFixed(1));
        let cumulativeRemainingKm = distanceToNextKm;
        for (let i = 0; i < remainingStops.length - 1; i++) {
            const cur = remainingStops[i];
            const nxt = remainingStops[i + 1];
            const dkm = this.calculateDistanceKm(cur.lat, cur.lon, nxt.lat, nxt.lon);
            cur.distanceKm = Number((cur.distanceKm ?? 0).toFixed(3));
            nxt.distanceKm = nxt.distanceKm ?? Number(dkm.toFixed(3));
            cumulativeRemainingKm += dkm;
        }
        route.remainingDistance = cumulativeRemainingKm;
        route.lastUpdated = Date.now();
        route.remainingDurationSec = Math.round((cumulativeRemainingKm / speed) * 3600);
        route.estimatedArrivalTime = new Date(Date.now() + Math.round(etaToNextMin * 60000)).toISOString();
        await this.saveDriverRoute(driverId, route);
        const deviationThresholdMeters = 300;
        if (distanceToNextKm * 1000 > deviationThresholdMeters) {
            const { route: recalculatedRoute, recalculated } = await this.routeOptimizer.recalculateRouteIfDeviation(driverId, { lat, lon }, {
                ...route,
                originalOptimizedOrder: route.originalOptimizedOrder ?? route.orderedStopIds,
            }, deviationThresholdMeters);
            if (recalculated && recalculatedRoute) {
                const rc = {
                    optimizationJobId: recalculatedRoute.routeId ?? '',
                    routeId: recalculatedRoute.routeId ?? '',
                    stops: (recalculatedRoute.stops || []).map((s) => ({
                        orderId: s.orderId,
                        lat: s.lat,
                        lon: s.lon,
                        seq: s.seq,
                        visited: false,
                        eta: undefined,
                        distanceKm: undefined,
                    })),
                    totalDistance: recalculatedRoute.distanceMeters ?? 0,
                    totalDuration: recalculatedRoute.durationSec ?? 0,
                    remainingDistance: undefined,
                    remainingDurationSec: recalculatedRoute.durationSec ?? 0,
                    estimatedArrivalTime: undefined,
                    lastUpdated: Date.now(),
                    orderedStopIds: recalculatedRoute.orderedStopIds,
                    originalOptimizedOrder: recalculatedRoute.originalOptimizedOrder ??
                        recalculatedRoute.orderedStopIds,
                };
                await this.saveDriverRoute(driverId, rc);
            }
        }
        else {
            const etaData = {
                driverId,
                nextStopId: nextStop.orderId,
                etaSeconds: Math.round(etaToNextMin * 60),
                remainingDistanceMeters: Math.round(cumulativeRemainingKm * 1000),
                recalculated: false,
            };
        }
        return {
            nextStop: {
                orderId: nextStop.orderId,
                distanceKm: nextStop.distanceKm,
                etaMin: nextStop.eta,
            },
        };
    }
    async updateLiveRouteETA(driverId, route, location) {
        try {
            const { route: recalculatedRoute, recalculated } = await this.routeOptimizer.recalculateRouteIfDeviation(driverId, location, route, 300);
            if (recalculated && recalculatedRoute) {
                const rc = {
                    optimizationJobId: recalculatedRoute.routeId ?? '',
                    routeId: recalculatedRoute.routeId ?? '',
                    stops: (recalculatedRoute.stops || []).map((s) => ({
                        orderId: s.orderId,
                        lat: s.lat,
                        lon: s.lon,
                        seq: s.seq,
                        visited: false,
                        eta: undefined,
                        distanceKm: undefined,
                    })),
                    totalDistance: recalculatedRoute.distanceMeters ?? 0,
                    totalDuration: recalculatedRoute.durationSec ?? 0,
                    remainingDistance: undefined,
                    remainingDurationSec: recalculatedRoute.durationSec ?? 0,
                    estimatedArrivalTime: undefined,
                    lastUpdated: Date.now(),
                    orderedStopIds: recalculatedRoute.orderedStopIds,
                    originalOptimizedOrder: recalculatedRoute.originalOptimizedOrder ??
                        recalculatedRoute.orderedStopIds,
                };
                await this.saveDriverRoute(driverId, rc);
            }
        }
        catch (err) {
            this.logger.error(`Failed to update ETA for driver ${driverId}: ${err.message}`);
        }
    }
    async markStopVisited(driverId, orderId) {
        const route = await this.getDriverRoute(driverId);
        if (!route)
            return;
        route.stops = route.stops.map((s) => s.orderId === orderId ? { ...s, visited: true } : s);
        route.lastUpdated = Date.now();
        await this.saveDriverRoute(driverId, route);
        const allVisited = route.stops.every((s) => s.visited);
        if (allVisited) {
            await this.completeRoute(driverId, route);
        }
    }
    async completeRoute(driverId, route) {
        try {
            for (let i = 0; i < route.stops.length - 1; i++) {
                const originStop = route.stops[i];
                const destStop = route.stops[i + 1];
                const originLoc = await this.mapRepo.upsertLocationFromCoords({
                    latitude: originStop.lat,
                    longitude: originStop.lon,
                    mapServiceResult: { name: originStop.orderId },
                });
                const destLoc = await this.mapRepo.upsertLocationFromCoords({
                    latitude: destStop.lat,
                    longitude: destStop.lon,
                    mapServiceResult: { name: destStop.orderId },
                });
                const dbRoute = await this.mapRepo.findRouteByOriginDest(originLoc.id, destLoc.id);
                if (dbRoute) {
                    await this.mapRepo.updateRoute(dbRoute.id, {
                        distanceKm: originStop.distanceKm || 0,
                        durationMin: originStop.eta || 0,
                        completed: true,
                    });
                }
            }
            await this.removeDriverRoute(driverId);
            this.logger.debug(`Route completed for driver ${driverId}`);
        }
        catch (err) {
            this.logger.error(`Failed to complete route for driver ${driverId}: ${err}`);
        }
    }
};
exports.RouteCacheService = RouteCacheService;
exports.RouteCacheService = RouteCacheService = RouteCacheService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [maps_repository_1.MapsRepository,
        redis_service_1.RedisService,
        route_optimizer_service_1.RouteOptimizerService,
        maps_service_1.MapsService])
], RouteCacheService);
//# sourceMappingURL=navigation.service.js.map