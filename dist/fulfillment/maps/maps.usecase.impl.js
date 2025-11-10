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
exports.MapsUseCasesImpl = void 0;
const microservices_1 = require("@nestjs/microservices");
const common_1 = require("@nestjs/common");
const maps_repository_1 = require("./maps.repository");
const route_optimizer_service_1 = require("./route-optimizer.service");
const maps_service_1 = require("./maps.service");
const navigation_service_1 = require("./navigation.service");
let MapsUseCasesImpl = class MapsUseCasesImpl {
    constructor(mapRepo, routeOptimizerService, mapService, routeCacheService) {
        this.mapRepo = mapRepo;
        this.routeOptimizerService = routeOptimizerService;
        this.mapService = mapService;
        this.routeCacheService = routeCacheService;
    }
    async createDriver(body) {
        const user = await this.mapRepo.findUserById(body.userId);
        if (!user) {
            throw new microservices_1.RpcException({
                statusCode: 404,
                message: 'User Not found. We can not create driver.',
            });
        }
        return this.mapRepo.createDriver(body);
    }
    async createDriverLocation(body) {
        throw new Error('Method not implemented.');
    }
    async getDrivers(query) {
        throw new Error('Method not implemented.');
    }
    async getDriverById(id) {
        throw new Error('Method not implemented.');
    }
    async getRoute(driverId) {
        let route = null;
        const driver = await this.mapRepo.findDriverById(driverId);
        if (!driver)
            throw new Error('Driver not found');
        const orders = await this.mapRepo.findOrdersByDriverId(driverId);
        if (!orders.length)
            return null;
        const driverLocation = { lat: driver.lat, lon: driver.lon };
        const stops = orders.map((o) => ({
            orderId: o.orderId,
            lat: o.lat,
            lon: o.lon,
        }));
        const optimizedRoute = await this.routeOptimizerService.computeOptimizedRoute(driverId, driverLocation, stops);
        const optimizationJob = await this.mapRepo.createOptimizationJob({
            driverId: driver.id,
            jobCode: `JOB-${Date.now()}`,
            type: 'MULTI_STOP',
            status: 'PENDING',
            optimizedOrder: optimizedRoute.stops,
            totalDistance: optimizedRoute.distanceMeters,
            totalDuration: optimizedRoute.durationSec / 60,
        });
        for (let i = 0; i < optimizedRoute.stops.length - 1; i++) {
            const origin = optimizedRoute.stops[i];
            const destination = optimizedRoute.stops[i + 1];
            const originLoc = await this.mapRepo.upsertLocationFromCoords({
                latitude: Number(origin.lat),
                longitude: Number(origin.lon),
                mapServiceResult: origin.mapServiceResult,
            });
            const destinationLoc = await this.mapRepo.upsertLocationFromCoords({
                latitude: Number(destination.lat),
                longitude: Number(destination.lon),
                mapServiceResult: destination.mapServiceResult,
            });
            route = await this.mapRepo.createRoute({
                originId: originLoc.id,
                destinationId: destinationLoc.id,
                distanceKm: optimizedRoute.segments[i]?.distance / 1000 || 0,
                durationMin: optimizedRoute.segments[i]?.duration / 60 || 0,
                routePath: optimizedRoute.segments,
                optimized: true,
                trafficAware: false,
                optimizationJobId: optimizationJob.id,
            });
        }
        await this.routeCacheService.saveDriverRoute(driverId, {
            optimizationJobId: optimizationJob.id,
            routeId: route.id,
            stops: optimizedRoute.stops.map((s) => ({ ...s, visited: false })),
            totalDistance: optimizedRoute.distanceMeters,
            totalDuration: optimizedRoute.durationSec,
            lastUpdated: Date.now(),
        });
        return {
            optimizationJobId: optimizationJob.id,
            route: optimizedRoute,
        };
    }
    async markStopVisited(driverId, orderId) {
        if (!orderId) {
            throw new microservices_1.RpcException('orderId is required');
        }
        const route = await this.routeCacheService.getDriverRoute(driverId);
        if (!route)
            throw new microservices_1.RpcException('No route found for driver');
        route.stops = route.stops.map((s) => s.orderId === orderId ? { ...s, visited: true } : s);
        await this.routeCacheService.saveDriverRoute(driverId, route);
        const allVisited = route.stops.every((s) => s.visited);
        if (allVisited) {
            await this.mapRepo.updateOptimizationJobStatus(route.optimizationJobId, 'COMPLETED');
            await this.routeCacheService.deleteDriverRoute(driverId);
            return { message: 'All stops visited. Route completed.' };
        }
        return { message: `Stop ${orderId} marked as visited.` };
    }
    async getRouteStatus(driverId) {
        try {
            const route = await this.routeCacheService.getDriverRoute(driverId);
            if (!route)
                return { status: 'no_route', route: null };
            return { status: 'ok', route };
        }
        catch (err) {
            throw new microservices_1.RpcException(err.message);
        }
    }
};
exports.MapsUseCasesImpl = MapsUseCasesImpl;
exports.MapsUseCasesImpl = MapsUseCasesImpl = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => route_optimizer_service_1.RouteOptimizerService))),
    __metadata("design:paramtypes", [maps_repository_1.MapsRepository,
        route_optimizer_service_1.RouteOptimizerService,
        maps_service_1.MapsService,
        navigation_service_1.RouteCacheService])
], MapsUseCasesImpl);
//# sourceMappingURL=maps.usecase.impl.js.map