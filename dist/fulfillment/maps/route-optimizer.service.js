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
var RouteOptimizerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouteOptimizerService = void 0;
const common_1 = require("@nestjs/common");
const maps_service_1 = require("./maps.service");
let RouteOptimizerService = RouteOptimizerService_1 = class RouteOptimizerService {
    constructor(mapsService) {
        this.mapsService = mapsService;
        this.logger = new common_1.Logger(RouteOptimizerService_1.name);
    }
    async computeOptimizedRoute(driverId, driverLocation, stops) {
        if (!stops || stops.length === 0) {
            return this.emptyRoute(driverId, driverLocation);
        }
        const points = [
            { id: '__driver', lat: driverLocation.lat, lon: driverLocation.lon },
            ...stops.map((s) => ({ id: s.orderId, lat: s.lat, lon: s.lon })),
        ];
        const matrixObj = await this.mapsService.computeMatrix(points.map((p) => ({ lat: p.lat, lon: p.lon })));
        const distances = matrixObj.distances;
        if (!distances || distances.length === 0) {
            throw new Error('Failed to compute distance matrix');
        }
        const tour = this.solveTspNearest2Opt(distances, 0);
        const orderedPointIndices = tour.slice(1);
        const orderedStops = orderedPointIndices.map((idx, seq) => {
            const p = points[idx];
            const originalStop = stops.find((s) => s.orderId === p.id) ?? null;
            return {
                orderId: p.id,
                lat: p.lat,
                lon: p.lon,
                seq: seq + 1,
                visited: false,
                meta: originalStop ? { ...originalStop } : undefined,
            };
        });
        const originalOptimizedOrder = orderedStops.map((s) => s.orderId);
        const orderedPointsForDirections = [
            { lat: points[tour[0]].lat, lon: points[tour[0]].lon },
            ...orderedStops.map((s) => ({ lat: s.lat, lon: s.lon })),
        ];
        let directionsResult;
        try {
            directionsResult = await this.mapsService.getDirectionsOrdered(orderedPointsForDirections);
        }
        catch (err) {
            const approxDistance = this.sumTourDistanceMeters(distances, tour);
            this.logger.warn('ORS directions failed — returning approximation', err);
            return {
                routeId: `route:${driverId}:${Date.now()}`,
                driverId,
                stops: orderedStops,
                orderedStopIds: orderedStops.map((s) => s.orderId),
                originalOptimizedOrder,
                geometry: null,
                distanceMeters: approxDistance,
                durationSec: null,
                segments: [],
                generatedAt: Date.now(),
                strategy: 'matrix+nearest-2opt',
            };
        }
        return {
            routeId: `route:${driverId}:${Date.now()}`,
            driverId,
            stops: orderedStops,
            orderedStopIds: orderedStops.map((s) => s.orderId),
            originalOptimizedOrder,
            geometry: directionsResult.geometry,
            distanceMeters: directionsResult.distance,
            durationSec: directionsResult.duration,
            segments: directionsResult.segments,
            generatedAt: Date.now(),
            strategy: 'matrix+nearest-2opt',
        };
    }
    async recalculateRouteIfDeviation(driverId, driverLocation, currentRoute, deviationThresholdMeters = 300) {
        try {
            const nextStop = currentRoute.stops.find((s) => !s.visited);
            if (!nextStop) {
                return { route: currentRoute, recalculated: false };
            }
            const distanceToNext = this.haversineKm(driverLocation.lat, driverLocation.lon, nextStop.lat, nextStop.lon) * 1000;
            if (distanceToNext <= deviationThresholdMeters) {
                return { route: currentRoute, recalculated: false };
            }
            this.logger.warn(`Driver ${driverId} deviated ${Math.round(distanceToNext)}m from next stop ${nextStop.orderId}. Recalculating route.`);
            const remainingIds = (currentRoute.originalOptimizedOrder ||
                currentRoute.orderedStopIds ||
                []).filter((id) => !currentRoute.stops.find((s) => s.orderId === id)?.visited);
            const remainingStops = remainingIds.map((id) => {
                const s = currentRoute.stops.find((st) => st.orderId === id);
                return {
                    orderId: s.orderId,
                    lat: s.lat,
                    lon: s.lon,
                    ...(s.meta ? { meta: s.meta } : {}),
                };
            });
            const newRoute = await this.computeOptimizedRoute(driverId, driverLocation, remainingStops);
            return { route: newRoute, recalculated: true };
        }
        catch (err) {
            this.logger.error(`Error in route deviation check: ${err.message}`);
            return { route: currentRoute, recalculated: false };
        }
    }
    solveTspNearest2Opt(distances, startIdx = 0) {
        const n = distances.length;
        if (n <= 1)
            return [0];
        const visited = new Array(n).fill(false);
        const tour = [startIdx];
        visited[startIdx] = true;
        for (let step = 1; step < n; step++) {
            const last = tour[tour.length - 1];
            let next = -1;
            let best = Infinity;
            for (let i = 0; i < n; i++) {
                if (visited[i])
                    continue;
                const d = distances[last]?.[i] ?? Infinity;
                if (d < best) {
                    best = d;
                    next = i;
                }
            }
            if (next === -1)
                break;
            tour.push(next);
            visited[next] = true;
        }
        let improved = true;
        while (improved) {
            improved = false;
            for (let i = 1; i < n - 1; i++) {
                for (let k = i + 1; k < n; k++) {
                    const delta = this.calc2OptDelta(distances, tour, i, k);
                    if (delta < -1e-6) {
                        const segment = tour.slice(i, k + 1).reverse();
                        tour.splice(i, k - i + 1, ...segment);
                        improved = true;
                    }
                }
            }
        }
        return tour;
    }
    calc2OptDelta(distances, tour, i, k) {
        const a = tour[i - 1];
        const b = tour[i];
        const c = tour[k];
        const d = tour[k + 1] ?? tour[0];
        const dab = distances[a]?.[b] ?? Infinity;
        const cdd = distances[c]?.[d] ?? Infinity;
        const dac = distances[a]?.[c] ?? Infinity;
        const cbd = distances[b]?.[d] ?? Infinity;
        return dac + cbd - (dab + cdd);
    }
    sumTourDistanceMeters(distances, tour) {
        let s = 0;
        for (let i = 0; i < tour.length - 1; i++) {
            s += distances[tour[i]]?.[tour[i + 1]] ?? 0;
        }
        return s;
    }
    emptyRoute(driverId, driverLocation) {
        return {
            routeId: `route:${driverId}:empty:${Date.now()}`,
            driverId,
            stops: [],
            orderedStopIds: [],
            originalOptimizedOrder: [],
            geometry: null,
            distanceMeters: 0,
            durationSec: 0,
            segments: [],
            generatedAt: Date.now(),
            strategy: 'none',
        };
    }
    haversineKm(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const toRad = (deg) => (deg * Math.PI) / 180;
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) *
                Math.cos(toRad(lat2)) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
};
exports.RouteOptimizerService = RouteOptimizerService;
exports.RouteOptimizerService = RouteOptimizerService = RouteOptimizerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)((0, common_1.forwardRef)(() => maps_service_1.MapsService))),
    __metadata("design:paramtypes", [maps_service_1.MapsService])
], RouteOptimizerService);
//# sourceMappingURL=route-optimizer.service.js.map