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
exports.OrderDistanceWsService = void 0;
const common_1 = require("@nestjs/common");
const maps_service_1 = require("../../fulfillment/maps/maps.service");
const order_usecase_impl_1 = require("../../fulfillment/order/order.usecase.impl");
const pricing_usecase_impl_1 = require("../../fulfillment/pricing/pricing.usecase.impl");
let OrderDistanceWsService = class OrderDistanceWsService {
    constructor(mapService, orderUseCases, pricingUseCases) {
        this.mapService = mapService;
        this.orderUseCases = orderUseCases;
        this.pricingUseCases = pricingUseCases;
    }
    async calculateDistanceAndPrice(payload) {
        const distance = await this.mapService.calculateDistance(payload.origin, payload.destination);
        await this.orderUseCases.updateOrderDistance(payload.orderId, distance);
        const priceData = await this.pricingUseCases.calculatePrice(payload.orderId);
        console.log(`responsing after calculating of distance ${distance} and price ${priceData}`);
        return { distance, priceData };
    }
    async calculatePrice(payload) {
        const priceData = await this.pricingUseCases.calculatePrice(payload.orderId);
        return priceData;
    }
};
exports.OrderDistanceWsService = OrderDistanceWsService;
exports.OrderDistanceWsService = OrderDistanceWsService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => order_usecase_impl_1.OrderUseCasesImpl))),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => pricing_usecase_impl_1.PricingUseCasesImpl))),
    __metadata("design:paramtypes", [maps_service_1.MapsService,
        order_usecase_impl_1.OrderUseCasesImpl,
        pricing_usecase_impl_1.PricingUseCasesImpl])
], OrderDistanceWsService);
//# sourceMappingURL=order-distance.ws.service.js.map