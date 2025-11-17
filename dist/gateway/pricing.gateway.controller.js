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
exports.PricingGatewayController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const contracts_1 = require("../contracts");
const pricing_entity_1 = require("../fulfillment/pricing/pricing.entity");
const query_dto_1 = require("../common/query/query.dto");
const jwt = require("jsonwebtoken");
let PricingGatewayController = class PricingGatewayController {
    constructor(pricingClient) {
        this.pricingClient = pricingClient;
    }
    async createTariff(data, req) {
        console.log('Tariff data : ', data);
        const authHeader = req.headers['authorization'] || null;
        let token = req.headers['authorization']?.replace('Bearer ', '') || null;
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        let decodedUser = null;
        try {
            decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
        }
        catch (err) {
            throw new common_1.HttpException('Invalid token', common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.pricingClient.send(contracts_1.PATTERNS.PRICE_TARIFF_CREATE, {
            data,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async getTariff(req, query) {
        const authHeader = req.headers['authorization'] || null;
        let token = req.headers['authorization']?.replace('Bearer ', '') || null;
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        let decodedUser = null;
        try {
            decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
        }
        catch (err) {
            throw new common_1.HttpException('Invalid token', common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.pricingClient.send(contracts_1.PATTERNS.PRICE_TARIFF_FIND_ALL, {
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
            query,
        });
    }
    async updateTariff(id, data, req) {
        const authHeader = req.headers['authorization'] || null;
        let token = req.headers['authorization']?.replace('Bearer ', '') || null;
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        let decodedUser = null;
        try {
            decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
        }
        catch (err) {
            throw new common_1.HttpException('Invalid token', common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.pricingClient.send(contracts_1.PATTERNS.PRICE_TARIFF_UPDATE, {
            id,
            data,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async getTariffById(id, req) {
        const authHeader = req.headers['authorization'] || null;
        let token = req.headers['authorization']?.replace('Bearer ', '') || null;
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        let decodedUser = null;
        try {
            decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
        }
        catch (err) {
            throw new common_1.HttpException('Invalid token', common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.pricingClient.send(contracts_1.PATTERNS.PRICE_TARIFF_FIND_BY_ID, {
            id,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async deleteTariff(id, req) {
        const authHeader = req.headers['authorization'] || null;
        let token = req.headers['authorization']?.replace('Bearer ', '') || null;
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        let decodedUser = null;
        try {
            decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
        }
        catch (err) {
            throw new common_1.HttpException('Invalid token', common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.pricingClient.send(contracts_1.PATTERNS.PRICE_TARIFF_DELETE, {
            id,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async createProfitMargin(data, req) {
        const authHeader = req.headers['authorization'] || null;
        let token = req.headers['authorization']?.replace('Bearer ', '') || null;
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        let decodedUser = null;
        try {
            decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
        }
        catch (err) {
            throw new common_1.HttpException('Invalid token', common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.pricingClient.send(contracts_1.PATTERNS.PRICE_PROFIT_MARGIN_CREATE, {
            data,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async updateProfitMargin(id, data, req) {
        const authHeader = req.headers['authorization'] || null;
        let token = req.headers['authorization']?.replace('Bearer ', '') || null;
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        let decodedUser = null;
        try {
            decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
        }
        catch (err) {
            throw new common_1.HttpException('Invalid token', common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.pricingClient.send(contracts_1.PATTERNS.PRICE_PROFIT_MARGIN_UPDATE, {
            id,
            data,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async getProfitMargin(req, query) {
        const authHeader = req.headers['authorization'] || null;
        let token = req.headers['authorization']?.replace('Bearer ', '') || null;
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        let decodedUser = null;
        try {
            decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
        }
        catch (err) {
            throw new common_1.HttpException('Invalid token', common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.pricingClient.send(contracts_1.PATTERNS.PRICE_PROFIT_MARGIN_FIND_ALL, {
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
            query,
        });
    }
    async getProfitMarginById(id, req) {
        const authHeader = req.headers['authorization'] || null;
        let token = req.headers['authorization']?.replace('Bearer ', '') || null;
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        let decodedUser = null;
        try {
            decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
        }
        catch (err) {
            throw new common_1.HttpException('Invalid token', common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.pricingClient.send(contracts_1.PATTERNS.PRICE_PROFIT_MARGIN_FIND_BY_ID, {
            id,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async deleteProfitMargin(id, req) {
        const authHeader = req.headers['authorization'] || null;
        let token = req.headers['authorization']?.replace('Bearer ', '') || null;
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        let decodedUser = null;
        try {
            decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
        }
        catch (err) {
            throw new common_1.HttpException('Invalid token', common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.pricingClient.send(contracts_1.PATTERNS.PRICE_PROFIT_MARGIN_DELETE, {
            id,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async createAirportFee(data, req) {
        const authHeader = req.headers['authorization'] || null;
        let token = req.headers['authorization']?.replace('Bearer ', '') || null;
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        let decodedUser = null;
        try {
            decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
        }
        catch (err) {
            throw new common_1.HttpException('Invalid token', common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.pricingClient.send(contracts_1.PATTERNS.PRICE_AIRPORT_FEE_CREATE, {
            data,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async getAirportFee(req, query) {
        return this.pricingClient.send(contracts_1.PATTERNS.PRICE_AIRPORT_FEE_FIND_ALL, {
            headers: { authorization: req.headers['authorization'] || null },
            query,
        });
    }
    async updateAirportFee(id, data, req) {
        const authHeader = req.headers['authorization'] || null;
        let token = req.headers['authorization']?.replace('Bearer ', '') || null;
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        let decodedUser = null;
        try {
            decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
        }
        catch (err) {
            throw new common_1.HttpException('Invalid token', common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.pricingClient.send(contracts_1.PATTERNS.PRICE_AIRPORT_FEE_UPDATE, {
            id,
            data,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async getAirportFeeById(id, req) {
        const authHeader = req.headers['authorization'] || null;
        let token = req.headers['authorization']?.replace('Bearer ', '') || null;
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        let decodedUser = null;
        try {
            decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
        }
        catch (err) {
            throw new common_1.HttpException('Invalid token', common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.pricingClient.send(contracts_1.PATTERNS.PRICE_AIRPORT_FEE_FIND_BY_ID, {
            id,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async deleteAirportFee(id, req) {
        const authHeader = req.headers['authorization'] || null;
        let token = req.headers['authorization']?.replace('Bearer ', '') || null;
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        let decodedUser = null;
        try {
            decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
        }
        catch (err) {
            throw new common_1.HttpException('Invalid token', common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.pricingClient.send(contracts_1.PATTERNS.PRICE_AIRPORT_FEE_DELETE, {
            id,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async createMiscFee(data, req) {
        const authHeader = req.headers['authorization'] || null;
        let token = req.headers['authorization']?.replace('Bearer ', '') || null;
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        let decodedUser = null;
        try {
            decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
        }
        catch (err) {
            throw new common_1.HttpException('Invalid token', common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.pricingClient.send(contracts_1.PATTERNS.PRICE_MISC_FEE_CREATE, {
            data,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async getMiscFee(req, query) {
        const authHeader = req.headers['authorization'] || null;
        let token = req.headers['authorization']?.replace('Bearer ', '') || null;
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        let decodedUser = null;
        try {
            decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
        }
        catch (err) {
            throw new common_1.HttpException('Invalid token', common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.pricingClient.send(contracts_1.PATTERNS.PRICE_MISC_FEE_FIND_ALL, {
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
            query,
        });
    }
    async updateMiscFee(id, data, req) {
        const authHeader = req.headers['authorization'] || null;
        let token = req.headers['authorization']?.replace('Bearer ', '') || null;
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        let decodedUser = null;
        try {
            decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
        }
        catch (err) {
            throw new common_1.HttpException('Invalid token', common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.pricingClient.send(contracts_1.PATTERNS.PRICE_MISC_FEE_UPDATE, {
            id,
            data,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async getMiscFeeById(id, req) {
        const authHeader = req.headers['authorization'] || null;
        let token = req.headers['authorization']?.replace('Bearer ', '') || null;
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        let decodedUser = null;
        try {
            decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
        }
        catch (err) {
            throw new common_1.HttpException('Invalid token', common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.pricingClient.send(contracts_1.PATTERNS.PRICE_MISC_FEE_FIND_BY_ID, {
            id,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async deleteMiscFee(id, req) {
        const authHeader = req.headers['authorization'] || null;
        let token = req.headers['authorization']?.replace('Bearer ', '') || null;
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        let decodedUser = null;
        try {
            decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
        }
        catch (err) {
            throw new common_1.HttpException('Invalid token', common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.pricingClient.send(contracts_1.PATTERNS.PRICE_MISC_FEE_DELETE, {
            id,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async createSurcharge(data, req) {
        const authHeader = req.headers['authorization'] || null;
        let token = req.headers['authorization']?.replace('Bearer ', '') || null;
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        let decodedUser = null;
        try {
            decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
        }
        catch (err) {
            throw new common_1.HttpException('Invalid token', common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.pricingClient.send(contracts_1.PATTERNS.PRICE_SURCHARGE_CREATE, {
            data,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async getSurcharge(req, query) {
        const authHeader = req.headers['authorization'] || null;
        let token = req.headers['authorization']?.replace('Bearer ', '') || null;
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        let decodedUser = null;
        try {
            decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
        }
        catch (err) {
            throw new common_1.HttpException('Invalid token', common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.pricingClient.send(contracts_1.PATTERNS.PRICE_SURCHARGE_FIND_ALL, {
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
            query,
        });
    }
    async updateSurcharge(id, data, req) {
        const authHeader = req.headers['authorization'] || null;
        let token = req.headers['authorization']?.replace('Bearer ', '') || null;
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        let decodedUser = null;
        try {
            decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
        }
        catch (err) {
            throw new common_1.HttpException('Invalid token', common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.pricingClient.send(contracts_1.PATTERNS.PRICE_SURCHARGE_UPDATE, {
            id,
            data,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async getSurchargeById(id, req) {
        const authHeader = req.headers['authorization'] || null;
        let token = req.headers['authorization']?.replace('Bearer ', '') || null;
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        let decodedUser = null;
        try {
            decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
        }
        catch (err) {
            throw new common_1.HttpException('Invalid token', common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.pricingClient.send(contracts_1.PATTERNS.PRICE_SURCHARGE_FIND_BY_ID, {
            id,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async deleteSurcharge(id, req) {
        const authHeader = req.headers['authorization'] || null;
        let token = req.headers['authorization']?.replace('Bearer ', '') || null;
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        let decodedUser = null;
        try {
            decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
        }
        catch (err) {
            throw new common_1.HttpException('Invalid token', common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.pricingClient.send(contracts_1.PATTERNS.PRICE_SURCHARGE_DELETE, {
            id,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async createDiscount(data, req) {
        const authHeader = req.headers['authorization'] || null;
        let token = req.headers['authorization']?.replace('Bearer ', '') || null;
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        let decodedUser = null;
        try {
            decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
        }
        catch (err) {
            throw new common_1.HttpException('Invalid token', common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.pricingClient.send(contracts_1.PATTERNS.PRICE_DISCOUNT_CREATE, {
            data,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async getDiscount(req, query) {
        const authHeader = req.headers['authorization'] || null;
        let token = req.headers['authorization']?.replace('Bearer ', '') || null;
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        let decodedUser = null;
        try {
            decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
        }
        catch (err) {
            throw new common_1.HttpException('Invalid token', common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.pricingClient.send(contracts_1.PATTERNS.PRICE_DISCOUNT_FIND_ALL, {
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
            query,
        });
    }
    async updateDiscount(id, data, req) {
        const authHeader = req.headers['authorization'] || null;
        let token = req.headers['authorization']?.replace('Bearer ', '') || null;
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        let decodedUser = null;
        try {
            decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
        }
        catch (err) {
            throw new common_1.HttpException('Invalid token', common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.pricingClient.send(contracts_1.PATTERNS.PRICE_DISCOUNT_UPDATE, {
            id,
            data,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async getDiscountById(id, req) {
        const authHeader = req.headers['authorization'] || null;
        let token = req.headers['authorization']?.replace('Bearer ', '') || null;
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        let decodedUser = null;
        try {
            decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
        }
        catch (err) {
            throw new common_1.HttpException('Invalid token', common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.pricingClient.send(contracts_1.PATTERNS.PRICE_DISCOUNT_FIND_BY_ID, {
            id,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async deleteDiscount(id, req) {
        const authHeader = req.headers['authorization'] || null;
        let token = req.headers['authorization']?.replace('Bearer ', '') || null;
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        let decodedUser = null;
        try {
            decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
        }
        catch (err) {
            throw new common_1.HttpException('Invalid token', common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.pricingClient.send(contracts_1.PATTERNS.PRICE_DISCOUNT_DELETE, {
            id,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async createCustomerCategory(data, req) {
        const authHeader = req.headers['authorization'] || null;
        let token = req.headers['authorization']?.replace('Bearer ', '') || null;
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        let decodedUser = null;
        try {
            decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
        }
        catch (err) {
            throw new common_1.HttpException('Invalid token', common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.pricingClient.send(contracts_1.PATTERNS.PRICE_CUSTOMER_CATEGORY_CREATE, {
            data,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async getCustomerCategory(req, query) {
        const authHeader = req.headers['authorization'] || null;
        let token = req.headers['authorization']?.replace('Bearer ', '') || null;
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        let decodedUser = null;
        try {
            decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
        }
        catch (err) {
            throw new common_1.HttpException('Invalid token', common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.pricingClient.send(contracts_1.PATTERNS.PRICE_CUSTOMER_CATEGORY_FIND_ALL, {
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
            query,
        });
    }
    async updateCustomerCategory(id, data, req) {
        const authHeader = req.headers['authorization'] || null;
        let token = req.headers['authorization']?.replace('Bearer ', '') || null;
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        let decodedUser = null;
        try {
            decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
        }
        catch (err) {
            throw new common_1.HttpException('Invalid token', common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.pricingClient.send(contracts_1.PATTERNS.PRICE_CUSTOMER_CATEGORY_UPDATE, {
            id,
            data,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async getCustomerCategoryById(id, req) {
        const authHeader = req.headers['authorization'] || null;
        let token = req.headers['authorization']?.replace('Bearer ', '') || null;
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        let decodedUser = null;
        try {
            decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
        }
        catch (err) {
            throw new common_1.HttpException('Invalid token', common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.pricingClient.send(contracts_1.PATTERNS.PRICE_CUSTOMER_CATEGORY_FIND_BY_ID, { id, headers: { authorization: authHeader } });
    }
    async deleteCustomerCategory(id, req) {
        const authHeader = req.headers['authorization'] || null;
        let token = req.headers['authorization']?.replace('Bearer ', '') || null;
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        let decodedUser = null;
        try {
            decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
        }
        catch (err) {
            throw new common_1.HttpException('Invalid token', common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.pricingClient.send(contracts_1.PATTERNS.PRICE_CUSTOMER_CATEGORY_DELETE, {
            id,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async getPriceCalculationLog(req, query) {
        const authHeader = req.headers['authorization'] || null;
        let token = req.headers['authorization']?.replace('Bearer ', '') || null;
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        let decodedUser = null;
        try {
            decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
        }
        catch (err) {
            throw new common_1.HttpException('Invalid token', common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.pricingClient.send(contracts_1.PATTERNS.PRICE_CALCULATION_LOG_FIND_ALL, {
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
            query,
        });
    }
    async getPriceCalculationLogById(id, req) {
        const authHeader = req.headers['authorization'] || null;
        let token = req.headers['authorization']?.replace('Bearer ', '') || null;
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        let decodedUser = null;
        try {
            decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
        }
        catch (err) {
            throw new common_1.HttpException('Invalid token', common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.pricingClient.send(contracts_1.PATTERNS.PRICE_CALCULATION_LOG_FIND_BY_ID, {
            id,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async calculatePrice(data, req) {
        const authHeader = req.headers['authorization'] || null;
        let token = req.headers['authorization']?.replace('Bearer ', '') || null;
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        let decodedUser = null;
        try {
            decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
        }
        catch (err) {
            throw new common_1.HttpException('Invalid token', common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.pricingClient.send(contracts_1.PATTERNS.PRICE_CALCULATE, {
            data,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
};
exports.PricingGatewayController = PricingGatewayController;
__decorate([
    (0, common_1.Post)('tariff'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pricing_entity_1.TariffDto, Object]),
    __metadata("design:returntype", Promise)
], PricingGatewayController.prototype, "createTariff", null);
__decorate([
    (0, common_1.Get)('tariff'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, query_dto_1.ListQueryDto]),
    __metadata("design:returntype", Promise)
], PricingGatewayController.prototype, "getTariff", null);
__decorate([
    (0, common_1.Patch)('tariff/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pricing_entity_1.UpdateTariffDto, Object]),
    __metadata("design:returntype", Promise)
], PricingGatewayController.prototype, "updateTariff", null);
__decorate([
    (0, common_1.Get)('tariff/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PricingGatewayController.prototype, "getTariffById", null);
__decorate([
    (0, common_1.Delete)('tariff/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PricingGatewayController.prototype, "deleteTariff", null);
__decorate([
    (0, common_1.Post)('profit-margin'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pricing_entity_1.ProfitMarginDto, Object]),
    __metadata("design:returntype", Promise)
], PricingGatewayController.prototype, "createProfitMargin", null);
__decorate([
    (0, common_1.Patch)('profit-margin/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pricing_entity_1.UpdateProfitMarginDto, Object]),
    __metadata("design:returntype", Promise)
], PricingGatewayController.prototype, "updateProfitMargin", null);
__decorate([
    (0, common_1.Get)('profit-margin'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, query_dto_1.ListQueryDto]),
    __metadata("design:returntype", Promise)
], PricingGatewayController.prototype, "getProfitMargin", null);
__decorate([
    (0, common_1.Get)('profit-margin/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PricingGatewayController.prototype, "getProfitMarginById", null);
__decorate([
    (0, common_1.Delete)('profit-margin/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PricingGatewayController.prototype, "deleteProfitMargin", null);
__decorate([
    (0, common_1.Post)('airport-fee'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pricing_entity_1.AirportFeeDto, Object]),
    __metadata("design:returntype", Promise)
], PricingGatewayController.prototype, "createAirportFee", null);
__decorate([
    (0, common_1.Get)('airport-fee'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, query_dto_1.ListQueryDto]),
    __metadata("design:returntype", Promise)
], PricingGatewayController.prototype, "getAirportFee", null);
__decorate([
    (0, common_1.Patch)('airport-fee/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pricing_entity_1.UpdateAirportFeeDto, Object]),
    __metadata("design:returntype", Promise)
], PricingGatewayController.prototype, "updateAirportFee", null);
__decorate([
    (0, common_1.Get)('airport-fee/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PricingGatewayController.prototype, "getAirportFeeById", null);
__decorate([
    (0, common_1.Delete)('airport-fee/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PricingGatewayController.prototype, "deleteAirportFee", null);
__decorate([
    (0, common_1.Post)('misc-fee'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pricing_entity_1.MiscellaneousFeeDto, Object]),
    __metadata("design:returntype", Promise)
], PricingGatewayController.prototype, "createMiscFee", null);
__decorate([
    (0, common_1.Get)('misc-fee'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, query_dto_1.ListQueryDto]),
    __metadata("design:returntype", Promise)
], PricingGatewayController.prototype, "getMiscFee", null);
__decorate([
    (0, common_1.Patch)('misc-fee/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pricing_entity_1.UpdateMiscellaneousFeeDto, Object]),
    __metadata("design:returntype", Promise)
], PricingGatewayController.prototype, "updateMiscFee", null);
__decorate([
    (0, common_1.Get)('misc-fee/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PricingGatewayController.prototype, "getMiscFeeById", null);
__decorate([
    (0, common_1.Delete)('misc-fee/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PricingGatewayController.prototype, "deleteMiscFee", null);
__decorate([
    (0, common_1.Post)('surcharge'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pricing_entity_1.SurchargeDto, Object]),
    __metadata("design:returntype", Promise)
], PricingGatewayController.prototype, "createSurcharge", null);
__decorate([
    (0, common_1.Get)('surcharge'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, query_dto_1.ListQueryDto]),
    __metadata("design:returntype", Promise)
], PricingGatewayController.prototype, "getSurcharge", null);
__decorate([
    (0, common_1.Patch)('surcharge/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pricing_entity_1.UpdateSurchargeDto, Object]),
    __metadata("design:returntype", Promise)
], PricingGatewayController.prototype, "updateSurcharge", null);
__decorate([
    (0, common_1.Get)('surcharge/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PricingGatewayController.prototype, "getSurchargeById", null);
__decorate([
    (0, common_1.Delete)('surcharge/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PricingGatewayController.prototype, "deleteSurcharge", null);
__decorate([
    (0, common_1.Post)('discount'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pricing_entity_1.DiscountDto, Object]),
    __metadata("design:returntype", Promise)
], PricingGatewayController.prototype, "createDiscount", null);
__decorate([
    (0, common_1.Get)('discount'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, query_dto_1.ListQueryDto]),
    __metadata("design:returntype", Promise)
], PricingGatewayController.prototype, "getDiscount", null);
__decorate([
    (0, common_1.Patch)('discount/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pricing_entity_1.UpdateDiscountDto, Object]),
    __metadata("design:returntype", Promise)
], PricingGatewayController.prototype, "updateDiscount", null);
__decorate([
    (0, common_1.Get)('discount/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PricingGatewayController.prototype, "getDiscountById", null);
__decorate([
    (0, common_1.Delete)('discount/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PricingGatewayController.prototype, "deleteDiscount", null);
__decorate([
    (0, common_1.Post)('customer-category'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pricing_entity_1.CustomerCategoryDto, Object]),
    __metadata("design:returntype", Promise)
], PricingGatewayController.prototype, "createCustomerCategory", null);
__decorate([
    (0, common_1.Get)('customer-category'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, query_dto_1.ListQueryDto]),
    __metadata("design:returntype", Promise)
], PricingGatewayController.prototype, "getCustomerCategory", null);
__decorate([
    (0, common_1.Patch)('customer-category/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pricing_entity_1.UpdateCustomerCategoryDto, Object]),
    __metadata("design:returntype", Promise)
], PricingGatewayController.prototype, "updateCustomerCategory", null);
__decorate([
    (0, common_1.Get)('customer-category/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PricingGatewayController.prototype, "getCustomerCategoryById", null);
__decorate([
    (0, common_1.Delete)('customer-category/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PricingGatewayController.prototype, "deleteCustomerCategory", null);
__decorate([
    (0, common_1.Get)('price-calculation-log'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, query_dto_1.ListQueryDto]),
    __metadata("design:returntype", Promise)
], PricingGatewayController.prototype, "getPriceCalculationLog", null);
__decorate([
    (0, common_1.Get)('price-calculation-log/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PricingGatewayController.prototype, "getPriceCalculationLogById", null);
__decorate([
    (0, common_1.Post)('calculate'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pricing_entity_1.PriceCalculationLogDto, Object]),
    __metadata("design:returntype", Promise)
], PricingGatewayController.prototype, "calculatePrice", null);
exports.PricingGatewayController = PricingGatewayController = __decorate([
    (0, common_1.Controller)('pricing'),
    __param(0, (0, common_1.Inject)('FULFILLMENT_SERVICE')),
    __metadata("design:paramtypes", [microservices_1.ClientProxy])
], PricingGatewayController);
//# sourceMappingURL=pricing.gateway.controller.js.map