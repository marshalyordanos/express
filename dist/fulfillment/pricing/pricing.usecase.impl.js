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
exports.PricingUseCasesImpl = void 0;
const client_1 = require("@prisma/client");
const pricing_repository_1 = require("./pricing.repository");
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const handleCatch_1 = require("../../common/handleCatch");
const app_logger_service_1 = require("../../common/app-logger.service");
let PricingUseCasesImpl = class PricingUseCasesImpl {
    constructor(pricingRepo, logger) {
        this.pricingRepo = pricingRepo;
        this.logger = logger;
        this.logger.setContext('FulfillmentService', 'PricingUsecaseImpl');
    }
    async createTariff(data) {
        this.logger.log(`Creating new tariff: ${data.name}`);
        try {
            if (data.customerCategoryId) {
                const category = await this.pricingRepo.findCustomerCategoryById(data.customerCategoryId);
                if (!category) {
                    this.logger.warn(`Customer category not found: ${data.customerCategoryId}`);
                    throw new microservices_1.RpcException({
                        statusCode: 404,
                        message: `Customer Category with id ${data.customerCategoryId} not found.`,
                    });
                }
            }
            if (!data.serviceType)
                throw new microservices_1.RpcException({
                    statusCode: 400,
                    message: 'serviceType is required',
                });
            if (data.baseFee == null || Number.isNaN(Number(data.baseFee)))
                throw new microservices_1.RpcException({
                    statusCode: 400,
                    message: 'baseFee must be a valid number',
                });
            if (Number(data.baseFee) < 0)
                throw new microservices_1.RpcException({
                    statusCode: 400,
                    message: 'baseFee must be >= 0',
                });
            if (data.perKgRate != null && Number(data.perKgRate) < 0)
                throw new microservices_1.RpcException({
                    statusCode: 400,
                    message: 'perKgRate must be >= 0',
                });
            if (data.perKmRate != null && Number(data.perKmRate) < 0)
                throw new microservices_1.RpcException({
                    statusCode: 400,
                    message: 'perKmRate must be >= 0',
                });
            if (!data.currency || typeof data.currency !== 'string')
                throw new microservices_1.RpcException({
                    statusCode: 400,
                    message: 'currency is required',
                });
            const currency = data.currency.trim().toUpperCase();
            if (currency.length < 2 || currency.length > 5)
                throw new microservices_1.RpcException({
                    statusCode: 400,
                    message: 'currency must be 2-5 characters (e.g. ETB, USD)',
                });
            const effectiveFrom = new Date(data.effectiveFrom);
            if (isNaN(effectiveFrom.getTime()))
                throw new microservices_1.RpcException({
                    statusCode: 400,
                    message: 'effectiveFrom is not a valid ISO date',
                });
            let effectiveTo = null;
            if (data.effectiveTo) {
                effectiveTo = new Date(data.effectiveTo);
                if (isNaN(effectiveTo.getTime()))
                    throw new microservices_1.RpcException({
                        statusCode: 400,
                        message: 'effectiveTo is not a valid ISO date',
                    });
                if (effectiveFrom > effectiveTo)
                    throw new microservices_1.RpcException({
                        statusCode: 400,
                        message: 'effectiveFrom must be on or before effectiveTo',
                    });
            }
            const overlap = await this.pricingRepo.findOverlappingTariff(data.serviceType, effectiveFrom, effectiveTo, data.shippingScope);
            if (overlap)
                throw new microservices_1.RpcException({
                    statusCode: 409,
                    message: `Overlapping tariff exists (id=${overlap.id}, name="${overlap.name}")`,
                });
            const dup = await this.pricingRepo.findByNameAndServiceType(data.name.trim(), data.serviceType, data.shippingScope);
            if (dup)
                throw new microservices_1.RpcException({
                    statusCode: 409,
                    message: 'A tariff with the same name and service type already exists',
                });
            if ((data.baseFee === 0 || data.baseFee == null) &&
                (data.perKmRate == null || Number(data.perKmRate) === 0) &&
                (data.perKgRate == null || Number(data.perKgRate) === 0)) {
                throw new microservices_1.RpcException({
                    statusCode: 400,
                    message: 'Tariff must define at least one of baseFee, perKmRate or perKgRate with a positive value',
                });
            }
            const payload = {
                name: data.name.trim(),
                serviceType: data.serviceType,
                shippingScope: data.shippingScope,
                customerCategoryId: data.customerCategoryId,
                baseFee: Number(data.baseFee),
                perKmRate: data.perKmRate != null ? Number(data.perKmRate) : null,
                perKgRate: data.perKgRate != null ? Number(data.perKgRate) : null,
                currency,
                effectiveFrom,
                effectiveTo: effectiveTo ?? null,
                isActive: true,
            };
            this.logger.verbose(`Tariff payload prepared: ${JSON.stringify(payload)}`);
            const created = await this.pricingRepo.createTariff(payload);
            this.logger.log(`Tariff created successfully: ${created.id}`);
            return created;
        }
        catch (error) {
            this.logger.error(`Failed to create tariff: ${error.message}`);
            throw (0, handleCatch_1.handleCatch)(error);
        }
    }
    async findAllTariff(query) {
        try {
            return await this.pricingRepo.findAllTariff(query);
        }
        catch (error) {
            this.logger.error(`Failed to fetch tariffs: ${error.message}`);
            throw (0, handleCatch_1.handleCatch)(error);
        }
    }
    async findTariffById(id) {
        this.logger.log(`Fetching tariff by id: ${id}`);
        try {
            if (!id)
                throw new microservices_1.RpcException({
                    statusCode: 400,
                    message: 'Tariff ID is required',
                });
            const tariff = await this.pricingRepo.findTariffById(id);
            if (!tariff)
                throw new microservices_1.RpcException({
                    statusCode: 404,
                    message: 'Tariff not found',
                });
            return tariff;
        }
        catch (error) {
            this.logger.error(`Failed to fetch tariff ${id}: ${error.message}`);
            throw (0, handleCatch_1.handleCatch)(error);
        }
    }
    async updateTariff(id, data) {
        this.logger.log(`Updating tariff: ${id}`);
        try {
            if (!id)
                throw new microservices_1.RpcException({
                    statusCode: 400,
                    message: 'Tariff ID is required',
                });
            if (data.baseFee !== undefined && data.baseFee < 0)
                throw new microservices_1.RpcException({
                    statusCode: 400,
                    message: 'baseFee must be >= 0',
                });
            if (data.perKgRate !== undefined && data.perKgRate < 0)
                throw new microservices_1.RpcException({
                    statusCode: 400,
                    message: 'perKgRate must be >= 0',
                });
            if (data.perKmRate !== undefined && data.perKmRate < 0)
                throw new microservices_1.RpcException({
                    statusCode: 400,
                    message: 'perKmRate must be >= 0',
                });
            if (data.effectiveFrom && data.effectiveTo) {
                if (new Date(data.effectiveFrom) >= new Date(data.effectiveTo))
                    throw new microservices_1.RpcException({
                        statusCode: 400,
                        message: 'effectiveFrom must be before effectiveTo',
                    });
            }
            if (data.serviceType &&
                !Object.values(client_1.ServiceType).includes(data.serviceType))
                throw new microservices_1.RpcException({
                    statusCode: 400,
                    message: 'Invalid serviceType',
                });
            const updated = await this.pricingRepo.updateTariff(id, data);
            this.logger.log(`Tariff updated successfully: ${id}`);
            return updated;
        }
        catch (error) {
            this.logger.error(`Failed to update tariff ${id}: ${error.message}`);
            throw (0, handleCatch_1.handleCatch)(error);
        }
    }
    async deleteTariff(id) {
        this.logger.log(`Deleting tariff: ${id}`);
        try {
            if (!id)
                throw new microservices_1.RpcException({
                    statusCode: 400,
                    message: 'Tariff ID is required',
                });
            const tariff = await this.pricingRepo.findTariffById(id);
            if (!tariff)
                throw new microservices_1.RpcException({
                    statusCode: 404,
                    message: 'Tariff not found',
                });
            const deleted = await this.pricingRepo.deleteTariff(id);
            this.logger.log(`Tariff deleted successfully: ${id}`);
            return deleted;
        }
        catch (error) {
            this.logger.error(`Failed to delete tariff ${id}: ${error.message}`);
            throw (0, handleCatch_1.handleCatch)(error);
        }
    }
    async createProfitMargin(data) {
        this.logger.log(`Creating profit margin for tariff: ${data.tariffId}`);
        try {
            const tariff = await this.pricingRepo.findTariffById(data.tariffId);
            if (!tariff) {
                this.logger.warn(`Tariff not found: ${data.tariffId}`);
                throw new microservices_1.RpcException({
                    statusCode: 404,
                    message: 'Tariff not found',
                });
            }
            if (data.minAmount && data.maxAmount && data.minAmount > data.maxAmount) {
                throw new microservices_1.RpcException({
                    statusCode: 400,
                    message: 'minAmount cannot be greater than maxAmount',
                });
            }
            if (data.percentage < 0 || data.percentage > 100) {
                throw new microservices_1.RpcException({
                    statusCode: 400,
                    message: 'percentage must be between 0 and 100',
                });
            }
            const exists = await this.pricingRepo.findByTariffId(data.tariffId);
            if (exists) {
                throw new microservices_1.RpcException({
                    statusCode: 409,
                    message: 'Profit margin already exists for this tariff',
                });
            }
            const created = await this.pricingRepo.createProfitMargin(data);
            this.logger.log(`Profit margin created successfully for tariff: ${data.tariffId}`);
            return created;
        }
        catch (error) {
            this.logger.error(`Failed to create profit margin: ${error.message}`);
            throw (0, handleCatch_1.handleCatch)(error);
        }
    }
    async findAllProfitMargins(query) {
        this.logger.log('Fetching all profit margins');
        try {
            return await this.pricingRepo.findAll(query);
        }
        catch (error) {
            this.logger.error(`Failed to fetch profit margins: ${error.message}`);
            throw (0, handleCatch_1.handleCatch)(error);
        }
    }
    async findProfitMarginById(id) {
        this.logger.log(`Fetching profit margin by ID: ${id}`);
        try {
            const pm = await this.pricingRepo.findProfitMarginById(id);
            if (!pm)
                throw new microservices_1.RpcException({
                    statusCode: 404,
                    message: 'Profit margin not found',
                });
            return pm;
        }
        catch (error) {
            this.logger.error(`Failed to fetch profit margin ${id}: ${error.message}`);
            throw (0, handleCatch_1.handleCatch)(error);
        }
    }
    async updateProfitMargin(id, data) {
        this.logger.log(`Updating profit margin ID: ${id}`);
        try {
            const pm = await this.pricingRepo.findProfitMarginById(id);
            if (!pm)
                throw new microservices_1.RpcException({
                    statusCode: 404,
                    message: 'Profit margin not found',
                });
            if (data.minAmount && data.maxAmount && data.minAmount > data.maxAmount) {
                throw new microservices_1.RpcException({
                    statusCode: 400,
                    message: 'minAmount cannot be greater than maxAmount',
                });
            }
            if (data.percentage && (data.percentage < 0 || data.percentage > 100)) {
                throw new microservices_1.RpcException({
                    statusCode: 400,
                    message: 'percentage must be between 0 and 100',
                });
            }
            const updated = await this.pricingRepo.updateProfitMargin(id, data);
            this.logger.log(`Profit margin updated successfully: ${id}`);
            return updated;
        }
        catch (error) {
            this.logger.error(`Failed to update profit margin ${id}: ${error.message}`);
            throw (0, handleCatch_1.handleCatch)(error);
        }
    }
    async deleteProfitMargin(id) {
        this.logger.log(`Deleting profit margin ID: ${id}`);
        try {
            const pm = await this.pricingRepo.findProfitMarginById(id);
            if (!pm)
                throw new microservices_1.RpcException({
                    statusCode: 404,
                    message: 'Profit margin not found',
                });
            const deleted = await this.pricingRepo.deleteProfitMargin(id);
            this.logger.log(`Profit margin deleted successfully: ${id}`);
            return deleted;
        }
        catch (error) {
            this.logger.error(`Failed to delete profit margin ${id}: ${error.message}`);
            throw (0, handleCatch_1.handleCatch)(error);
        }
    }
    async createAirportFee(data) {
        this.logger.log(`Creating airport fee for tariff: ${data.tariffId}`);
        try {
            const tariff = await this.pricingRepo.findTariffById(data.tariffId);
            if (!tariff) {
                this.logger.warn(`Tariff not found: ${data.tariffId}`);
                throw new microservices_1.RpcException({
                    statusCode: 404,
                    message: `Tariff with id ${data.tariffId} does not exist`,
                });
            }
            if (!data.perKgRate && !data.flatFee) {
                throw new microservices_1.RpcException({
                    statusCode: 400,
                    message: 'Either perKgRate or flatFee must be provided',
                });
            }
            const from = new Date(data.effectiveFrom);
            const to = data.effectiveTo ? new Date(data.effectiveTo) : null;
            if (to && from >= to) {
                throw new microservices_1.RpcException({
                    statusCode: 400,
                    message: 'effectiveFrom must be earlier than effectiveTo',
                });
            }
            const overlap = await this.pricingRepo.findOverlappingAirportFee(data, from, to);
            if (overlap) {
                throw new microservices_1.RpcException({
                    statusCode: 409,
                    message: `Overlapping airport fee already exists for ${data.airportCode} (${data.serviceType}) in this tariff`,
                });
            }
            const created = await this.pricingRepo.createAirportFee(data);
            this.logger.log(`Airport fee created successfully for tariff: ${data.tariffId}`);
            return created;
        }
        catch (error) {
            this.logger.error(`Failed to create airport fee: ${error.message}`);
            throw (0, handleCatch_1.handleCatch)(error);
        }
    }
    async findAllAirportFees(query) {
        this.logger.log('Fetching all airport fees');
        try {
            return await this.pricingRepo.findAllAirportFees(query);
        }
        catch (error) {
            this.logger.error(`Failed to fetch airport fees: ${error.message}`);
            throw (0, handleCatch_1.handleCatch)(error);
        }
    }
    async findAirportFeeById(id) {
        this.logger.log(`Fetching airport fee by ID: ${id}`);
        try {
            const fee = await this.pricingRepo.findAirportFeeById(id);
            if (!fee)
                throw new microservices_1.RpcException({
                    statusCode: 404,
                    message: `AirportFee with id ${id} not found`,
                });
            return fee;
        }
        catch (error) {
            this.logger.error(`Failed to fetch airport fee ${id}: ${error.message}`);
            throw (0, handleCatch_1.handleCatch)(error);
        }
    }
    async updateAirportFee(id, data) {
        this.logger.log(`Updating airport fee ID: ${id}`);
        try {
            if (data.effectiveFrom && data.effectiveTo) {
                const from = new Date(data.effectiveFrom);
                const to = new Date(data.effectiveTo);
                if (from >= to) {
                    throw new microservices_1.RpcException({
                        statusCode: 400,
                        message: 'effectiveFrom must be earlier than effectiveTo',
                    });
                }
            }
            const updated = await this.pricingRepo.updateAirportFee(id, data);
            this.logger.log(`Airport fee updated successfully: ${id}`);
            return updated;
        }
        catch (error) {
            this.logger.error(`Failed to update airport fee ${id}: ${error.message}`);
            throw (0, handleCatch_1.handleCatch)(error);
        }
    }
    async deleteAirportFee(id) {
        this.logger.log(`Deleting airport fee ID: ${id}`);
        try {
            const deleted = await this.pricingRepo.deleteAirportFee(id);
            this.logger.log(`Airport fee deleted successfully: ${id}`);
            return deleted;
        }
        catch (error) {
            this.logger.error(`Failed to delete airport fee ${id}: ${error.message}`);
            throw (0, handleCatch_1.handleCatch)(error);
        }
    }
    async createMiscFee(data) {
        this.logger.log(`Creating miscellaneous fee for tariff: ${data.tariffId}`);
        try {
            const tariff = await this.pricingRepo.findTariffById(data.tariffId);
            if (!tariff) {
                this.logger.warn(`Tariff not found: ${data.tariffId}`);
                throw new microservices_1.RpcException({
                    statusCode: 404,
                    message: `Tariff with id ${data.tariffId} does not exist`,
                });
            }
            if (data.amount <= 0) {
                throw new microservices_1.RpcException({
                    statusCode: 400,
                    message: 'Amount must be greater than 0',
                });
            }
            if (data.feeType === client_1.FeeType.PERCENTAGE &&
                (data.amount <= 0 || data.amount > 100)) {
                throw new microservices_1.RpcException({
                    statusCode: 400,
                    message: 'Percentage fee must be between 0 and 100',
                });
            }
            const from = new Date(data.effectiveFrom);
            const to = data.effectiveTo ? new Date(data.effectiveTo) : null;
            if (to && from >= to) {
                throw new microservices_1.RpcException({
                    statusCode: 400,
                    message: 'effectiveFrom must be earlier than effectiveTo',
                });
            }
            const created = await this.pricingRepo.createMiscFee(data);
            this.logger.log(`Miscellaneous fee created successfully for tariff: ${data.tariffId}`);
            return created;
        }
        catch (error) {
            this.logger.error(`Failed to create miscellaneous fee: ${error.message}`);
            throw (0, handleCatch_1.handleCatch)(error);
        }
    }
    async findAllMiscFees(query) {
        this.logger.log('Fetching all miscellaneous fees');
        try {
            return await this.pricingRepo.findAllMiscFees(query);
        }
        catch (error) {
            this.logger.error(`Failed to fetch miscellaneous fees: ${error.message}`);
            throw (0, handleCatch_1.handleCatch)(error);
        }
    }
    async findMiscFeeById(id) {
        this.logger.log(`Fetching miscellaneous fee by ID: ${id}`);
        try {
            const fee = await this.pricingRepo.findMiscFeeById(id);
            if (!fee)
                throw new microservices_1.RpcException({
                    statusCode: 404,
                    message: `MiscFee with id ${id} not found`,
                });
            return fee;
        }
        catch (error) {
            this.logger.error(`Failed to fetch miscellaneous fee ${id}: ${error.message}`);
            throw (0, handleCatch_1.handleCatch)(error);
        }
    }
    async updateMiscFee(id, data) {
        this.logger.log(`Updating miscellaneous fee ID: ${id}`);
        try {
            if (data.amount !== undefined) {
                if (data.amount <= 0)
                    throw new microservices_1.RpcException({
                        statusCode: 400,
                        message: 'Amount must be greater than 0',
                    });
                if (data.feeType === client_1.FeeType.PERCENTAGE &&
                    (data.amount <= 0 || data.amount > 100)) {
                    throw new microservices_1.RpcException({
                        statusCode: 400,
                        message: 'Percentage fee must be between 0 and 100',
                    });
                }
            }
            if (data.effectiveFrom && data.effectiveTo) {
                const from = new Date(data.effectiveFrom);
                const to = new Date(data.effectiveTo);
                if (from >= to)
                    throw new microservices_1.RpcException({
                        statusCode: 400,
                        message: 'effectiveFrom must be earlier than effectiveTo',
                    });
            }
            const updated = await this.pricingRepo.updateMiscFee(id, data);
            this.logger.log(`Miscellaneous fee updated successfully: ${id}`);
            return updated;
        }
        catch (error) {
            this.logger.error(`Failed to update miscellaneous fee ${id}: ${error.message}`);
            throw (0, handleCatch_1.handleCatch)(error);
        }
    }
    async deleteMiscFee(id) {
        this.logger.log(`Deleting miscellaneous fee ID: ${id}`);
        try {
            const deleted = await this.pricingRepo.deleteMiscFee(id);
            this.logger.log(`Miscellaneous fee deleted successfully: ${id}`);
            return deleted;
        }
        catch (error) {
            this.logger.error(`Failed to delete miscellaneous fee ${id}: ${error.message}`);
            throw (0, handleCatch_1.handleCatch)(error);
        }
    }
    async createSurcharge(data) {
        this.logger.log(`Creating surcharge for tariff: ${data.tariffId}`);
        try {
            const tariff = await this.pricingRepo.findTariffById(data.tariffId);
            if (!tariff) {
                this.logger.warn(`Tariff not found: ${data.tariffId}`);
                throw new microservices_1.RpcException({
                    statusCode: 404,
                    message: `Tariff with id ${data.tariffId} not found`,
                });
            }
            if (!['percentage', 'fixed'].includes(data.type.toLowerCase())) {
                throw new microservices_1.RpcException({
                    statusCode: 400,
                    message: `Invalid type "${data.type}". Allowed: "percentage" or "fixed"`,
                });
            }
            if (data.value < 0) {
                throw new microservices_1.RpcException({
                    statusCode: 400,
                    message: `Surcharge value cannot be negative`,
                });
            }
            if (data.serviceType &&
                !Object.values(client_1.ServiceType).includes(data.serviceType)) {
                throw new microservices_1.RpcException({
                    statusCode: 400,
                    message: `Invalid serviceType "${data.serviceType}"`,
                });
            }
            if (data.shippingScope &&
                !Object.values(client_1.ShippingScope).includes(data.shippingScope)) {
                throw new microservices_1.RpcException({
                    statusCode: 400,
                    message: `Invalid shippingScope "${data.shippingScope}"`,
                });
            }
            const created = await this.pricingRepo.createSurcharge(data);
            this.logger.log(`Surcharge created successfully for tariff: ${data.tariffId}`);
            return created;
        }
        catch (error) {
            this.logger.error(`Failed to create surcharge: ${error.message}`);
            throw (0, handleCatch_1.handleCatch)(error);
        }
    }
    async updateSurcharge(id, data) {
        this.logger.log(`Updating surcharge ID: ${id}`);
        try {
            const existing = await this.pricingRepo.findSurchargeById(id);
            if (!existing)
                throw new microservices_1.RpcException({
                    statusCode: 404,
                    message: `Surcharge with id ${id} not found`,
                });
            if (data.type &&
                !['percentage', 'fixed'].includes(data.type.toLowerCase())) {
                throw new microservices_1.RpcException({
                    statusCode: 400,
                    message: `Invalid type "${data.type}". Allowed: "percentage" or "fixed"`,
                });
            }
            if (data.value !== undefined && data.value < 0) {
                throw new microservices_1.RpcException({
                    statusCode: 400,
                    message: `Surcharge value cannot be negative`,
                });
            }
            if (data.serviceType &&
                !Object.values(client_1.ServiceType).includes(data.serviceType)) {
                throw new microservices_1.RpcException({
                    statusCode: 400,
                    message: `Invalid serviceType "${data.serviceType}"`,
                });
            }
            if (data.shippingScope &&
                !Object.values(client_1.ShippingScope).includes(data.shippingScope)) {
                throw new microservices_1.RpcException({
                    statusCode: 400,
                    message: `Invalid shippingScope "${data.shippingScope}"`,
                });
            }
            const updated = await this.pricingRepo.updateSurcharge(id, data);
            this.logger.log(`Surcharge updated successfully: ${id}`);
            return updated;
        }
        catch (error) {
            this.logger.error(`Failed to update surcharge ${id}: ${error.message}`);
            throw (0, handleCatch_1.handleCatch)(error);
        }
    }
    async findAllSurcharge(query) {
        this.logger.log('Fetching all surcharges');
        try {
            return await this.pricingRepo.findAllSurcharge(query);
        }
        catch (error) {
            this.logger.error(`Failed to fetch surcharges: ${error.message}`);
            throw (0, handleCatch_1.handleCatch)(error);
        }
    }
    async findSurchargeById(id) {
        this.logger.log(`Fetching surcharge by ID: ${id}`);
        try {
            const surcharge = await this.pricingRepo.findSurchargeById(id);
            if (!surcharge)
                throw new microservices_1.RpcException({
                    statusCode: 404,
                    message: `Surcharge with id ${id} not found`,
                });
            return surcharge;
        }
        catch (error) {
            this.logger.error(`Failed to fetch surcharge ${id}: ${error.message}`);
            throw (0, handleCatch_1.handleCatch)(error);
        }
    }
    async deleteSurcharge(id) {
        this.logger.log(`Deleting surcharge ID: ${id}`);
        try {
            const existing = await this.pricingRepo.findSurchargeById(id);
            if (!existing)
                throw new microservices_1.RpcException({
                    statusCode: 404,
                    message: `Surcharge with id ${id} not found`,
                });
            const deleted = await this.pricingRepo.deleteSurcharge(id);
            this.logger.log(`Surcharge deleted successfully: ${id}`);
            return deleted;
        }
        catch (error) {
            this.logger.error(`Failed to delete surcharge ${id}: ${error.message}`);
            throw (0, handleCatch_1.handleCatch)(error);
        }
    }
    async createDiscount(data) {
        this.logger.log(`Creating discount for tariff: ${data.tariffId}`);
        try {
            const tariff = await this.pricingRepo.findTariffById(data.tariffId);
            if (!tariff) {
                this.logger.warn(`Tariff not found: ${data.tariffId}`);
                throw new microservices_1.RpcException({
                    statusCode: 404,
                    message: `Tariff with id ${data.tariffId} not found`,
                });
            }
            if (!['percentage', 'fixed'].includes(data.type.toLowerCase())) {
                throw new microservices_1.RpcException({
                    statusCode: 400,
                    message: `Invalid type "${data.type}". Allowed: percentage or fixed`,
                });
            }
            if (data.value < 0) {
                throw new microservices_1.RpcException({
                    statusCode: 400,
                    message: `Discount value cannot be negative`,
                });
            }
            if (data.customerCategoryId) {
                const category = await this.pricingRepo.findCustomerCategoryById(data.customerCategoryId);
                if (!category) {
                    throw new microservices_1.RpcException({
                        statusCode: 404,
                        message: `Customer category not found`,
                    });
                }
            }
            const validFrom = new Date(data.validFrom);
            const validTo = data.validTo ? new Date(data.validTo) : null;
            if (validTo && validFrom > validTo) {
                throw new microservices_1.RpcException({
                    statusCode: 400,
                    message: `validFrom cannot be after validTo`,
                });
            }
            const created = await this.pricingRepo.createDiscount({
                ...data,
                validFrom,
                validTo,
            });
            this.logger.log(`Discount created successfully for tariff: ${data.tariffId}`);
            return created;
        }
        catch (error) {
            this.logger.error(`Failed to create discount: ${error.message}`);
            throw (0, handleCatch_1.handleCatch)(error);
        }
    }
    async updateDiscount(id, data) {
        this.logger.log(`Updating discount ID: ${id}`);
        try {
            const existing = await this.pricingRepo.findDiscountById(id);
            if (!existing)
                throw new microservices_1.RpcException({
                    statusCode: 404,
                    message: `Discount with id ${id} not found`,
                });
            if (data.type &&
                !['percentage', 'fixed'].includes(data.type.toLowerCase())) {
                throw new microservices_1.RpcException({
                    statusCode: 400,
                    message: `Invalid type "${data.type}"`,
                });
            }
            if (data.value !== undefined && data.value < 0) {
                throw new microservices_1.RpcException({
                    statusCode: 400,
                    message: `Discount value cannot be negative`,
                });
            }
            if (data.customerCategoryId) {
                const category = await this.pricingRepo.findCustomerCategoryById(data.customerCategoryId);
                if (!category)
                    throw new microservices_1.RpcException({
                        statusCode: 404,
                        message: `Customer category not found`,
                    });
            }
            const validFrom = data.validFrom ? new Date(data.validFrom) : undefined;
            const validTo = data.validTo ? new Date(data.validTo) : undefined;
            if (validFrom && validTo && validFrom > validTo) {
                throw new microservices_1.RpcException({
                    statusCode: 400,
                    message: `validFrom cannot be after validTo`,
                });
            }
            const updated = await this.pricingRepo.updateDiscount(id, { ...data }, validFrom, validTo);
            this.logger.log(`Discount updated successfully: ${id}`);
            return updated;
        }
        catch (error) {
            this.logger.error(`Failed to update discount ${id}: ${error.message}`);
            throw (0, handleCatch_1.handleCatch)(error);
        }
    }
    async findAllDiscount(query) {
        this.logger.log('Fetching all discounts');
        try {
            return await this.pricingRepo.findAllDiscount(query);
        }
        catch (error) {
            this.logger.error(`Failed to fetch discounts: ${error.message}`);
            throw (0, handleCatch_1.handleCatch)(error);
        }
    }
    async findDiscountById(id) {
        this.logger.log(`Fetching discount by ID: ${id}`);
        try {
            const discount = await this.pricingRepo.findDiscountById(id);
            if (!discount)
                throw new microservices_1.RpcException({
                    statusCode: 404,
                    message: `Discount with id ${id} not found`,
                });
            return discount;
        }
        catch (error) {
            this.logger.error(`Failed to fetch discount ${id}: ${error.message}`);
            throw (0, handleCatch_1.handleCatch)(error);
        }
    }
    async deleteDiscount(id) {
        this.logger.log(`Deleting discount ID: ${id}`);
        try {
            const existing = await this.pricingRepo.findDiscountById(id);
            if (!existing)
                throw new microservices_1.RpcException({
                    statusCode: 404,
                    message: `Discount with id ${id} not found`,
                });
            const deleted = await this.pricingRepo.deleteDiscount(id);
            this.logger.log(`Discount deleted successfully: ${id}`);
            return deleted;
        }
        catch (error) {
            this.logger.error(`Failed to delete discount ${id}: ${error.message}`);
            throw (0, handleCatch_1.handleCatch)(error);
        }
    }
    async createCustomerCategory(data) {
        this.logger.log(`Creating customer category: ${data.name}`);
        const exists = await this.pricingRepo.findCustomerCategoryByName(data.name);
        if (exists) {
            throw new microservices_1.RpcException({
                code: 400,
                message: `Customer category "${data.name}" already exists.`,
            });
        }
        return await this.pricingRepo.createCustomerCategory(data);
    }
    async findAllCustomerCategory(query) {
        this.logger.log('Fetching all customer categories');
        return await this.pricingRepo.findAllCustomerCategory(query);
    }
    async findCustomerCategoryById(id) {
        this.logger.log(`Fetching customer category by ID: ${id}`);
        const category = await this.pricingRepo.findCustomerCategoryById(id);
        if (!category) {
            throw new microservices_1.RpcException({
                code: 404,
                message: `Customer category with id ${id} not found.`,
            });
        }
        return category;
    }
    async updateCustomerCategory(id, data) {
        this.logger.log(`Updating customer category ID: ${id}`);
        const category = await this.pricingRepo.findCustomerCategoryById(id);
        if (!category) {
            throw new microservices_1.RpcException({
                code: 404,
                message: `Customer category with id ${id} not found.`,
            });
        }
        if (data.name) {
            const exists = await this.pricingRepo.findCustomerCategoryByName(data.name);
            if (exists && exists.id !== id) {
                throw new microservices_1.RpcException({
                    code: 400,
                    message: `Customer category "${data.name}" already exists.`,
                });
            }
        }
        return await this.pricingRepo.updateCustomerCategory(id, data);
    }
    async deleteCustomerCategory(id) {
        this.logger.log(`Deleting customer category ID: ${id}`);
        const category = await this.pricingRepo.findCustomerCategoryById(id);
        if (!category) {
            throw new microservices_1.RpcException({
                code: 404,
                message: `Customer category with id ${id} not found.`,
            });
        }
        return await this.pricingRepo.deleteCustomerCategory(id);
    }
    async createPriceCalculationLog(data) {
        this.logger.log('Creating price calculation log');
        return await this.pricingRepo.createPriceCalculationLog(data);
    }
    async findAllPriceCalculationLog(query) {
        this.logger.log('Fetching all price calculation logs');
        return await this.pricingRepo.findAllPriceCalculationLog(query);
    }
    async findPriceCalculationLogById(id) {
        this.logger.log(`Fetching price calculation log by ID: ${id}`);
        const log = await this.pricingRepo.findPriceCalculationLogById(id);
        if (!log) {
            throw new microservices_1.RpcException({
                code: 404,
                message: `Price calculation log with id ${id} not found.`,
            });
        }
        return log;
    }
    async deletePriceCalculationLog(id) {
        this.logger.log(`Deleting price calculation log ID: ${id}`);
        const log = await this.pricingRepo.findPriceCalculationLogById(id);
        if (!log) {
            throw new microservices_1.RpcException({
                code: 404,
                message: `Price calculation log with id ${id} not found.`,
            });
        }
        return await this.pricingRepo.deletePriceCalculationLog(id);
    }
    async calculatePrice(orderId, userId) {
        this.logger.log(`🔹 Calculating price for Order ID: ${orderId}, User ID: ${userId || 'N/A'}`);
        const [order, customer] = await Promise.all([
            this.pricingRepo.getOrderById(orderId, { includeCustomer: true }),
            userId
                ? this.pricingRepo.findCustomerById(userId)
                : Promise.resolve(null),
        ]);
        if (!order) {
            return { result: null, error: `Order ${orderId} not found` };
        }
        this.logger.log(`🔹 Order found: ${order.id}, Customer: ${order.customer?.name || 'N/A'}`);
        const category = customer?.customerCategoryId
            ? await this.pricingRepo.findCustomerCategoryById(customer.customerCategoryId)
            : null;
        if (category)
            this.logger.log(`🔹 Customer Category: ${category.name} (${category.id})`);
        const tariff = await this.pricingRepo.findTariffByScopeAndServiceTypeAndCustomerCategory(order.shippingScope, order.serviceType, category?.id);
        if (!tariff) {
            return {
                result: null,
                error: `Tariff not found for ${order.shippingScope}/${order.serviceType}/${category?.name || 'None'}`,
            };
        }
        const weight = order.weight || 0;
        const distance = order.distance || 0;
        const breakdown = {};
        const basePrice = (tariff.baseFee || 0) +
            (tariff.perKgRate || 0) * weight +
            (tariff.perKmRate || 0) * distance;
        breakdown.basePrice = basePrice;
        const [miscTotal, miscFees] = this.calculateMiscFees(tariff.miscFees || [], order, basePrice, weight, distance);
        const [airportTotal, airportFees] = this.calculateAirportFees(tariff.airportFees || [], order, weight);
        const [surchargeTotal, surcharges] = this.calculateSurcharges(tariff.surcharges || [], order, basePrice, miscTotal, airportTotal);
        const [discountTotal, discounts] = category
            ? await this.calculateDiscounts(tariff.id, category.id, basePrice, miscTotal, airportTotal, surchargeTotal)
            : [0, []];
        const [profitTotal, profitMargins] = this.calculateProfitMargins(tariff.profitMargins || [], order, basePrice, miscTotal, airportTotal, surchargeTotal, discountTotal);
        const finalPrice = basePrice +
            miscTotal +
            airportTotal +
            surchargeTotal -
            discountTotal +
            profitTotal;
        breakdown.finalPrice = finalPrice;
        breakdown.miscFees = miscFees;
        breakdown.airportFees = airportFees;
        breakdown.surcharges = surcharges;
        breakdown.discounts = discounts;
        breakdown.profitMargins = profitMargins;
        this.logger.log('🔹 Price breakdown:', JSON.stringify(breakdown, null, 2));
        await this.pricingRepo.logPriceCalculationAndUpdateOrder({
            orderId: order.id,
            weight,
            distance,
            baseRate: basePrice,
            appliedRate: basePrice + miscTotal + airportTotal + surchargeTotal,
            surcharges,
            discounts,
            miscFees,
            profit: { total: profitTotal },
            airportFee: { total: airportTotal },
            finalPrice,
            currency: tariff.currency || 'ETB',
        });
        return {
            result: {
                finalPrice,
                currency: tariff.currency || 'ETB',
                breakdown,
            },
            error: null,
        };
    }
    calculateMiscFees(fees, order, basePrice, weight, distance) {
        let total = 0;
        const list = [];
        for (const fee of fees) {
            if (fee.serviceType && fee.serviceType !== order.serviceType)
                continue;
            let apply = true;
            if (fee.condition) {
                const condition = fee.condition;
                for (const [key, val] of Object.entries(condition)) {
                    const orderVal = order[key];
                    if (typeof val === 'object') {
                        if (val.gte !== undefined && orderVal < val.gte)
                            apply = false;
                        if (val.lte !== undefined && orderVal > val.lte)
                            apply = false;
                    }
                    else if (orderVal !== val)
                        apply = false;
                }
            }
            if (!apply)
                continue;
            let amount = 0;
            switch (fee.feeType) {
                case 'PERCENTAGE':
                    amount = (basePrice * fee.amount) / 100;
                    break;
                case 'PER_KG':
                    amount = fee.amount * weight;
                    break;
                case 'PER_KM':
                    amount = fee.amount * distance;
                    break;
                default:
                    amount = fee.amount;
            }
            total += amount;
            list.push({ name: fee.name, amount });
        }
        return [total, list];
    }
    calculateAirportFees(fees, order, weight) {
        let total = 0;
        const list = [];
        for (const fee of fees) {
            if (!fee.serviceType || fee.serviceType === order.serviceType) {
                const amount = (fee.perKgRate ?? 0) * weight + (fee.flatFee ?? 0);
                total += amount;
                list.push({ airportCode: fee.airportCode, amount });
            }
        }
        return [total, list];
    }
    calculateSurcharges(fees, order, basePrice, miscTotal, airportTotal) {
        let total = 0;
        const list = [];
        for (const s of fees) {
            if (!s.isActive)
                continue;
            if (s.serviceType && s.serviceType !== order.serviceType)
                continue;
            const subtotal = basePrice + miscTotal + airportTotal;
            const amount = s.type === 'percentage' ? (subtotal * s.value) / 100 : s.value;
            total += amount;
            list.push({ name: s.name, amount });
        }
        return [total, list];
    }
    async calculateDiscounts(tariffId, categoryId, basePrice, miscTotal, airportTotal, surchargeTotal) {
        const discounts = await this.pricingRepo.getDiscountRules(tariffId, categoryId);
        let total = 0;
        const list = [];
        for (const d of discounts) {
            if (!d.isActive)
                continue;
            const subtotal = basePrice + miscTotal + airportTotal + surchargeTotal;
            const amount = d.type === 'percentage' ? (subtotal * d.value) / 100 : d.value;
            total += amount;
            list.push({ name: d.name, amount: -amount });
        }
        return [total, list];
    }
    calculateProfitMargins(fees, order, basePrice, miscTotal, airportTotal, surchargeTotal, discountTotal) {
        let total = 0;
        const list = [];
        for (const pm of fees) {
            if (pm.serviceType && pm.serviceType !== order.serviceType)
                continue;
            const subtotal = basePrice + miscTotal + airportTotal + surchargeTotal - discountTotal;
            let value = subtotal * (pm.percentage / 100);
            if (pm.minAmount && value < pm.minAmount)
                value = pm.minAmount;
            if (pm.maxAmount && value > pm.maxAmount)
                value = pm.maxAmount;
            total += value;
            list.push({ percentage: pm.percentage, amount: value });
        }
        return [total, list];
    }
};
exports.PricingUseCasesImpl = PricingUseCasesImpl;
exports.PricingUseCasesImpl = PricingUseCasesImpl = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [pricing_repository_1.PricingRepository,
        app_logger_service_1.AppLogger])
], PricingUseCasesImpl);
//# sourceMappingURL=pricing.usecase.impl.js.map