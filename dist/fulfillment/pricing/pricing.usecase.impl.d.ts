import { PricingRepository } from './pricing.repository';
import { PricingUseCases } from './pricing.usecase';
import { AirportFeeDto, CustomerCategoryDto, DiscountDto, MiscellaneousFeeDto, ProfitMarginDto, SurchargeDto, TariffDto, UpdateAirportFeeDto, UpdateCustomerCategoryDto, UpdateDiscountDto, UpdateMiscellaneousFeeDto, UpdateProfitMarginDto, UpdateSurchargeDto, UpdateTariffDto } from './pricing.entity';
import { ListQueryDto } from '../../common/query/query.dto';
import { AppLogger } from '../../common/app-logger.service';
export declare class PricingUseCasesImpl implements PricingUseCases {
    private readonly pricingRepo;
    private readonly logger;
    constructor(pricingRepo: PricingRepository, logger: AppLogger);
    createTariff(data: TariffDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        customerCategoryId: string | null;
        createdBy: string | null;
        serviceType: import(".prisma/client").$Enums.ServiceType;
        shippingScope: import(".prisma/client").$Enums.ShippingScope | null;
        baseFee: number;
        perKgRate: number;
        perKmRate: number;
        currency: string;
        effectiveFrom: Date;
        effectiveTo: Date | null;
    }>;
    findAllTariff(query: ListQueryDto): Promise<any>;
    findTariffById(id: string): Promise<any>;
    updateTariff(id: string, data: Partial<UpdateTariffDto>): Promise<any>;
    deleteTariff(id: string): Promise<any>;
    createProfitMargin(data: ProfitMarginDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        serviceType: import(".prisma/client").$Enums.ServiceType | null;
        shippingScope: import(".prisma/client").$Enums.ShippingScope | null;
        tariffId: string;
        percentage: number;
        minAmount: number | null;
        maxAmount: number | null;
    }>;
    findAllProfitMargins(query: ListQueryDto): Promise<{
        profitMargins: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tariff: {
                name: string;
                id: string;
            };
            serviceType: import(".prisma/client").$Enums.ServiceType;
            shippingScope: import(".prisma/client").$Enums.ShippingScope;
            percentage: number;
            minAmount: number;
            maxAmount: number;
        }[];
        pagination: {
            total: number;
            page: number;
            pageSize: number;
            totalPages: number;
        };
    }>;
    findProfitMarginById(id: string): Promise<{
        tariff: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            customerCategoryId: string | null;
            createdBy: string | null;
            serviceType: import(".prisma/client").$Enums.ServiceType;
            shippingScope: import(".prisma/client").$Enums.ShippingScope | null;
            baseFee: number;
            perKgRate: number;
            perKmRate: number;
            currency: string;
            effectiveFrom: Date;
            effectiveTo: Date | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        serviceType: import(".prisma/client").$Enums.ServiceType | null;
        shippingScope: import(".prisma/client").$Enums.ShippingScope | null;
        tariffId: string;
        percentage: number;
        minAmount: number | null;
        maxAmount: number | null;
    }>;
    updateProfitMargin(id: string, data: UpdateProfitMarginDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        serviceType: import(".prisma/client").$Enums.ServiceType | null;
        shippingScope: import(".prisma/client").$Enums.ShippingScope | null;
        tariffId: string;
        percentage: number;
        minAmount: number | null;
        maxAmount: number | null;
    }>;
    deleteProfitMargin(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        serviceType: import(".prisma/client").$Enums.ServiceType | null;
        shippingScope: import(".prisma/client").$Enums.ShippingScope | null;
        tariffId: string;
        percentage: number;
        minAmount: number | null;
        maxAmount: number | null;
    }>;
    createAirportFee(data: AirportFeeDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        serviceType: import(".prisma/client").$Enums.ServiceType | null;
        shippingScope: import(".prisma/client").$Enums.ShippingScope | null;
        perKgRate: number | null;
        effectiveFrom: Date;
        effectiveTo: Date | null;
        tariffId: string;
        airportCode: string;
        flatFee: number | null;
    }>;
    findAllAirportFees(query: ListQueryDto): Promise<{
        airportFees: ({
            tariff: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                isActive: boolean;
                customerCategoryId: string | null;
                createdBy: string | null;
                serviceType: import(".prisma/client").$Enums.ServiceType;
                shippingScope: import(".prisma/client").$Enums.ShippingScope | null;
                baseFee: number;
                perKgRate: number;
                perKmRate: number;
                currency: string;
                effectiveFrom: Date;
                effectiveTo: Date | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            serviceType: import(".prisma/client").$Enums.ServiceType | null;
            shippingScope: import(".prisma/client").$Enums.ShippingScope | null;
            perKgRate: number | null;
            effectiveFrom: Date;
            effectiveTo: Date | null;
            tariffId: string;
            airportCode: string;
            flatFee: number | null;
        })[];
        pagination: {
            total: number;
            page: number;
            pageSize: number;
            totalPages: number;
        };
    }>;
    findAirportFeeById(id: string): Promise<{
        tariff: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            customerCategoryId: string | null;
            createdBy: string | null;
            serviceType: import(".prisma/client").$Enums.ServiceType;
            shippingScope: import(".prisma/client").$Enums.ShippingScope | null;
            baseFee: number;
            perKgRate: number;
            perKmRate: number;
            currency: string;
            effectiveFrom: Date;
            effectiveTo: Date | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        serviceType: import(".prisma/client").$Enums.ServiceType | null;
        shippingScope: import(".prisma/client").$Enums.ShippingScope | null;
        perKgRate: number | null;
        effectiveFrom: Date;
        effectiveTo: Date | null;
        tariffId: string;
        airportCode: string;
        flatFee: number | null;
    }>;
    updateAirportFee(id: string, data: Partial<UpdateAirportFeeDto>): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        serviceType: import(".prisma/client").$Enums.ServiceType | null;
        shippingScope: import(".prisma/client").$Enums.ShippingScope | null;
        perKgRate: number | null;
        effectiveFrom: Date;
        effectiveTo: Date | null;
        tariffId: string;
        airportCode: string;
        flatFee: number | null;
    }>;
    deleteAirportFee(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        serviceType: import(".prisma/client").$Enums.ServiceType | null;
        shippingScope: import(".prisma/client").$Enums.ShippingScope | null;
        perKgRate: number | null;
        effectiveFrom: Date;
        effectiveTo: Date | null;
        tariffId: string;
        airportCode: string;
        flatFee: number | null;
    }>;
    createMiscFee(data: MiscellaneousFeeDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        description: string | null;
        serviceType: import(".prisma/client").$Enums.ServiceType | null;
        shippingScope: import(".prisma/client").$Enums.ShippingScope | null;
        currency: string | null;
        effectiveFrom: Date | null;
        effectiveTo: Date | null;
        tariffId: string;
        amount: number;
        isPercentage: boolean;
        feeType: import(".prisma/client").$Enums.FeeType | null;
        condition: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    findAllMiscFees(query: ListQueryDto): Promise<{
        miscFees: ({
            tariff: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                isActive: boolean;
                customerCategoryId: string | null;
                createdBy: string | null;
                serviceType: import(".prisma/client").$Enums.ServiceType;
                shippingScope: import(".prisma/client").$Enums.ShippingScope | null;
                baseFee: number;
                perKgRate: number;
                perKmRate: number;
                currency: string;
                effectiveFrom: Date;
                effectiveTo: Date | null;
            };
        } & {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            description: string | null;
            serviceType: import(".prisma/client").$Enums.ServiceType | null;
            shippingScope: import(".prisma/client").$Enums.ShippingScope | null;
            currency: string | null;
            effectiveFrom: Date | null;
            effectiveTo: Date | null;
            tariffId: string;
            amount: number;
            isPercentage: boolean;
            feeType: import(".prisma/client").$Enums.FeeType | null;
            condition: import("@prisma/client/runtime/library").JsonValue | null;
        })[];
        pagination: {
            total: number;
            page: number;
            pageSize: number;
            totalPages: number;
        };
    }>;
    findMiscFeeById(id: string): Promise<{
        tariff: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            customerCategoryId: string | null;
            createdBy: string | null;
            serviceType: import(".prisma/client").$Enums.ServiceType;
            shippingScope: import(".prisma/client").$Enums.ShippingScope | null;
            baseFee: number;
            perKgRate: number;
            perKmRate: number;
            currency: string;
            effectiveFrom: Date;
            effectiveTo: Date | null;
        };
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        description: string | null;
        serviceType: import(".prisma/client").$Enums.ServiceType | null;
        shippingScope: import(".prisma/client").$Enums.ShippingScope | null;
        currency: string | null;
        effectiveFrom: Date | null;
        effectiveTo: Date | null;
        tariffId: string;
        amount: number;
        isPercentage: boolean;
        feeType: import(".prisma/client").$Enums.FeeType | null;
        condition: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    updateMiscFee(id: string, data: Partial<UpdateMiscellaneousFeeDto>): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        description: string | null;
        serviceType: import(".prisma/client").$Enums.ServiceType | null;
        shippingScope: import(".prisma/client").$Enums.ShippingScope | null;
        currency: string | null;
        effectiveFrom: Date | null;
        effectiveTo: Date | null;
        tariffId: string;
        amount: number;
        isPercentage: boolean;
        feeType: import(".prisma/client").$Enums.FeeType | null;
        condition: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    deleteMiscFee(id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        description: string | null;
        serviceType: import(".prisma/client").$Enums.ServiceType | null;
        shippingScope: import(".prisma/client").$Enums.ShippingScope | null;
        currency: string | null;
        effectiveFrom: Date | null;
        effectiveTo: Date | null;
        tariffId: string;
        amount: number;
        isPercentage: boolean;
        feeType: import(".prisma/client").$Enums.FeeType | null;
        condition: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    createSurcharge(data: SurchargeDto): Promise<{
        name: string;
        value: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        createdBy: string | null;
        description: string | null;
        type: string;
        serviceType: import(".prisma/client").$Enums.ServiceType | null;
        shippingScope: import(".prisma/client").$Enums.ShippingScope | null;
        tariffId: string;
    }>;
    updateSurcharge(id: string, data: Partial<UpdateSurchargeDto>): Promise<{
        name: string;
        value: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        createdBy: string | null;
        description: string | null;
        type: string;
        serviceType: import(".prisma/client").$Enums.ServiceType | null;
        shippingScope: import(".prisma/client").$Enums.ShippingScope | null;
        tariffId: string;
    }>;
    findAllSurcharge(query: ListQueryDto): Promise<{
        surcharges: ({
            tariff: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                isActive: boolean;
                customerCategoryId: string | null;
                createdBy: string | null;
                serviceType: import(".prisma/client").$Enums.ServiceType;
                shippingScope: import(".prisma/client").$Enums.ShippingScope | null;
                baseFee: number;
                perKgRate: number;
                perKmRate: number;
                currency: string;
                effectiveFrom: Date;
                effectiveTo: Date | null;
            };
        } & {
            name: string;
            value: number;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            createdBy: string | null;
            description: string | null;
            type: string;
            serviceType: import(".prisma/client").$Enums.ServiceType | null;
            shippingScope: import(".prisma/client").$Enums.ShippingScope | null;
            tariffId: string;
        })[];
        pagination: {
            total: number;
            page: number;
            pageSize: number;
            totalPages: number;
        };
    }>;
    findSurchargeById(id: string): Promise<{
        name: string;
        value: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        createdBy: string | null;
        description: string | null;
        type: string;
        serviceType: import(".prisma/client").$Enums.ServiceType | null;
        shippingScope: import(".prisma/client").$Enums.ShippingScope | null;
        tariffId: string;
    }>;
    deleteSurcharge(id: string): Promise<{
        name: string;
        value: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        createdBy: string | null;
        description: string | null;
        type: string;
        serviceType: import(".prisma/client").$Enums.ServiceType | null;
        shippingScope: import(".prisma/client").$Enums.ShippingScope | null;
        tariffId: string;
    }>;
    createDiscount(data: DiscountDto): Promise<{
        tariff: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            customerCategoryId: string | null;
            createdBy: string | null;
            serviceType: import(".prisma/client").$Enums.ServiceType;
            shippingScope: import(".prisma/client").$Enums.ShippingScope | null;
            baseFee: number;
            perKgRate: number;
            perKmRate: number;
            currency: string;
            effectiveFrom: Date;
            effectiveTo: Date | null;
        };
        customerCategory: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            description: string | null;
        };
    } & {
        name: string;
        value: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        customerCategoryId: string | null;
        createdBy: string | null;
        description: string | null;
        type: string;
        serviceType: import(".prisma/client").$Enums.ServiceType | null;
        shippingScope: import(".prisma/client").$Enums.ShippingScope | null;
        tariffId: string;
        validFrom: Date;
        validTo: Date | null;
    }>;
    updateDiscount(id: string, data: Partial<UpdateDiscountDto>): Promise<{
        tariff: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            customerCategoryId: string | null;
            createdBy: string | null;
            serviceType: import(".prisma/client").$Enums.ServiceType;
            shippingScope: import(".prisma/client").$Enums.ShippingScope | null;
            baseFee: number;
            perKgRate: number;
            perKmRate: number;
            currency: string;
            effectiveFrom: Date;
            effectiveTo: Date | null;
        };
        customerCategory: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            description: string | null;
        };
    } & {
        name: string;
        value: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        customerCategoryId: string | null;
        createdBy: string | null;
        description: string | null;
        type: string;
        serviceType: import(".prisma/client").$Enums.ServiceType | null;
        shippingScope: import(".prisma/client").$Enums.ShippingScope | null;
        tariffId: string;
        validFrom: Date;
        validTo: Date | null;
    }>;
    findAllDiscount(query: ListQueryDto): Promise<{
        discounts: ({
            tariff: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                isActive: boolean;
                customerCategoryId: string | null;
                createdBy: string | null;
                serviceType: import(".prisma/client").$Enums.ServiceType;
                shippingScope: import(".prisma/client").$Enums.ShippingScope | null;
                baseFee: number;
                perKgRate: number;
                perKmRate: number;
                currency: string;
                effectiveFrom: Date;
                effectiveTo: Date | null;
            };
            customerCategory: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                createdBy: string | null;
                description: string | null;
            };
        } & {
            name: string;
            value: number;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            customerCategoryId: string | null;
            createdBy: string | null;
            description: string | null;
            type: string;
            serviceType: import(".prisma/client").$Enums.ServiceType | null;
            shippingScope: import(".prisma/client").$Enums.ShippingScope | null;
            tariffId: string;
            validFrom: Date;
            validTo: Date | null;
        })[];
        pagination: {
            total: number;
            page: number;
            pageSize: number;
            totalPages: number;
        };
    }>;
    findDiscountById(id: string): Promise<{
        tariff: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            customerCategoryId: string | null;
            createdBy: string | null;
            serviceType: import(".prisma/client").$Enums.ServiceType;
            shippingScope: import(".prisma/client").$Enums.ShippingScope | null;
            baseFee: number;
            perKgRate: number;
            perKmRate: number;
            currency: string;
            effectiveFrom: Date;
            effectiveTo: Date | null;
        };
        customerCategory: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            description: string | null;
        };
    } & {
        name: string;
        value: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        customerCategoryId: string | null;
        createdBy: string | null;
        description: string | null;
        type: string;
        serviceType: import(".prisma/client").$Enums.ServiceType | null;
        shippingScope: import(".prisma/client").$Enums.ShippingScope | null;
        tariffId: string;
        validFrom: Date;
        validTo: Date | null;
    }>;
    deleteDiscount(id: string): Promise<{
        name: string;
        value: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        customerCategoryId: string | null;
        createdBy: string | null;
        description: string | null;
        type: string;
        serviceType: import(".prisma/client").$Enums.ServiceType | null;
        shippingScope: import(".prisma/client").$Enums.ShippingScope | null;
        tariffId: string;
        validFrom: Date;
        validTo: Date | null;
    }>;
    createCustomerCategory(data: CustomerCategoryDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        description: string | null;
    }>;
    findAllCustomerCategory(query: ListQueryDto): Promise<{
        customerCategories: ({
            discountRules: {
                name: string;
                value: number;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                isActive: boolean;
                customerCategoryId: string | null;
                createdBy: string | null;
                description: string | null;
                type: string;
                serviceType: import(".prisma/client").$Enums.ServiceType | null;
                shippingScope: import(".prisma/client").$Enums.ShippingScope | null;
                tariffId: string;
                validFrom: Date;
                validTo: Date | null;
            }[];
        } & {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            description: string | null;
        })[];
        pagination: {
            total: number;
            page: number;
            pageSize: number;
            totalPages: number;
        };
    }>;
    findCustomerCategoryById(id: string): Promise<{
        discountRules: {
            name: string;
            value: number;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            customerCategoryId: string | null;
            createdBy: string | null;
            description: string | null;
            type: string;
            serviceType: import(".prisma/client").$Enums.ServiceType | null;
            shippingScope: import(".prisma/client").$Enums.ShippingScope | null;
            tariffId: string;
            validFrom: Date;
            validTo: Date | null;
        }[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        description: string | null;
    }>;
    updateCustomerCategory(id: string, data: UpdateCustomerCategoryDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        description: string | null;
    }>;
    deleteCustomerCategory(id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        description: string | null;
    }>;
    createPriceCalculationLog(data: any): Promise<any>;
    findAllPriceCalculationLog(query: ListQueryDto): Promise<any>;
    findPriceCalculationLogById(id: string): Promise<any>;
    deletePriceCalculationLog(id: string): Promise<any>;
    calculatePrice(orderId: string, userId?: string): Promise<{
        result: any;
        error: string;
    } | {
        result: {
            finalPrice: number;
            currency: string;
            breakdown: any;
        };
        error: any;
    }>;
    private calculateMiscFees;
    private calculateAirportFees;
    private calculateSurcharges;
    private calculateDiscounts;
    private calculateProfitMargins;
}
