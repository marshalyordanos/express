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
exports.MapMessageController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const check_permission_decorator_1 = require("../../common/decorator/check-permission.decorator");
const permission_guard_1 = require("../../common/permission.guard");
const contracts_1 = require("../../contracts");
const permission_actions_enum_1 = require("../../contracts/permission-actions.enum");
const maps_usecase_impl_1 = require("./maps.usecase.impl");
const navigation_service_1 = require("./navigation.service");
const rate_limit_guard_1 = require("../../common/rate-limit.guard");
const driver_location_service_1 = require("./driver-location.service");
const types_1 = require("../../common/types");
let MapMessageController = class MapMessageController {
    constructor(routeCacheService, usecases, locationService) {
        this.routeCacheService = routeCacheService;
        this.usecases = usecases;
        this.locationService = locationService;
    }
    async getRoute(payoad) {
        const result = await this.usecases.getRoute(payoad.driverId);
        return types_1.IResponse.success('Route Fetched successfully', result);
    }
    async markStopVisited(payload) {
        const result = await this.usecases.markStopVisited(payload.driverId, payload.orderId);
        return types_1.IResponse.success('Stop visited successfully', result);
    }
    async getRouteStatus(payoad) {
        const result = await this.usecases.getRouteStatus(payoad.driverId);
        return types_1.IResponse.success('Route Status Fetched successfully', result);
    }
    async getNearbyDrivers(payoad) {
        const userId = payoad.user?.sub;
        const result = await this.locationService.findNearbyDrivers(payoad.lon, payoad.lat, payoad.radius);
        return types_1.IResponse.success('Nearby Drivers Fetched successfully', result);
    }
};
exports.MapMessageController = MapMessageController;
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Maps', permission_actions_enum_1.PermissionActions.CREATE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.MAP_GET_ROUTE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MapMessageController.prototype, "getRoute", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Maps', permission_actions_enum_1.PermissionActions.CREATE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.MAP_MARK_STOP_VISITED),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MapMessageController.prototype, "markStopVisited", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Maps', permission_actions_enum_1.PermissionActions.READ),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.MAP_GET_CURRENT_ROUTE_STATUS),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MapMessageController.prototype, "getRouteStatus", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Maps', permission_actions_enum_1.PermissionActions.READ),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.MAP_NEARBY_DRIVERS),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MapMessageController.prototype, "getNearbyDrivers", null);
exports.MapMessageController = MapMessageController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [navigation_service_1.RouteCacheService,
        maps_usecase_impl_1.MapsUseCasesImpl,
        driver_location_service_1.DriverLocationService])
], MapMessageController);
//# sourceMappingURL=maps.controller.js.map