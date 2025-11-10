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
var RouteCacheService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouteCacheService = void 0;
const map_location_gateway_1 = require("../../websocket/gateways/map-location.gateway");
const redis_service_1 = require("../../redis/redis.service");
const maps_repository_1 = require("./maps.repository");
const common_1 = require("@nestjs/common");
const route_optimizer_service_1 = require("./route-optimizer.service");
const maps_service_1 = require("./maps.service");
let RouteCacheService = RouteCacheService_1 = class RouteCacheService {
    constructor(wsGateway, mapRepo, redisClient, routeOptimizer, mapsService) {
        this.wsGateway = wsGateway;
        this.mapRepo = mapRepo;
        this.redisClient = redisClient;
        this.routeOptimizer = routeOptimizer;
        this.mapsService = mapsService;
        this.logger = new common_1.Logger(RouteCacheService_1.name);
    }
    async saveDriverRoute(driverId, route) {
        const key = `driver:${driverId}:currentRoute`;
        await this.redisClient.set(key, JSON.stringify(route), { EX: 3600 });
        this.logger.debug(`Saved route for driver ${driverId} in Redis`);
        const data = (await this.redisClient.get(key));
        console.log('get route after saved ::: ', data, key);
        this.wsGateway.broadcastDriverRoute(driverId, route);
    }
    async deleteDriverRoute(driverId) {
        const key = `driver:${driverId}:currentRoute`;
        await this.redisClient.del(key);
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
            this.wsGateway.broadcastDriverRouteCompletion(driverId, route.optimizationJobId);
            this.logger.debug(`Route completed for driver ${driverId}`);
        }
        catch (err) {
            this.logger.error(`Failed to complete route for driver ${driverId}: ${err}`);
        }
    }
    async getDriverRoute(driverId) {
        const key = `driver:${driverId}:currentRoute`;
        const data = (await this.redisClient.get(key));
        console.log('get route ::: ', data, key);
        if (!data)
            return null;
        try {
            return JSON.parse(data);
        }
        catch {
            return null;
        }
    }
    async getDriverRouteWithStops(driverId, reportedStops) {
        const key = `driver:${driverId}:currentRoute`;
        console.log("keyyyyyyyyyyyyy ::: ", key);
        const data = await this.redisClient.gets(key);
        console.log('Second iiiiiiiii  ::: ', data);
        if (!data)
            return null;
        try {
            const route = JSON.parse(data);
            console.log('third iiiiiiiii  ::: ', route);
            if (reportedStops && reportedStops.length > 0) {
                const reportedIds = new Set(reportedStops.map((r) => r.orderId));
                console.log('fourth iiiiiiiii  ::: ', reportedIds);
                route.stops = route.stops.filter((stop) => reportedIds.has(stop.orderId));
            }
            console.log('fith iiiiiiiii  ::: ', route);
            return route;
        }
        catch (err) {
            console.error(`Failed to parse route for driver ${driverId}:`, err);
            return null;
        }
    }
    async removeDriverRoute(driverId) {
        await this.redisClient.del(`driver:${driverId}:currentRoute`);
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
        console.log('Route fro deviattion ::::: ', route);
        if (!route)
            return;
        const remainingStops = route.stops.filter((s) => !s.visited);
        if (!remainingStops)
            return;
        for (const stop of remainingStops) {
            const distance = this.calculateDistanceKm(lat, lon, stop.lat, stop.lon);
            const speed = speedKmh && speedKmh > 0 ? speedKmh : 40;
            const eta = (distance / speed) * 60;
            stop.distanceKm = Number(distance.toFixed(2));
            stop.eta = Number(eta.toFixed(1));
        }
        route.remainingDistance = remainingStops.reduce((acc, s) => acc + (s.distanceKm || 0), 0);
        await this.saveDriverRoute(driverId, route);
        for (const stop of remainingStops) {
            this.wsGateway.emitNextStopEta(driverId, stop, {
                lat,
                lon,
                speedKmh: speedKmh || 40,
            });
        }
        const result = await this.updateLiveRouteETA(driverId, route, { lat, lon });
        console.log('REsult result finallllllllllllllll:::', result);
        return result;
    }
    async updateLiveRouteETA(driverId, route, location) {
        try {
            const { route: recalculatedRoute, recalculated } = await this.routeOptimizer.recalculateRouteIfDeviation(driverId, location, route);
            if (recalculated && recalculatedRoute) {
                console.log('ROute is recalculated :::: ', recalculated, recalculatedRoute);
                await this.saveDriverRoute(driverId, recalculatedRoute);
                this.wsGateway.broadcastDriverRoute(driverId, recalculatedRoute);
                this.wsGateway.broadcastDriverLocationToDriver('route:recalculated', {
                    driverId,
                    recalculatedRoute,
                });
            }
            const remainingStops = recalculatedRoute.stops.filter((s) => !s.visited);
            for (const stop of remainingStops) {
                const { distance, duration } = await this.mapsService.getDirectionsOrdered([
                    { lat: location.lat, lon: location.lon },
                    { lat: stop.lat, lon: stop.lon },
                ]);
                const etaData = {
                    driverId,
                    nextStopId: stop.orderId,
                    etaSeconds: duration,
                    remainingDistance: distance,
                    recalculated,
                };
                this.wsGateway.broadcastDriverLocationToDriver(driverId, etaData);
                this.wsGateway.broadcastETAtoCustomer(etaData);
                this.logger.debug(`Updated ETA for driver ${driverId}: ${(duration / 60).toFixed(1)} min, ${Math.round(distance)} m`);
            }
        }
        catch (err) {
            this.logger.error(`Failed to update ETA for driver ${driverId}: ${err.message}`);
        }
    }
};
exports.RouteCacheService = RouteCacheService;
exports.RouteCacheService = RouteCacheService = RouteCacheService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)((0, common_1.forwardRef)(() => map_location_gateway_1.MapLocationGateway))),
    __metadata("design:paramtypes", [map_location_gateway_1.MapLocationGateway,
        maps_repository_1.MapsRepository,
        redis_service_1.RedisService,
        route_optimizer_service_1.RouteOptimizerService,
        maps_service_1.MapsService])
], RouteCacheService);
//# sourceMappingURL=navigation.service.js.map