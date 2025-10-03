import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsDateString,
  IsPositive,
  IsOptional,
  IsEnum,
  ValidateIf,
  IsBoolean,
} from 'class-validator';
import {
  ServiceType,
  FulfillmentType,
  ShipmentType,
  ShippingScope,
  ParcelCategory,
  OrderStatus,
} from '@prisma/client';
import { PartialType } from '@nestjs/mapped-types';

export class CreateOrderDto {
  // Customer info
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  customerId?: string;

  // Order assignment info
  @IsString()
  @IsOptional()
  branchId?: string;

  @IsString()
  @IsOptional()
  driverId?: string;

  @IsEnum(ServiceType)
  @IsOptional()
  serviceType: ServiceType;

  @IsEnum(FulfillmentType)
  @IsOptional()
  fulfillmentType: FulfillmentType;

  @IsString()
  @IsOptional()
  trackingCode: string;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  weight: number;

  @IsEnum(ParcelCategory)
  @IsOptional()
  category?: ParcelCategory;

  @IsBoolean()
  @IsOptional()
  isFragile?: boolean;

  @IsEnum(ShipmentType)
  @IsOptional()
  shipmentType?: ShipmentType;

  @IsEnum(ShippingScope)
  @IsOptional()
  shippingScope?: ShippingScope;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @IsPositive()
  length?: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @IsPositive()
  width?: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @IsPositive()
  height?: number;

  // Pickup info — required if fulfillmentType is PICKUP
  @ValidateIf((o) => o.fulfillmentType === FulfillmentType.PICKUP)
  @IsString()
  @IsNotEmpty()
  pickupAddress?: string;

  @ValidateIf((o) => o.fulfillmentType === FulfillmentType.PICKUP)
  @IsDateString()
  @IsOptional()
  pickupDate?: string;

  // Delivery info — always required
  @IsString()
  @IsNotEmpty()
  deliveryAddress: string;

  @IsDateString()
  @IsOptional()
  deliveryDate?: string;

  // Payment info
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  cost?: number;

  @IsString()
  @IsOptional()
  paymentId?: string;

  // Dynamic / internal flags
  @IsBoolean()
  @IsOptional()
  isUnusual?: boolean; // system can set based on rules

  @IsString()
  @IsOptional()
  unusualReason?: string; // explanation if flagged as unusual
}

export class UpdateOrderDto {
  // Customer info
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  customerId?: string;

  // Order assignment info
  // @IsString()
  // @IsOptional()
  // branchId?: string;

  // @IsString()
  // @IsOptional()
  // driverId?: string;

  @IsEnum(OrderStatus)
  @IsOptional()
  status: OrderStatus;

  @IsEnum(ServiceType)
  @IsOptional()
  serviceType: ServiceType;

  @IsEnum(FulfillmentType)
  @IsOptional()
  fulfillmentType: FulfillmentType;

  // @IsString()
  // @IsOptional()
  // trackingCode: string;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  weight: number;

  @IsEnum(ParcelCategory)
  @IsOptional()
  category?: ParcelCategory;

  @IsBoolean()
  @IsOptional()
  isFragile?: boolean;

  @IsEnum(ShipmentType)
  @IsOptional()
  shipmentType?: ShipmentType;

  @IsEnum(ShippingScope)
  @IsOptional()
  shippingScope?: ShippingScope;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @IsPositive()
  length?: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @IsPositive()
  width?: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @IsPositive()
  height?: number;

  // Pickup info — required if fulfillmentType is PICKUP
  @ValidateIf((o) => o.fulfillmentType === FulfillmentType.PICKUP)
  @IsString()
  @IsNotEmpty()
  pickupAddress?: string;

  @ValidateIf((o) => o.fulfillmentType === FulfillmentType.PICKUP)
  @IsDateString()
  @IsOptional()
  pickupDate?: string;

  // Delivery info — always required
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  deliveryAddress: string;

  @IsDateString()
  @IsOptional()
  deliveryDate?: string;

  // Payment info
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  cost?: number;

  // @IsString()
  // @IsOptional()
  // paymentId?: string;

  // Dynamic / internal flags
  @IsBoolean()
  @IsOptional()
  isUnusual?: boolean; // system can set based on rules

  @IsString()
  @IsOptional()
  unusualReason?: string; // explanation if flagged as unusual
}

export class AcceptDropOffDto {
  @IsString()
  @IsNotEmpty()
  tackingCode: string;
}

export class ValidateOrderDto extends PartialType(CreateOrderDto) {
  // @IsString()
  // @IsNotEmpty()
  // orderId: string; // always required

  @IsString()
  @IsNotEmpty()
  validatedBy: string; // officer doing the validation

  @IsString()
  @IsOptional()
  validatedNotes?: string;
}

export class AddException {
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsString()
  @IsNotEmpty()
  type: string;
}

export class CancelOrderDto {
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @IsString()
  @IsNotEmpty()
  reason: string;
}
