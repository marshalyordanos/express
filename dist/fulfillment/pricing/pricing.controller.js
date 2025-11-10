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
exports.PricingMessageController = void 0;
const pricing_usecase_impl_1 = require("./pricing.usecase.impl");
const contracts_1 = require("../../contracts");
const microservices_1 = require("@nestjs/microservices");
const common_1 = require("@nestjs/common");
const types_1 = require("../../common/types");
const check_permission_decorator_1 = require("../../common/decorator/check-permission.decorator");
const permission_guard_1 = require("../../common/permission.guard");
const permission_actions_enum_1 = require("../../contracts/permission-actions.enum");
const rate_limit_guard_1 = require("../../common/rate-limit.guard");
let PricingMessageController = class PricingMessageController {
    constructor(usecases) {
        this.usecases = usecases;
    }
    async createTariff(payload) {
        console.log('Tariff datajjj : ', payload);
        const result = await this.usecases.createTariff(payload.data);
        return types_1.IResponse.success('Tariff created successfully', result);
    }
    async updateTariff(payload) {
        console.log('Tariff data : ', payload);
        const result = await this.usecases.updateTariff(payload.id, payload.data);
        return types_1.IResponse.success('Tariff updated successfully', result);
    }
    async getTariff(payload) {
        const result = await this.usecases.findAllTariff(payload.query);
        return types_1.IResponse.success('All Tariff fetched successfully', result);
    }
    async getTariffById(payload) {
        const result = await this.usecases.findTariffById(payload.id);
        return types_1.IResponse.success(`Tariff with id: ${payload.id} fetched successfully`, result);
    }
    async deleteTariff(payload) {
        const result = await this.usecases.deleteTariff(payload.id);
        return types_1.IResponse.success(`Tariff with id: ${payload.id} deleted successfully`, result);
    }
    async createProfitMargin(payload) {
        const result = await this.usecases.createProfitMargin(payload.data);
        return types_1.IResponse.success('Profit margin created successfully', result);
    }
    async getProfitMargin(payload) {
        const result = await this.usecases.findAllProfitMargins(payload.query);
        return types_1.IResponse.success('All Profit margin fetched successfully', result);
    }
    async updateProfitMargin(payload) {
        const result = await this.usecases.updateProfitMargin(payload.id, payload.data);
        return types_1.IResponse.success('Profit margin updated successfully', result);
    }
    async getProfitMarginById(payload) {
        const result = await this.usecases.findProfitMarginById(payload.id);
        return types_1.IResponse.success(`Profit margin with id: ${payload.id} fetched successfully`, result);
    }
    async deleteProfitMargin(payload) {
        const result = await this.usecases.deleteProfitMargin(payload.id);
        return types_1.IResponse.success(`Profit margin with id: ${payload.id} deleted successfully`, result);
    }
    async createAirportFee(payload) {
        const result = await this.usecases.createAirportFee(payload.data);
        return types_1.IResponse.success('Airport fee created successfully', result);
    }
    async getAirportFee(payload) {
        const result = await this.usecases.findAllAirportFees(payload.query);
        return types_1.IResponse.success('All Airport fee fetched successfully', result);
    }
    async updateAirportFee(payload) {
        const result = await this.usecases.updateAirportFee(payload.id, payload.data);
        return types_1.IResponse.success('Airport fee updated successfully', result);
    }
    async getAirportFeeById(payload) {
        const result = await this.usecases.findAirportFeeById(payload.id);
        return types_1.IResponse.success(`Airport fee with id: ${payload.id} fetched successfully`, result);
    }
    async deleteAirportFee(payload) {
        const result = await this.usecases.deleteAirportFee(payload.id);
        return types_1.IResponse.success(`Airport fee with id: ${payload.id} deleted successfully`, result);
    }
    async createMiscFee(payload) {
        const result = await this.usecases.createMiscFee(payload.data);
        return types_1.IResponse.success('Miscellaneous fee created successfully', result);
    }
    async getMiscFee(payload) {
        const result = await this.usecases.findAllMiscFees(payload.query);
        return types_1.IResponse.success('All Miscellaneous fee fetched successfully', result);
    }
    async updateMiscFee(payload) {
        const result = await this.usecases.updateMiscFee(payload.id, payload.data);
        return types_1.IResponse.success('Miscellaneous fee updated successfully', result);
    }
    async getMiscFeeById(payload) {
        const result = await this.usecases.findMiscFeeById(payload.id);
        return types_1.IResponse.success(`Miscellaneous fee with id: ${payload.id} fetched successfully`, result);
    }
    async deleteMiscFee(payload) {
        const result = await this.usecases.deleteMiscFee(payload.id);
        return types_1.IResponse.success(`Miscellaneous fee with id: ${payload.id} deleted successfully`, result);
    }
    async createSurcharge(payload) {
        console.log('Surcharge data : ', payload.data);
        const result = await this.usecases.createSurcharge(payload.data);
        return types_1.IResponse.success('Surcharge created successfully', result);
    }
    async getSurcharge(payload) {
        const result = await this.usecases.findAllSurcharge(payload.query);
        return types_1.IResponse.success('All Surcharge fetched successfully', result);
    }
    async updateSurcharge(payload) {
        console.log('Surcharge data : ', payload);
        const result = await this.usecases.updateSurcharge(payload.id, payload.data);
        return types_1.IResponse.success('Surcharge updated successfully', result);
    }
    async deleteSurcharge(payload) {
        const result = await this.usecases.deleteSurcharge(payload.id);
        return types_1.IResponse.success(`Surcharge with id: ${payload.id} deleted successfully`, result);
    }
    async getSurchargeById(payload) {
        const result = await this.usecases.findSurchargeById(payload.id);
        return types_1.IResponse.success(`Surcharge with id: ${payload.id} fetched successfully`, result);
    }
    async createDiscount(payload) {
        console.log('Discount data : ', payload.data);
        const result = await this.usecases.createDiscount(payload.data);
        return types_1.IResponse.success('Discount created successfully', result);
    }
    async getDiscount(payload) {
        const result = await this.usecases.findAllDiscount(payload.query);
        return types_1.IResponse.success('All Discount fetched successfully', result);
    }
    async updateDiscount(payload) {
        console.log('Discount data : ', payload);
        const result = await this.usecases.updateDiscount(payload.id, payload.data);
        return types_1.IResponse.success('Discount updated successfully', result);
    }
    async deleteDiscount(payload) {
        const result = await this.usecases.deleteDiscount(payload.id);
        return types_1.IResponse.success(`Discount with id: ${payload.id} deleted successfully`, result);
    }
    async getDiscountById(payload) {
        const result = await this.usecases.findDiscountById(payload.id);
        return types_1.IResponse.success(`Discount with id: ${payload.id} fetched successfully`, result);
    }
    async createCustomerCategory(payload) {
        const result = await this.usecases.createCustomerCategory(payload.data);
        return types_1.IResponse.success('Customer category created successfully', result);
    }
    async getCustomerCategory(payload) {
        const result = await this.usecases.findAllCustomerCategory(payload.query);
        return types_1.IResponse.success('All Customer category fetched successfully', result);
    }
    async updateCustomerCategory(payload) {
        const result = await this.usecases.updateCustomerCategory(payload.id, payload.data);
        return types_1.IResponse.success('Customer category updated successfully', result);
    }
    async deleteCustomerCategory(payload) {
        const result = await this.usecases.deleteCustomerCategory(payload.id);
        return types_1.IResponse.success(`Customer category with id: ${payload.id} deleted successfully`, result);
    }
    async getCustomerCategoryById(payload) {
        const result = await this.usecases.findCustomerCategoryById(payload.id);
        return types_1.IResponse.success(`Customer category with id: ${payload.id} fetched successfully`, result);
    }
    async getPriceCalculationLog(payload) {
        const result = await this.usecases.findAllPriceCalculationLog(payload.query);
        return types_1.IResponse.success('All Price calculation log fetched successfully', result);
    }
    async calculatePrice(payload) {
        console.log('data calculate price : ', payload.data);
        const { orderId, customerId } = payload.data;
        const result = await this.usecases.calculatePrice(orderId, customerId);
        return types_1.IResponse.success('Price calculated successfully', result);
    }
};
exports.PricingMessageController = PricingMessageController;
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Price', permission_actions_enum_1.PermissionActions.CREATE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.PRICE_TARIFF_CREATE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PricingMessageController.prototype, "createTariff", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Price', permission_actions_enum_1.PermissionActions.UPDATE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.PRICE_TARIFF_UPDATE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PricingMessageController.prototype, "updateTariff", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Price', permission_actions_enum_1.PermissionActions.READ),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.PRICE_TARIFF_FIND_ALL),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PricingMessageController.prototype, "getTariff", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Price', permission_actions_enum_1.PermissionActions.READ),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.PRICE_TARIFF_FIND_BY_ID),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PricingMessageController.prototype, "getTariffById", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Price', permission_actions_enum_1.PermissionActions.DELETE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.PRICE_TARIFF_DELETE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PricingMessageController.prototype, "deleteTariff", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Price', permission_actions_enum_1.PermissionActions.CREATE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.PRICE_PROFIT_MARGIN_CREATE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PricingMessageController.prototype, "createProfitMargin", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Price', permission_actions_enum_1.PermissionActions.READ),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.PRICE_PROFIT_MARGIN_FIND_ALL),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PricingMessageController.prototype, "getProfitMargin", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Price', permission_actions_enum_1.PermissionActions.UPDATE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.PRICE_PROFIT_MARGIN_UPDATE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PricingMessageController.prototype, "updateProfitMargin", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Price', permission_actions_enum_1.PermissionActions.READ),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.PRICE_PROFIT_MARGIN_FIND_BY_ID),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PricingMessageController.prototype, "getProfitMarginById", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Price', permission_actions_enum_1.PermissionActions.DELETE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.PRICE_PROFIT_MARGIN_DELETE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PricingMessageController.prototype, "deleteProfitMargin", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Price', permission_actions_enum_1.PermissionActions.CREATE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.PRICE_AIRPORT_FEE_CREATE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PricingMessageController.prototype, "createAirportFee", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Price', permission_actions_enum_1.PermissionActions.READ),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.PRICE_AIRPORT_FEE_FIND_ALL),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PricingMessageController.prototype, "getAirportFee", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Price', permission_actions_enum_1.PermissionActions.UPDATE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.PRICE_AIRPORT_FEE_UPDATE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PricingMessageController.prototype, "updateAirportFee", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Price', permission_actions_enum_1.PermissionActions.READ),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.PRICE_AIRPORT_FEE_FIND_BY_ID),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PricingMessageController.prototype, "getAirportFeeById", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Price', permission_actions_enum_1.PermissionActions.DELETE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.PRICE_AIRPORT_FEE_DELETE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PricingMessageController.prototype, "deleteAirportFee", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Price', permission_actions_enum_1.PermissionActions.CREATE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.PRICE_MISC_FEE_CREATE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PricingMessageController.prototype, "createMiscFee", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Price', permission_actions_enum_1.PermissionActions.READ),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.PRICE_MISC_FEE_FIND_ALL),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PricingMessageController.prototype, "getMiscFee", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Price', permission_actions_enum_1.PermissionActions.UPDATE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.PRICE_MISC_FEE_UPDATE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PricingMessageController.prototype, "updateMiscFee", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Price', permission_actions_enum_1.PermissionActions.READ),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.PRICE_MISC_FEE_FIND_BY_ID),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PricingMessageController.prototype, "getMiscFeeById", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Price', permission_actions_enum_1.PermissionActions.DELETE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.PRICE_MISC_FEE_DELETE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PricingMessageController.prototype, "deleteMiscFee", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Price', permission_actions_enum_1.PermissionActions.CREATE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.PRICE_SURCHARGE_CREATE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PricingMessageController.prototype, "createSurcharge", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Price', permission_actions_enum_1.PermissionActions.READ),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.PRICE_SURCHARGE_FIND_ALL),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PricingMessageController.prototype, "getSurcharge", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Price', permission_actions_enum_1.PermissionActions.UPDATE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.PRICE_SURCHARGE_UPDATE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PricingMessageController.prototype, "updateSurcharge", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Price', permission_actions_enum_1.PermissionActions.DELETE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.PRICE_SURCHARGE_DELETE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PricingMessageController.prototype, "deleteSurcharge", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Price', permission_actions_enum_1.PermissionActions.READ),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.PRICE_SURCHARGE_FIND_BY_ID),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PricingMessageController.prototype, "getSurchargeById", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Price', permission_actions_enum_1.PermissionActions.CREATE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.PRICE_DISCOUNT_CREATE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PricingMessageController.prototype, "createDiscount", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Price', permission_actions_enum_1.PermissionActions.READ),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.PRICE_DISCOUNT_FIND_ALL),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PricingMessageController.prototype, "getDiscount", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Price', permission_actions_enum_1.PermissionActions.UPDATE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.PRICE_DISCOUNT_UPDATE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PricingMessageController.prototype, "updateDiscount", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Price', permission_actions_enum_1.PermissionActions.DELETE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.PRICE_DISCOUNT_DELETE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PricingMessageController.prototype, "deleteDiscount", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Price', permission_actions_enum_1.PermissionActions.READ),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.PRICE_DISCOUNT_FIND_BY_ID),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PricingMessageController.prototype, "getDiscountById", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Price', permission_actions_enum_1.PermissionActions.CREATE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.PRICE_CUSTOMER_CATEGORY_CREATE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PricingMessageController.prototype, "createCustomerCategory", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Price', permission_actions_enum_1.PermissionActions.READ),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.PRICE_CUSTOMER_CATEGORY_FIND_ALL),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PricingMessageController.prototype, "getCustomerCategory", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Price', permission_actions_enum_1.PermissionActions.UPDATE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.PRICE_CUSTOMER_CATEGORY_UPDATE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PricingMessageController.prototype, "updateCustomerCategory", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Price', permission_actions_enum_1.PermissionActions.DELETE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.PRICE_CUSTOMER_CATEGORY_DELETE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PricingMessageController.prototype, "deleteCustomerCategory", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Price', permission_actions_enum_1.PermissionActions.READ),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.PRICE_CUSTOMER_CATEGORY_FIND_BY_ID),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PricingMessageController.prototype, "getCustomerCategoryById", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Price', permission_actions_enum_1.PermissionActions.READ),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.PRICE_CALCULATION_LOG_FIND_ALL),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PricingMessageController.prototype, "getPriceCalculationLog", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('CalculatePrice', permission_actions_enum_1.PermissionActions.CREATE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.PRICE_CALCULATE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PricingMessageController.prototype, "calculatePrice", null);
exports.PricingMessageController = PricingMessageController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [pricing_usecase_impl_1.PricingUseCasesImpl])
], PricingMessageController);
//# sourceMappingURL=pricing.controller.js.map