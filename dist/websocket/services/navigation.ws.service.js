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
var NavigationWsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NavigationWsService = void 0;
const common_1 = require("@nestjs/common");
const navigation_service_1 = require("../../fulfillment/maps/navigation.service");
const route_optimizer_service_1 = require("../../fulfillment/maps/route-optimizer.service");
const websocket_event_service_1 = require("./websocket-event.service");
let NavigationWsService = NavigationWsService_1 = class NavigationWsService {
    constructor(routeCacheService, routeOptimizerService, wsEvent) {
        this.routeCacheService = routeCacheService;
        this.routeOptimizerService = routeOptimizerService;
        this.wsEvent = wsEvent;
        this.logger = new common_1.Logger(NavigationWsService_1.name);
    }
    async updateDriverNavigation(driverId, currentLocation, reportedStops) {
        const cachedRoute = await this.routeCacheService.getDriverRoute(driverId);
        console.log('Cached Routes : ', cachedRoute);
        if (!cachedRoute) {
            const result = await this.routeOptimizerService.computeOptimizedRoute(driverId, currentLocation, reportedStops);
            console.log('ROute on webservice ::::', result);
            this.logger.warn(`No cached route found for driver ${driverId}`);
            return result;
        }
        const updatedStops = cachedRoute.stops.map((stop) => {
            const reportedStop = reportedStops.find(r => r.orderId === stop.orderId);
            const visited = reportedStop?.visited ?? stop.visited;
            return {
                orderId: stop.orderId,
                lat: stop.lat,
                lon: stop.lon,
                seq: stop.seq,
                visited,
                distanceKm: stop.distanceKm,
                eta: stop.eta,
                meta: {
                    orderId: stop.orderId,
                    lat: stop.lat,
                    lon: stop.lon,
                    seq: stop.seq,
                    distanceKm: stop.distanceKm,
                    eta: stop.eta,
                },
            };
        });
        console.log('Updated stops : ', updatedStops);
        const updatedRoute = {
            ...cachedRoute,
            stops: updatedStops,
            lastUpdated: Date.now(),
            optimizationJobId: cachedRoute.optimizationJobId ?? 'unknown',
            totalDistance: cachedRoute.totalDistance ?? 0,
            totalDuration: cachedRoute.totalDuration ?? 0,
        };
        console.log('Updated Route : ', updatedRoute);
        await this.routeCacheService.saveDriverRoute(driverId, updatedRoute);
        for (const stop of updatedStops) {
            if (stop.visited) {
                await this.routeCacheService.markStopVisited(driverId, stop.orderId);
            }
        }
        const { route: recalculatedRoute, recalculated } = await this.routeOptimizerService.recalculateRouteIfDeviation(driverId, currentLocation, updatedRoute);
        if (recalculated && recalculatedRoute) {
            this.logger.log(`Route recalculated for driver ${driverId}`);
            const finalRoute = {
                ...updatedRoute,
                routeId: recalculatedRoute.routeId,
                totalDistance: recalculatedRoute.distanceMeters ?? updatedRoute.totalDistance,
                totalDuration: recalculatedRoute.durationSec ?? updatedRoute.totalDuration,
                lastUpdated: Date.now(),
            };
            console.log('Final Route : ', finalRoute);
            await this.routeCacheService.saveDriverRoute(driverId, finalRoute);
            this.wsEvent.emitDriverNavigationToDriver(driverId, finalRoute);
        }
        console.log('Final Updated Route : ');
        return updatedRoute;
    }
    async updateLiveRouteETA(driverId, lat, lon, speed) {
        await this.routeCacheService.updateLiveRouteProgress(driverId, lat, lon, speed);
    }
};
exports.NavigationWsService = NavigationWsService;
exports.NavigationWsService = NavigationWsService = NavigationWsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)((0, common_1.forwardRef)(() => navigation_service_1.RouteCacheService))),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => route_optimizer_service_1.RouteOptimizerService))),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => websocket_event_service_1.WebSocketEventService))),
    __metadata("design:paramtypes", [navigation_service_1.RouteCacheService,
        route_optimizer_service_1.RouteOptimizerService,
        websocket_event_service_1.WebSocketEventService])
], NavigationWsService);
//# sourceMappingURL=navigation.ws.service.js.map