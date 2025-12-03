import {
  CommissionType,
  FeeType,
  ServiceType,
  ShippingScope,
  Vehicle,
  VehicleType,
} from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
//=============================================================================================TARIFF==============================================================================================
// export class TariffDto {
//   @IsNotEmpty()
//   @IsString()
//   name: string;

//   // serviceType is required for business rules
//   @IsNotEmpty()
//   @IsEnum(ServiceType)
//   serviceType: ServiceType;

//   @IsNotEmpty()
//   @IsEnum(ShippingScope)
//   shippingScope: ShippingScope;

//   @IsNotEmpty()
//   @IsNumber()
//   baseFee: number;

//   @IsOptional()
//   @IsString()
//   customerCategoryId: string;

//   @IsOptional()
//   @IsNumber()
//   perKgRate?: number;

//   @IsOptional()
//   @IsNumber()
//   perKmRate?: number;

//   @IsNotEmpty()
//   @IsString()
//   currency: string;

//   @IsNotEmpty()
//   @IsISO8601()
//   effectiveFrom: string;

//   @IsOptional()
//   @IsISO8601()
//   effectiveTo?: string;
// }

export class AirportFeeBracketDto {
  @IsNotEmpty()
  @IsNumber()
  minKg: number;

  @IsNotEmpty()
  @IsNumber()
  maxKg: number;

  @IsNotEmpty()
  @IsNumber()
  rate: number;

  @IsOptional()
  @IsString()
  id?: string;
}

export class ServiceTypeValueDto {
  @IsNotEmpty()
  @IsEnum(ServiceType)
  serviceType: ServiceType;

  @IsNotEmpty()
  @IsNumber()
  baseFee: number;

  @IsOptional()
  @IsString()
  id: string;
}

/* -------------------- WEIGHT BRACKET DTO -------------------- */

export class WeightBracketDto {
  @IsNotEmpty()
  @IsNumber()
  startKg: number;

  @IsNotEmpty()
  @IsNumber()
  endKg: number;

  @IsNotEmpty()
  @IsNumber()
  price: number; // birr for this weight range

  @IsOptional()
  @IsString()
  id: string;
}

/* -------------------- DRIVER COMMISSION DTO -------------------- */

export class DriverCommissionDto {
  @IsNotEmpty()
  @IsString()
  vehicleTypeId: string; // sedan, bajaj, minibus, motor, truck...

  @IsOptional()
  @IsNumber()
  fixed?: number; // fixed birr/ride

  @IsOptional()
  @IsNumber()
  perKm?: number; // birr per km

  @IsOptional()
  @IsNumber()
  percentage?: number; // commission percentage

  @IsOptional()
  @IsString()
  id: string;
}

/* -------------------- ADDITIONAL CHARGES DTO -------------------- */

export class AdditionalChargesDto {
  @IsOptional()
  @IsNumber()
  costPerKm?: number;

  @IsOptional()
  @IsNumber()
  profitMargin?: number; // %

  @IsOptional()
  @IsString()
  id: string;
}

/* -------------------- MAIN TARIFF DTO -------------------- */

export class AirportFeesDto {
  @IsOptional()
  @IsEnum(ServiceType)
  serviceType?: ServiceType; // user selects EXPRESS, STANDARD, etc.

  @IsOptional()
  @IsNumber()
  flatRatePerKg?: number; // example: 10 birr per kg (no brackets)

  @IsOptional()
  @IsString()
  serviceTypeId?: string; // example: 10 birr per kg (no brackets)

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AirportFeeBracketDto)
  brackets?: AirportFeeBracketDto[];

  @IsOptional()
  @IsString()
  id?: string;
}

/* -------------------- MAIN TARIFF DTO -------------------- */
export class TariffDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceTypeValueDto)
  serviceTypes: ServiceTypeValueDto[];

  @IsNotEmpty()
  @IsEnum(ShippingScope)
  shippingScope: ShippingScope;

  @IsOptional()
  @IsString()
  customerCategoryId?: string;

  @IsOptional()
  @IsString()
  currency: string = 'ETB';

  @IsOptional()
  @IsISO8601()
  effectiveFrom: string = new Date().toISOString();

  @IsOptional()
  @IsISO8601()
  effectiveTo?: string;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WeightBracketDto)
  weightBrackets?: WeightBracketDto[];

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DriverCommissionDto)
  driverCommissions?: DriverCommissionDto[];

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => AdditionalChargesDto)
  additionalCharges?: AdditionalChargesDto;

  // --- NEW ---
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AirportFeesDto)
  airportFees?: AirportFeesDto[];
}

export class UpdateTariffDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(ShippingScope)
  shippingScope?: ShippingScope;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsISO8601()
  effectiveFrom?: string;

  @IsOptional()
  @IsISO8601()
  effectiveTo?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceTypeValueDto)
  serviceTypes?: ServiceTypeValueDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WeightBracketDto)
  weightBrackets?: WeightBracketDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DriverCommissionDto)
  driverCommissions?: DriverCommissionDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => AdditionalChargesDto)
  additionalCharges?: AdditionalChargesDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AirportFeesDto)
  airportFees?: AirportFeesDto[];
}

//===============================================================================================SURCHARGE==================================================================
export class SurchargeDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  @IsEnum(ServiceType)
  serviceType: ServiceType;

  @IsNotEmpty()
  @IsString()
  @IsEnum(ShippingScope)
  shippingScope: ShippingScope;

  @IsNotEmpty()
  @IsString()
  type: string;

  @IsNotEmpty()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsNumber()
  value: number;

  @IsNotEmpty()
  @IsString()
  tariffId: string;
}

export class UpdateSurchargeDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  type: string;

  @IsOptional()
  @IsString()
  @IsEnum(ServiceType)
  serviceType: ServiceType;

  @IsOptional()
  @IsString()
  @IsEnum(ShippingScope)
  shippingScope: ShippingScope;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  value: number;
}
//================================================================================================DISCOUNT==================================================================
export class DiscountDto {
  @IsNotEmpty() @IsString() name: string;

  @IsNotEmpty() @IsString() type: string; // "percentage" or "fixed"

  @IsOptional() @IsString() description?: string;

  @IsNotEmpty() @IsNumber() value: number; // must be >= 0

  @IsNotEmpty() @IsString() tariffId: string;

  @IsOptional() @IsEnum(ServiceType) serviceType?: ServiceType;
  @IsOptional() @IsEnum(ShippingScope) shippingScope?: ShippingScope;

  @IsOptional() @IsString() customerCategoryId?: string;

  @IsNotEmpty() @IsDateString() validFrom: string;
  @IsOptional() @IsDateString() validTo?: string;
}

export class UpdateDiscountDto {
  @IsOptional() @IsString() name: string;
  @IsOptional() @IsString() type: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsNumber() value: number;
  @IsOptional() @IsEnum(ServiceType) serviceType?: ServiceType;
  @IsOptional() @IsEnum(ShippingScope) shippingScope?: ShippingScope;
  @IsOptional() @IsString() customerCategoryId?: string;
  @IsOptional() @IsDateString() validFrom: string;
  @IsOptional() @IsDateString() validTo?: string;
}
//====================================================================================CUSTOMER CATEGORY==================================================================
export class CustomerCategoryDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;
}

export class UpdateCustomerCategoryDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string;
}
//===================================================================================PROFIT MARGIN==================================================================
export class ProfitMarginDto {
  @IsNotEmpty()
  tariffId: string;

  @IsOptional()
  @IsString()
  @IsEnum(ServiceType)
  serviceType: ServiceType;

  @IsOptional()
  @IsString()
  @IsEnum(ShippingScope)
  shippingScope: ShippingScope;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  percentage: number; // e.g., 10% = 10

  @IsOptional()
  @IsNumber()
  @Min(0)
  minAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxAmount?: number;
}

export class UpdateProfitMarginDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  percentage?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxAmount?: number;
}
//===============================================================================================AIRPORT FEES==================================================================
export class AirportFeeDto {
  @IsNotEmpty()
  @IsString()
  tariffId: string; // must link to an existing Tariff

  @IsOptional()
  @IsEnum(ServiceType)
  serviceType?: ServiceType; // e.g. EXPRESS, CARGO

  @IsOptional()
  @IsString()
  @IsEnum(ShippingScope)
  shippingScope: ShippingScope;

  @IsNotEmpty()
  @IsString()
  airportCode: string; // e.g. "ADD", "DXB"

  @IsOptional()
  @IsNumber()
  perKgRate?: number;

  @IsOptional()
  @IsNumber()
  flatFee?: number;

  @IsNotEmpty()
  @IsDateString()
  effectiveFrom: string;

  @IsOptional()
  @IsDateString()
  effectiveTo?: string;
}

export class UpdateAirportFeeDto {
  @IsOptional()
  @IsString()
  airportCode: string;

  @IsOptional()
  @IsEnum(ServiceType)
  serviceType: ServiceType; // e.g. EXPRESS, CARGO

  @IsOptional()
  @IsNumber()
  perKgRate?: number;

  @IsOptional()
  @IsNumber()
  flatFee?: number;

  @IsOptional()
  @IsString()
  effectiveFrom: string;

  @IsOptional()
  @IsString()
  effectiveTo?: string;
}
//===============================================================================================MISCELLANEOUS FEES==================================================================
export class MiscellaneousFeeDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  @IsEnum(ServiceType)
  serviceType: ServiceType;

  @IsOptional()
  @IsString()
  @IsEnum(ShippingScope)
  shippingScope: ShippingScope;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  tariffId: string;

  @IsNotEmpty()
  @IsBoolean()
  isPercentage: boolean;

  @IsNotEmpty()
  @IsEnum(FeeType)
  feeType: FeeType;

  @IsNotEmpty()
  @IsString()
  currency: string;

  @IsNotEmpty()
  @IsDateString()
  effectiveFrom: string;

  @IsOptional()
  @IsDateString()
  effectiveTo?: string;
}

export class UpdateMiscellaneousFeeDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  @IsEnum(ServiceType)
  serviceType: ServiceType;

  @IsOptional()
  @IsString()
  @IsEnum(ShippingScope)
  shippingScope: ShippingScope;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsBoolean()
  isPercentage: boolean;

  @IsOptional()
  @IsEnum(FeeType)
  feeType: FeeType;

  @IsOptional()
  @IsString()
  currency: string;

  @IsOptional()
  @IsDateString()
  effectiveFrom: string;

  @IsOptional()
  @IsDateString()
  effectiveTo?: string;
}
//===================================================================================PRICE CALCULATION LOG==================================================================
export class PriceCalculationLogDto {
  @IsOptional()
  @IsString()
  customerId?: string;

  @IsNotEmpty()
  @IsString()
  orderId: string;
}
//===================================================================================CUSTOMER CATEGORY==================================================================

//===================================================================================DRIVER COMMISSION==================================================================

export class AddCommissionDto {
  @IsNotEmpty()
  @IsString()
  vehicleTypeId: string;

  @IsNotEmpty()
  @IsString()
  commissionType: CommissionType;

  @IsNotEmpty()
  @IsNumber()
  value: number;

  @IsOptional()
  @IsDateString()
  effectiveFrom: string;

  @IsOptional()
  @IsDateString()
  effectiveTo?: string;

  @IsOptional()
  @IsString()
  currency: string = 'ETB';
}

export class updateCommissionDto {
  @IsOptional()
  @IsString()
  vehicleTypeId: string;

  @IsOptional()
  @IsString()
  commissionType: CommissionType;

  @IsOptional()
  @IsNumber()
  value: number;

  @IsOptional()
  @IsDateString()
  effectiveFrom: string;

  @IsOptional()
  @IsDateString()
  effectiveTo?: string;

  @IsOptional()
  @IsString()
  currency: string = 'ETB';
}
