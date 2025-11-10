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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PricingRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const prisma_query_feature_1 = require("../../common/query/prisma-query-feature");
let PricingRepository = class PricingRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createTariff(data) {
        return this.prisma.tariff.create({ data });
    }
    async findOverlappingTariff(serviceType, effectiveFrom, effectiveTo, shippingScope) {
        const highDate = effectiveTo ?? new Date('9999-12-31T23:59:59.999Z');
        return this.prisma.tariff.findFirst({
            where: {
                serviceType,
                shippingScope,
                AND: [
                    { effectiveFrom: { lte: highDate } },
                    {
                        OR: [
                            { effectiveTo: null },
                            { effectiveTo: { gte: effectiveFrom } },
                        ],
                    },
                ],
            },
        });
    }
    async findByNameAndServiceType(name, serviceType, shippingScope) {
        return this.prisma.tariff.findFirst({
            where: { name, serviceType, shippingScope },
        });
    }
    async findAllTariff(payload) {
        const feature = new prisma_query_feature_1.PrismaQueryFeature({
            search: payload.search,
            filter: payload.filter,
            sort: payload.sort,
            page: payload.page,
            pageSize: payload.pageSize,
            searchableFields: ['name', 'shippingScope', 'serviceType', 'currency'],
        });
        const query = feature.getQuery();
        console.log('quest1: ', query);
        const results = await Promise.all([
            this.prisma.tariff.findMany({
                ...query,
                where: query.where || {},
                select: {
                    id: true,
                    name: true,
                    shippingScope: true,
                    serviceType: true,
                    currency: true,
                    baseFee: true,
                    perKgRate: true,
                    perKmRate: true,
                    isActive: true,
                    effectiveFrom: true,
                    effectiveTo: true,
                    createdAt: true,
                    updatedAt: true,
                    customerCategory: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    surcharges: {
                        select: {
                            id: true,
                            name: true,
                            type: true,
                            value: true,
                            description: true,
                            isActive: true,
                            serviceType: true,
                            shippingScope: true,
                            createdAt: true,
                        },
                    },
                    discounts: {
                        select: {
                            id: true,
                            name: true,
                            type: true,
                            value: true,
                            description: true,
                            isActive: true,
                            validFrom: true,
                            validTo: true,
                            serviceType: true,
                            shippingScope: true,
                            createdAt: true,
                        },
                    },
                },
            }),
            this.prisma.tariff.count({ where: query.where || {} }),
        ]);
        const tariffs = results[0] || [];
        const total = results[1] || 0;
        return {
            tariffs,
            pagination: feature.getPagination(total),
        };
    }
    async findTariffById(id) {
        return this.prisma.tariff.findUnique({
            where: { id },
            include: { surcharges: true, discounts: true },
        });
    }
    async updateTariff(id, data) {
        return this.prisma.tariff.update({
            where: { id },
            data: {
                ...data,
                effectiveFrom: data.effectiveFrom
                    ? new Date(data.effectiveFrom)
                    : undefined,
                effectiveTo: data.effectiveTo ? new Date(data.effectiveTo) : undefined,
            },
        });
    }
    async deleteTariff(id) {
        return this.prisma.tariff.delete({ where: { id } });
    }
    async createProfitMargin(data) {
        return this.prisma.profitMargin.create({
            data: {
                ...data,
            },
        });
    }
    async findAll(payload) {
        const feature = new prisma_query_feature_1.PrismaQueryFeature({
            search: payload.search,
            filter: payload.filter,
            sort: payload.sort,
            page: payload.page,
            pageSize: payload.pageSize,
            searchableFields: ['shippingScope', 'serviceType'],
        });
        const query = feature.getQuery();
        console.log('quest1: ', query);
        const results = await Promise.all([
            this.prisma.profitMargin.findMany({
                ...query,
                where: query.where || {},
                select: {
                    id: true,
                    serviceType: true,
                    shippingScope: true,
                    percentage: true,
                    maxAmount: true,
                    minAmount: true,
                    createdAt: true,
                    updatedAt: true,
                    tariff: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            }),
            await this.prisma.profitMargin.count({ where: query.where || {} }),
        ]);
        const profitMargins = results[0] || [];
        const total = results[1] || 0;
        return {
            profitMargins,
            pagination: feature.getPagination(total),
        };
    }
    async findProfitMarginById(id) {
        return this.prisma.profitMargin.findUnique({
            where: { id },
            include: { tariff: true },
        });
    }
    async findByTariffId(tariffId) {
        return this.prisma.profitMargin.findFirst({
            where: { tariffId },
            include: { tariff: true },
        });
    }
    async updateProfitMargin(id, data) {
        return this.prisma.profitMargin.update({ where: { id }, data });
    }
    async deleteProfitMargin(id) {
        return this.prisma.profitMargin.delete({ where: { id } });
    }
    async createAirportFee(data) {
        return this.prisma.airportFee.create({
            data: {
                ...data,
                effectiveFrom: new Date(data.effectiveFrom),
                effectiveTo: data.effectiveTo ? new Date(data.effectiveTo) : null,
            },
        });
    }
    async findAllAirportFees(payload) {
        const feature = new prisma_query_feature_1.PrismaQueryFeature({
            search: payload.search,
            filter: payload.filter,
            sort: payload.sort,
            page: payload.page,
            pageSize: payload.pageSize,
            searchableFields: ['airportCode', 'shippingCope', 'serviceType'],
        });
        const query = feature.getQuery();
        console.log('quest1: ', query);
        const results = await Promise.all([
            await this.prisma.airportFee.findMany({
                ...query,
                where: query.where || {},
                include: {
                    tariff: true,
                },
            }),
            await this.prisma.airportFee.count({ where: query.where || {} }),
        ]);
        const airportFees = results[0] || [];
        const total = results[1] || 0;
        return {
            airportFees,
            pagination: feature.getPagination(total),
        };
    }
    async findAirportFeeById(id) {
        return this.prisma.airportFee.findUnique({
            where: { id },
            include: { tariff: true },
        });
    }
    async updateAirportFee(id, data) {
        return this.prisma.airportFee.update({
            where: { id },
            data: {
                ...data,
                effectiveFrom: data.effectiveFrom
                    ? new Date(data.effectiveFrom)
                    : undefined,
                effectiveTo: data.effectiveTo ? new Date(data.effectiveTo) : undefined,
            },
        });
    }
    async deleteAirportFee(id) {
        return this.prisma.airportFee.delete({
            where: { id },
        });
    }
    async findOverlappingAirportFee(data, from, to) {
        return this.prisma.airportFee.findFirst({
            where: {
                tariffId: data.tariffId,
                airportCode: data.airportCode,
                OR: [
                    { effectiveTo: null },
                    {
                        AND: [
                            { effectiveFrom: { lte: to ?? new Date('9999-12-31') } },
                            { effectiveTo: { gte: from } },
                        ],
                    },
                ],
            },
        });
    }
    async createMiscFee(data) {
        return this.prisma.miscFee.create({
            data: {
                ...data,
            },
        });
    }
    async findAllMiscFees(payload) {
        const feature = new prisma_query_feature_1.PrismaQueryFeature({
            search: payload.search,
            filter: payload.filter,
            sort: payload.sort,
            page: payload.page,
            pageSize: payload.pageSize,
            searchableFields: [
                'name',
                'feeType',
                'description',
                'shippingCope',
                'serviceType',
            ],
        });
        const query = feature.getQuery();
        console.log('quest1: ', query);
        const results = await Promise.all([
            await this.prisma.miscFee.findMany({
                ...query,
                where: query.where || {},
                include: {
                    tariff: true,
                },
            }),
            await this.prisma.miscFee.count({ where: query.where || {} }),
        ]);
        const miscFees = results[0] || [];
        const total = results[1] || 0;
        return {
            miscFees,
            pagination: feature.getPagination(total),
        };
    }
    async findMiscFeeById(id) {
        return this.prisma.miscFee.findUnique({
            where: { id },
            include: { tariff: true },
        });
    }
    async updateMiscFee(id, data) {
        return this.prisma.miscFee.update({
            where: { id },
            data: {
                ...data,
            },
        });
    }
    async deleteMiscFee(id) {
        return this.prisma.miscFee.delete({ where: { id } });
    }
    async createSurcharge(data) {
        return this.prisma.surcharge.create({ data });
    }
    async updateSurcharge(id, data) {
        return this.prisma.surcharge.update({ where: { id }, data });
    }
    async findSurchargeById(id) {
        return this.prisma.surcharge.findUnique({ where: { id } });
    }
    async findAllSurcharge(payload) {
        const feature = new prisma_query_feature_1.PrismaQueryFeature({
            search: payload.search,
            filter: payload.filter,
            sort: payload.sort,
            page: payload.page,
            pageSize: payload.pageSize,
            searchableFields: ['name', 'type', 'shippingCope', 'serviceType'],
        });
        const query = feature.getQuery();
        console.log('quest1: ', query);
        const results = await Promise.all([
            await this.prisma.surcharge.findMany({
                ...query,
                where: query.where || {},
                include: {
                    tariff: true,
                },
            }),
            await this.prisma.surcharge.count({ where: query.where || {} }),
        ]);
        const surcharges = results[0] || [];
        const total = results[1] || 0;
        return {
            surcharges,
            pagination: feature.getPagination(total),
        };
    }
    async deleteSurcharge(id) {
        return this.prisma.surcharge.delete({ where: { id } });
    }
    async createDiscount(data) {
        return this.prisma.discountRule.create({
            data: {
                ...data,
                validFrom: new Date(data.validFrom),
                validTo: data.validTo ? new Date(data.validTo) : null,
            },
            include: {
                tariff: true,
                customerCategory: true,
            },
        });
    }
    async findAllDiscount(payload) {
        const feature = new prisma_query_feature_1.PrismaQueryFeature({
            search: payload.search,
            filter: payload.filter,
            sort: payload.sort,
            page: payload.page,
            pageSize: payload.pageSize,
            searchableFields: ['name', 'type', 'shippingCope', 'serviceType'],
        });
        const query = feature.getQuery();
        console.log('quest1: ', query);
        const results = await Promise.all([
            await this.prisma.discountRule.findMany({
                ...query,
                where: query.where || {},
                include: {
                    tariff: true,
                    customerCategory: true,
                },
            }),
            await this.prisma.discountRule.count({ where: query.where || {} }),
        ]);
        const discounts = results[0] || [];
        const total = results[1] || 0;
        return {
            discounts,
            pagination: feature.getPagination(total),
        };
    }
    async findDiscountById(id) {
        return this.prisma.discountRule.findUnique({
            where: { id },
            include: {
                tariff: true,
                customerCategory: true,
            },
        });
    }
    async updateDiscount(id, data, validFrom, validTo) {
        return this.prisma.discountRule.update({
            where: { id },
            data: {
                ...data,
                validFrom: validFrom ? validFrom : undefined,
                validTo: validTo ? validTo : undefined,
            },
            include: {
                tariff: true,
                customerCategory: true,
            },
        });
    }
    async deleteDiscount(id) {
        return this.prisma.discountRule.delete({
            where: { id },
        });
    }
    async findCustomerCategoryByUserId(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user)
            return null;
        if (!user.customerType)
            return null;
        const category = await this.prisma.customerCategory.findFirst({
            where: { name: user.customerType },
            include: { discountRules: true },
        });
        return category;
    }
    async createCustomerCategory(data) {
        return this.prisma.customerCategory.create({
            data,
        });
    }
    async findAllCustomerCategory(payload) {
        const feature = new prisma_query_feature_1.PrismaQueryFeature({
            search: payload.search,
            filter: payload.filter,
            sort: payload.sort,
            page: payload.page,
            pageSize: payload.pageSize,
            searchableFields: ['name', 'description'],
        });
        const query = feature.getQuery();
        console.log('quest1: ', query);
        const results = await Promise.all([
            await this.prisma.customerCategory.findMany({
                ...query,
                where: query.where || {},
                include: { discountRules: true },
            }),
            await this.prisma.customerCategory.count({ where: query.where || {} }),
        ]);
        const customerCategories = results[0] || [];
        const total = results[1] || 0;
        return {
            customerCategories,
            pagination: feature.getPagination(total),
        };
    }
    async findCustomerCategoryById(id) {
        return this.prisma.customerCategory.findUnique({
            where: { id },
            include: { discountRules: true },
        });
    }
    async updateCustomerCategory(id, data) {
        return this.prisma.customerCategory.update({
            where: { id },
            data,
        });
    }
    async deleteCustomerCategory(id) {
        return this.prisma.customerCategory.delete({
            where: { id },
        });
    }
    async findCustomerById(userId) {
        return await this.prisma.user.findUnique({ where: { id: userId } });
    }
    async findCustomerCategoryByName(name) {
        return this.prisma.customerCategory.findFirst({
            where: { name },
        });
    }
    async createPriceCalculationLog(data) {
        return this.prisma.priceCalculationLog.create({ data });
    }
    async findAllPriceCalculationLog(payload) {
        const feature = new prisma_query_feature_1.PrismaQueryFeature({
            search: payload.search,
            filter: payload.filter,
            sort: payload.sort,
            page: payload.page,
            pageSize: payload.pageSize,
            searchableFields: [],
        });
        const query = feature.getQuery();
        console.log('quest1: ', query);
        const results = await Promise.all([
            this.prisma.priceCalculationLog.findMany({
                ...query,
                where: query.where || {},
                select: {
                    id: true,
                    weight: true,
                    distance: true,
                    baseRate: true,
                    appliedRate: true,
                    finalPrice: true,
                    currency: true,
                    createdAt: true,
                    order: {
                        select: {
                            id: true,
                            trackingCode: true,
                            notes: true,
                            customer: {
                                select: {
                                    name: true,
                                    email: true,
                                    phone: true,
                                },
                            },
                            shipmentType: true,
                            shippingScope: true,
                            serviceType: true,
                        },
                    },
                    surcharges: true,
                    discounts: true,
                    miscFees: true,
                    airportFee: true,
                    profit: true,
                },
            }),
            this.prisma.priceCalculationLog.count({ where: query.where || {} }),
        ]);
        const priceCalculationLogs = results[0] || [];
        const total = results[1] || 0;
        return {
            priceCalculationLogs,
            pagination: feature.getPagination(total),
        };
    }
    async findPriceCalculationLogById(id) {
        return this.prisma.priceCalculationLog.findUnique({
            where: { id },
            include: { order: true },
        });
    }
    async deletePriceCalculationLog(id) {
        return this.prisma.priceCalculationLog.delete({ where: { id } });
    }
    async getProfitMarginByTariff(tariffId) {
        return this.prisma.profitMargin.findFirst({
            where: { tariffId },
        });
    }
    async getMiscFeesByTariff(tariffId) {
        return this.prisma.miscFee.findMany({
            where: { tariffId },
        });
    }
    async getSurchargesByTariff(tariffId) {
        return this.prisma.surcharge.findMany({
            where: { tariffId, isActive: true },
        });
    }
    async getDiscountsByTariff(tariffId) {
        return this.prisma.discountRule.findMany({
            where: { tariffId, isActive: true },
        });
    }
    async getOrderById(orderId, options) {
        return this.prisma.order.findUnique({
            where: { id: orderId },
            include: {
                customer: options?.includeCustomer ? true : false,
            },
        });
    }
    async findTariffByScopeAndServiceType(scope, serviceType) {
        return this.prisma.tariff.findFirst({
            where: {
                serviceType,
                isActive: true,
                effectiveFrom: { lte: new Date() },
                OR: [{ effectiveTo: null }, { effectiveTo: { gte: new Date() } }],
            },
            include: {
                miscFees: true,
                airportFees: true,
                surcharges: true,
                discounts: true,
                profitMargins: true,
            },
        });
    }
    async findTariffByScopeAndServiceTypeAndCustomerCategory(shippingScope, serviceType, customerCategoryId) {
        return this.prisma.tariff.findFirst({
            where: {
                serviceType,
                shippingScope,
                isActive: true,
                effectiveFrom: { lte: new Date() },
                OR: [{ effectiveTo: null }, { effectiveTo: { gte: new Date() } }],
                ...(customerCategoryId ? { customerCategoryId } : {}),
            },
            include: {
                miscFees: true,
                airportFees: true,
                surcharges: true,
                discounts: true,
                profitMargins: true,
            },
        });
    }
    async getCustomerCategoryByUserId(userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.customerType)
            return null;
        return this.prisma.customerCategory.findFirst({
            where: { name: user.customerType },
        });
    }
    async getDiscountRules(tariffId, customerCategoryId) {
        return this.prisma.discountRule.findMany({
            where: {
                tariffId,
                customerCategoryId,
                isActive: true,
                validFrom: { lte: new Date() },
                OR: [{ validTo: null }, { validTo: { gte: new Date() } }],
            },
        });
    }
    async logPriceCalculationAndUpdateOrder(data) {
        return this.prisma.$transaction(async (tx) => {
            const log = await tx.priceCalculationLog.create({
                data: {
                    orderId: data.orderId,
                    weight: data.weight,
                    distance: data.distance,
                    baseRate: data.baseRate,
                    appliedRate: data.appliedRate,
                    surcharges: data.surcharges,
                    discounts: data.discounts,
                    miscFees: data.miscFees,
                    profit: data.profit,
                    airportFee: data.airportFee,
                    finalPrice: data.finalPrice,
                    currency: data.currency,
                },
            });
            await tx.order.update({
                where: { id: data.orderId },
                data: {
                    cost: data.finalPrice,
                    finalPrice: data.finalPrice,
                    currency: data.currency,
                },
            });
            return log;
        });
    }
};
exports.PricingRepository = PricingRepository;
exports.PricingRepository = PricingRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PricingRepository);
//# sourceMappingURL=pricing.repository.js.map