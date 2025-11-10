"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var MapsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapsService = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const axios_1 = require("axios");
let MapsService = MapsService_1 = class MapsService {
    constructor() {
        this.logger = new common_1.Logger(MapsService_1.name);
    }
    async reverseGeocode(lat, lon) {
        try {
            const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`;
            const response = await axios_1.default.get(url, {
                headers: { 'User-Agent': 'CourierApp/1.0' },
                timeout: 5000,
            });
            const data = response.data || {};
            const address = data.address || {};
            console.log("Data for address to be created inside mapservice for data:::::", data);
            console.log("Data for address to be created inside mapservice for address:::::", address);
            return {
                name: data.name || address.road || undefined,
                address: [address.house_number, address.road, address.suburb]
                    .filter(Boolean)
                    .join(', ') || undefined,
                city: address.city ||
                    address.town ||
                    address.village ||
                    address.county ||
                    undefined,
                country: address.country || undefined,
                postalCode: address.postcode || undefined,
                addressLine: address.road || undefined,
                state: address.state || undefined
            };
        }
        catch (err) {
            this.logger.warn(`Reverse geocode failed for ${lat},${lon}: ${err.message} ${err?.response?.data}  ::: ${err}`);
            return {};
        }
    }
    async calculateDistance(origin, destination) {
        const o = { lat: Number(origin.lat), lon: Number(origin.lon) };
        const d = { lat: Number(destination.lat), lon: Number(destination.lon) };
        if ([o.lat, o.lon, d.lat, d.lon].some((v) => Number.isNaN(v))) {
            throw new microservices_1.RpcException('Invalid coordinates (not numbers)');
        }
        try {
            return await this.callOpenRouteService(o, d);
        }
        catch (err) {
            console.warn('ORS routing failed, falling back to Haversine:', err?.message ?? err);
            return Number(this.haversineKm(o.lat, o.lon, d.lat, d.lon).toFixed(2));
        }
    }
    async callOpenRouteService(origin, destination) {
        const apiKey = process.env.OPENROUTESERVICE_API_KEY;
        const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${origin.lon},${origin.lat}&end=${destination.lon},${destination.lat}`;
        const response = await axios_1.default.get(url, {
            headers: { 'User-Agent': 'CourierApp/1.0' },
            timeout: 5000,
        });
        const data = response.data || {};
        if (!response.status || response.status < 200 || response.status > 299) {
            throw new Error(`ORS API error: ${data?.error?.message ?? response.statusText}`);
        }
        const routeDistanceMeters = data?.routes?.[0]?.summary?.distance ??
            data?.features?.[0]?.properties?.summary?.distance ??
            data?.features?.[0]?.properties?.segments?.[0]?.distance ??
            (data?.features?.[0]?.geometry?.coordinates
                ? this.sumCoordinatesDistanceKm(data.features[0].geometry.coordinates) *
                    1000
                : undefined);
        if (routeDistanceMeters == null || Number.isNaN(routeDistanceMeters)) {
            console.error('ORS: no distance in response and no usable geometry:', JSON.stringify(data?.features?.[0]?.properties ?? data, null, 2));
            throw new Error('ORS: no valid route distance found');
        }
        const distanceKm = Number(routeDistanceMeters) / 1000;
        return Number(distanceKm.toFixed(2));
    }
    async computeMatrix(points) {
        if (!Array.isArray(points) || points.length === 0) {
            return { distances: [] };
        }
        const coords = points.map((p) => [Number(p.lon), Number(p.lat)]);
        if (coords.some(([lon, lat]) => Number.isNaN(lon) || Number.isNaN(lat))) {
            throw new microservices_1.RpcException('Invalid coordinates for matrix (not numbers)');
        }
        const apiKey = process.env.OPENROUTESERVICE_API_KEY;
        const url = 'https://api.openrouteservice.org/v2/matrix/driving-car';
        try {
            const body = {
                locations: coords,
                metrics: ['distance', 'duration'],
                units: 'm',
            };
            const response = await axios_1.default.post(url, body, {
                headers: {
                    Authorization: apiKey ?? '',
                    'Content-Type': 'application/json; charset=utf-8',
                    Accept: 'application/json, application/geo+json',
                },
            });
            const data = response.data;
            const distances = data?.distances || data?.distances_matrix || null;
            const durations = data?.durations || null;
            if (!distances || !Array.isArray(distances)) {
                throw new Error('ORS Matrix returned no distances array');
            }
            return { distances, durations };
        }
        catch (err) {
            if (err.response) {
                console.error(`ORS Matrix error: ${err.response.status} ${JSON.stringify(err.response.data)}`);
            }
            else {
                console.error(`ORS Matrix request failed: ${err.message}`);
            }
            const fallback = await this.computePairwiseMatrix(points);
            return fallback;
        }
    }
    async calculateDistanceFromRoute(driverLocation, routeGeometry) {
        if (!routeGeometry || !routeGeometry.coordinates)
            return Infinity;
        const { lat, lon } = driverLocation;
        const [driverLon, driverLat] = [Number(lon), Number(lat)];
        let minDist = Infinity;
        for (const [lon2, lat2] of routeGeometry.coordinates) {
            const d = this.calculateHaversineDistance({ lat: driverLat, lon: driverLon }, { lat: lat2, lon: lon2 });
            if (d < minDist)
                minDist = d;
        }
        return minDist;
    }
    calculateHaversineDistance(a, b) {
        const R = 6371000;
        const dLat = ((b.lat - a.lat) * Math.PI) / 180;
        const dLon = ((b.lon - a.lon) * Math.PI) / 180;
        const lat1 = (a.lat * Math.PI) / 180;
        const lat2 = (b.lat * Math.PI) / 180;
        const hav = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
        return 2 * R * Math.atan2(Math.sqrt(hav), Math.sqrt(1 - hav));
    }
    async getDirectionsOrdered(points) {
        if (!Array.isArray(points) || points.length < 2) {
            return { geometry: null, distance: 0, duration: 0, segments: [] };
        }
        const apiKey = process.env.OPENROUTESERVICE_API_KEY;
        const url = 'https://api.openrouteservice.org/v2/directions/driving-car';
        const coordinates = points.map((p) => [Number(p.lon), Number(p.lat)]);
        if (coordinates.some(([lon, lat]) => Number.isNaN(lon) || Number.isNaN(lat))) {
            throw new microservices_1.RpcException('Invalid coordinates for directions (not numbers)');
        }
        try {
            const requestBody = {
                coordinates,
            };
            const response = await axios_1.default.post(url, requestBody, {
                headers: {
                    Authorization: apiKey ??
                        'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjgwMmU3YTY3MDMwMjRlZjViNWE4MzczYzE3ZGZlNDBkIiwiaCI6Im11cm11cjY0In0=',
                    'Content-Type': 'application/json; charset=utf-8',
                    Accept: 'application/json, application/geo+json',
                },
            });
            const data = response.data;
            const route = data?.routes?.[0] ?? data?.features?.[0]?.properties ?? null;
            let geometry = null;
            if (data?.routes?.[0]?.geometry)
                geometry = data.routes[0].geometry;
            else if (data?.features?.[0]?.geometry)
                geometry = data.features[0].geometry;
            else
                geometry = null;
            const segments = data?.routes?.[0]?.segments ??
                data?.features?.[0]?.properties?.segments ??
                [];
            const distance = data?.routes?.[0]?.summary?.distance ??
                data?.features?.[0]?.properties?.summary?.distance ??
                data?.features?.[0]?.properties?.segments?.[0]?.distance ??
                0;
            const duration = data?.routes?.[0]?.summary?.duration ??
                data?.features?.[0]?.properties?.summary?.duration ??
                data?.features?.[0]?.properties?.segments?.[0]?.duration ??
                0;
            return {
                geometry,
                distance: Number(distance),
                duration: Number(duration),
                segments,
            };
        }
        catch (err) {
            if (err.response) {
                throw new Error(`ORS Directions error: ${err.response.status} ${JSON.stringify(err.response.data)}`);
            }
            else {
                throw new Error(`Directions call failed: ${err.message}`);
            }
        }
    }
    async computePairwiseMatrix(points) {
        const n = points.length;
        const distances = Array.from({ length: n }, () => Array(n).fill(0));
        for (let i = 0; i < n; i++) {
            for (let j = i + 1; j < n; j++) {
                try {
                    const km = await this.calculateDistance(points[i], points[j]);
                    const meters = Math.round(km * 1000);
                    distances[i][j] = distances[j][i] = meters;
                }
                catch (err) {
                    const km = this.haversineKm(points[i].lat, points[i].lon, points[j].lat, points[j].lon);
                    const meters = Math.round(km * 1000);
                    distances[i][j] = distances[j][i] = meters;
                }
            }
        }
        return { distances };
    }
    sumCoordinatesDistanceKm(coords) {
        if (!Array.isArray(coords) || coords.length < 2)
            return 0;
        let totalKm = 0;
        for (let i = 1; i < coords.length; i++) {
            const [lon1, lat1] = coords[i - 1];
            const [lon2, lat2] = coords[i];
            const a = Number(lat1), b = Number(lon1), c = Number(lat2), d = Number(lon2);
            if ([a, b, c, d].some((v) => Number.isNaN(v)))
                continue;
            totalKm += this.haversineKm(a, b, c, d);
        }
        return Number(totalKm.toFixed(3));
    }
    haversineKm(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const toRad = (deg) => (deg * Math.PI) / 180;
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
};
exports.MapsService = MapsService;
exports.MapsService = MapsService = MapsService_1 = __decorate([
    (0, common_1.Injectable)()
], MapsService);
//# sourceMappingURL=maps.service.js.map