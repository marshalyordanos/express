import { PricingUseCasesImpl } from './pricing.usecase.impl';
import { AirportFeeDto, CustomerCategoryDto, DiscountDto, MiscellaneousFeeDto, PriceCalculationLogDto, ProfitMarginDto, SurchargeDto, TariffDto, UpdateAirportFeeDto, UpdateCustomerCategoryDto, UpdateDiscountDto, UpdateMiscellaneousFeeDto, UpdateProfitMarginDto, UpdateSurchargeDto, UpdateTariffDto } from './pricing.entity';
import { IResponse } from '../../common/types';
import { ListQueryDto } from '../../common/query/query.dto';
export declare class PricingMessageController {
    private readonly usecases;
    constructor(usecases: PricingUseCasesImpl);
    createTariff(payload: {
        data: TariffDto;
    }): Promise<IResponse<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        customerCategoryId: string | null;
        createdBy: string | null;
        serviceType: import(".prisma/client").$Enums.ServiceType;
        shippingScope: import(".prisma/client").$Enums.ShippingScope | null;
        currency: string;
        baseFee: number;
        perKmRate: number;
        perKgRate: number;
        effectiveFrom: Date;
        effectiveTo: Date | null;
    }>>;
    updateTariff(payload: {
        id: string;
        data: UpdateTariffDto;
    }): Promise<IResponse<any>>;
    getTariff(payload: {
        query: ListQueryDto;
    }): Promise<IResponse<any>>;
    getTariffById(payload: {
        id: string;
    }): Promise<IResponse<any>>;
    deleteTariff(payload: {
        id: string;
    }): Promise<IResponse<any>>;
    createProfitMargin(payload: {
        data: ProfitMarginDto;
    }): Promise<IResponse<{
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
    }>>;
    getProfitMargin(payload: {
        query: ListQueryDto;
    }): Promise<IResponse<{
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
    }>>;
    updateProfitMargin(payload: {
        id: string;
        data: UpdateProfitMarginDto;
    }): Promise<IResponse<{
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
    }>>;
    getProfitMarginById(payload: {
        id: string;
    }): Promise<IResponse<{
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
            currency: string;
            baseFee: number;
            perKmRate: number;
            perKgRate: number;
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
    }>>;
    deleteProfitMargin(payload: {
        id: string;
    }): Promise<IResponse<{
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
    }>>;
    createAirportFee(payload: {
        data: AirportFeeDto;
    }): Promise<IResponse<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        serviceType: import(".prisma/client").$Enums.ServiceType | null;
        shippingScope: import(".prisma/client").$Enums.ShippingScope | null;
        tariffId: string;
        perKgRate: number | null;
        effectiveFrom: Date;
        effectiveTo: Date | null;
        airportCode: string;
        flatFee: number | null;
    }>>;
    getAirportFee(payload: {
        query: ListQueryDto;
    }): Promise<IResponse<{
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
                currency: string;
                baseFee: number;
                perKmRate: number;
                perKgRate: number;
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
            perKgRate: number | null;
            effectiveFrom: Date;
            effectiveTo: Date | null;
            airportCode: string;
            flatFee: number | null;
        })[];
        pagination: {
            total: number;
            page: number;
            pageSize: number;
            totalPages: number;
        };
    }>>;
    updateAirportFee(payload: {
        id: string;
        data: UpdateAirportFeeDto;
    }): Promise<IResponse<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        serviceType: import(".prisma/client").$Enums.ServiceType | null;
        shippingScope: import(".prisma/client").$Enums.ShippingScope | null;
        tariffId: string;
        perKgRate: number | null;
        effectiveFrom: Date;
        effectiveTo: Date | null;
        airportCode: string;
        flatFee: number | null;
    }>>;
    getAirportFeeById(payload: {
        id: string;
    }): Promise<IResponse<{
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
            currency: string;
            baseFee: number;
            perKmRate: number;
            perKgRate: number;
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
        perKgRate: number | null;
        effectiveFrom: Date;
        effectiveTo: Date | null;
        airportCode: string;
        flatFee: number | null;
    }>>;
    deleteAirportFee(payload: {
        id: string;
    }): Promise<IResponse<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        serviceType: import(".prisma/client").$Enums.ServiceType | null;
        shippingScope: import(".prisma/client").$Enums.ShippingScope | null;
        tariffId: string;
        perKgRate: number | null;
        effectiveFrom: Date;
        effectiveTo: Date | null;
        airportCode: string;
        flatFee: number | null;
    }>>;
    createMiscFee(payload: {
        data: MiscellaneousFeeDto;
    }): Promise<IResponse<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        description: string | null;
        serviceType: import(".prisma/client").$Enums.ServiceType | null;
        shippingScope: import(".prisma/client").$Enums.ShippingScope | null;
        tariffId: string;
        currency: string | null;
        amount: number;
        effectiveFrom: Date | null;
        effectiveTo: Date | null;
        isPercentage: boolean;
        feeType: import(".prisma/client").$Enums.FeeType | null;
        condition: import("@prisma/client/runtime/library").JsonValue | null;
    }>>;
    getMiscFee(payload: {
        query: ListQueryDto;
    }): Promise<IResponse<{
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
                currency: string;
                baseFee: number;
                perKmRate: number;
                perKgRate: number;
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
            tariffId: string;
            currency: string | null;
            amount: number;
            effectiveFrom: Date | null;
            effectiveTo: Date | null;
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
    }>>;
    updateMiscFee(payload: {
        id: string;
        data: UpdateMiscellaneousFeeDto;
    }): Promise<IResponse<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        description: string | null;
        serviceType: import(".prisma/client").$Enums.ServiceType | null;
        shippingScope: import(".prisma/client").$Enums.ShippingScope | null;
        tariffId: string;
        currency: string | null;
        amount: number;
        effectiveFrom: Date | null;
        effectiveTo: Date | null;
        isPercentage: boolean;
        feeType: import(".prisma/client").$Enums.FeeType | null;
        condition: import("@prisma/client/runtime/library").JsonValue | null;
    }>>;
    getMiscFeeById(payload: {
        id: string;
    }): Promise<IResponse<{
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
            currency: string;
            baseFee: number;
            perKmRate: number;
            perKgRate: number;
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
        tariffId: string;
        currency: string | null;
        amount: number;
        effectiveFrom: Date | null;
        effectiveTo: Date | null;
        isPercentage: boolean;
        feeType: import(".prisma/client").$Enums.FeeType | null;
        condition: import("@prisma/client/runtime/library").JsonValue | null;
    }>>;
    deleteMiscFee(payload: {
        id: string;
    }): Promise<IResponse<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        description: string | null;
        serviceType: import(".prisma/client").$Enums.ServiceType | null;
        shippingScope: import(".prisma/client").$Enums.ShippingScope | null;
        tariffId: string;
        currency: string | null;
        amount: number;
        effectiveFrom: Date | null;
        effectiveTo: Date | null;
        isPercentage: boolean;
        feeType: import(".prisma/client").$Enums.FeeType | null;
        condition: import("@prisma/client/runtime/library").JsonValue | null;
    }>>;
    createSurcharge(payload: {
        data: SurchargeDto;
    }): Promise<IResponse<{
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
    }>>;
    getSurcharge(payload: {
        query: ListQueryDto;
    }): Promise<IResponse<{
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
                currency: string;
                baseFee: number;
                perKmRate: number;
                perKgRate: number;
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
    }>>;
    updateSurcharge(payload: {
        id: string;
        data: UpdateSurchargeDto;
    }): Promise<IResponse<{
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
    }>>;
    deleteSurcharge(payload: {
        id: string;
    }): Promise<IResponse<{
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
    }>>;
    getSurchargeById(payload: {
        id: string;
    }): Promise<IResponse<{
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
    }>>;
    createDiscount(payload: {
        data: DiscountDto;
    }): Promise<IResponse<{
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
            currency: string;
            baseFee: number;
            perKmRate: number;
            perKgRate: number;
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
    }>>;
    getDiscount(payload: {
        query: ListQueryDto;
    }): Promise<IResponse<{
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
                currency: string;
                baseFee: number;
                perKmRate: number;
                perKgRate: number;
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
    }>>;
    updateDiscount(payload: {
        id: string;
        data: UpdateDiscountDto;
    }): Promise<IResponse<{
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
            currency: string;
            baseFee: number;
            perKmRate: number;
            perKgRate: number;
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
    }>>;
    deleteDiscount(payload: {
        id: string;
    }): Promise<IResponse<{
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
    }>>;
    getDiscountById(payload: {
        id: string;
    }): Promise<IResponse<{
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
            currency: string;
            baseFee: number;
            perKmRate: number;
            perKgRate: number;
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
    }>>;
    createCustomerCategory(payload: {
        data: CustomerCategoryDto;
    }): Promise<IResponse<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        description: string | null;
    }>>;
    getCustomerCategory(payload: {
        query: ListQueryDto;
    }): Promise<IResponse<{
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
    }>>;
    updateCustomerCategory(payload: {
        id: string;
        data: UpdateCustomerCategoryDto;
    }): Promise<IResponse<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        description: string | null;
    }>>;
    deleteCustomerCategory(payload: {
        id: string;
    }): Promise<IResponse<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        description: string | null;
    }>>;
    getCustomerCategoryById(payload: {
        id: string;
    }): Promise<IResponse<{
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
    }>>;
    getPriceCalculationLog(payload: {
        query: ListQueryDto;
    }): Promise<IResponse<any>>;
    calculatePrice(payload: {
        data: PriceCalculationLogDto;
    }): Promise<IResponse<{
        result: any;
        error: string;
    } | {
        result: {
            finalPrice: number;
            currency: string;
            breakdown: any;
        };
        error: any;
    }>>;
}
