import { FeeType, ServiceType, ShippingScope } from '@prisma/client';
export declare class TariffDto {
    name: string;
    serviceType: ServiceType;
    shippingScope: ShippingScope;
    baseFee: number;
    customerCategoryId: string;
    perKgRate?: number;
    perKmRate?: number;
    currency: string;
    effectiveFrom: string;
    effectiveTo?: string;
}
export declare class UpdateTariffDto {
    name: string;
    serviceType: ServiceType;
    shippingScope: ShippingScope;
    baseFee: number;
    customerCategoryId: string;
    perKgRate?: number;
    perKmRate?: number;
    currency: string;
    effectiveFrom: string;
    effectiveTo?: string;
}
export declare class SurchargeDto {
    name: string;
    serviceType: ServiceType;
    shippingScope: ShippingScope;
    type: string;
    description?: string;
    value: number;
    tariffId: string;
}
export declare class UpdateSurchargeDto {
    name: string;
    type: string;
    serviceType: ServiceType;
    shippingScope: ShippingScope;
    description?: string;
    value: number;
}
export declare class DiscountDto {
    name: string;
    type: string;
    description?: string;
    value: number;
    tariffId: string;
    serviceType?: ServiceType;
    shippingScope?: ShippingScope;
    customerCategoryId?: string;
    validFrom: string;
    validTo?: string;
}
export declare class UpdateDiscountDto {
    name: string;
    type: string;
    description?: string;
    value: number;
    serviceType?: ServiceType;
    shippingScope?: ShippingScope;
    customerCategoryId?: string;
    validFrom: string;
    validTo?: string;
}
export declare class CustomerCategoryDto {
    name: string;
    description: string;
}
export declare class UpdateCustomerCategoryDto {
    name: string;
    description: string;
}
export declare class ProfitMarginDto {
    tariffId: string;
    serviceType: ServiceType;
    shippingScope: ShippingScope;
    percentage: number;
    minAmount?: number;
    maxAmount?: number;
}
export declare class UpdateProfitMarginDto {
    percentage?: number;
    minAmount?: number;
    maxAmount?: number;
}
export declare class AirportFeeDto {
    tariffId: string;
    serviceType?: ServiceType;
    shippingScope: ShippingScope;
    airportCode: string;
    perKgRate?: number;
    flatFee?: number;
    effectiveFrom: string;
    effectiveTo?: string;
}
export declare class UpdateAirportFeeDto {
    airportCode: string;
    serviceType: ServiceType;
    perKgRate?: number;
    flatFee?: number;
    effectiveFrom: string;
    effectiveTo?: string;
}
export declare class MiscellaneousFeeDto {
    name: string;
    amount: number;
    serviceType: ServiceType;
    shippingScope: ShippingScope;
    description: string;
    tariffId: string;
    isPercentage: boolean;
    feeType: FeeType;
    currency: string;
    effectiveFrom: string;
    effectiveTo?: string;
}
export declare class UpdateMiscellaneousFeeDto {
    name: string;
    amount: number;
    serviceType: ServiceType;
    shippingScope: ShippingScope;
    description: string;
    isPercentage: boolean;
    feeType: FeeType;
    currency: string;
    effectiveFrom: string;
    effectiveTo?: string;
}
export declare class PriceCalculationLogDto {
    customerId?: string;
    orderId: string;
}
