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
exports.DriverLocationWsService = void 0;
const common_1 = require("@nestjs/common");
const driver_location_service_1 = require("../../fulfillment/maps/driver-location.service");
let DriverLocationWsService = class DriverLocationWsService {
    constructor(driverLocationService) {
        this.driverLocationService = driverLocationService;
    }
    async updateDriverLocation(payload) {
        return this.driverLocationService.updateDriverLocation(payload);
    }
    async findNearbyDrivers(lat, lon, radiusKm) {
        return this.driverLocationService.findNearbyDrivers(lon, lat, radiusKm);
    }
    markOffline(driverId) {
        return this.driverLocationService.markOfflineByDriverId(driverId);
    }
    setOnlineEmitter(callback) {
        const wrappedCallback = (driverId, status) => {
            console.log('🚚 Driver Status Callback Triggered:');
            console.log('Driver ID:', driverId);
            console.log('Status:', status);
            callback(driverId, status);
        };
        console.log('✅ Online emitter initialized');
        this.driverLocationService.setOnlineEmitter(wrappedCallback);
    }
};
exports.DriverLocationWsService = DriverLocationWsService;
exports.DriverLocationWsService = DriverLocationWsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)((0, common_1.forwardRef)(() => driver_location_service_1.DriverLocationService))),
    __metadata("design:paramtypes", [driver_location_service_1.DriverLocationService])
], DriverLocationWsService);
//# sourceMappingURL=driver-location.ws.service.js.map