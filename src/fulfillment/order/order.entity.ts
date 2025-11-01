import { Type, Transform } from 'class-transformer';
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
  IsObject,
  IsEmail,
  IsLatitude,
  IsLongitude,
  ValidateNested,
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
import { escape } from 'lodash';

// Small sanitizer helper
const sanitize = (v: any) =>
  typeof v === 'string' ? escape(v.trim().replace(/\s+/g, ' ')) : v;

export class AddressDto {
  @IsString({ message: 'Label must be a string' })
  @IsOptional()
  @Transform(({ value }) => sanitize(value))
  label?: string;

  @IsString({ message: 'Address line must be a string' })
  @IsOptional()
  @Transform(({ value }) => sanitize(value))
  addressLine?: string;

  @IsString({ message: 'City must be a string' })
  @IsOptional()
  @Transform(({ value }) => sanitize(value))
  city?: string;

  @IsString({ message: 'State must be a string' })
  @IsOptional()
  @Transform(({ value }) => sanitize(value))
  state?: string;

  @IsString({ message: 'Country must be a string' })
  @IsOptional()
  @Transform(({ value }) => sanitize(value))
  country?: string;

  @IsString({ message: 'Postal code must be a string' })
  @IsOptional()
  @Transform(({ value }) => sanitize(value))
  postalCode?: string;

  @IsLatitude({ message: 'Latitude must be a valid number' })
  @IsNotEmpty({ message: 'Latitude is required' })
  lat: string;

  @IsLongitude({ message: 'Longitude must be a valid number' })
  @IsNotEmpty({ message: 'Longitude is required' })
  long: string;
}
export class CreateOrderDto {
  // Customer info
  @IsString({ message: 'Customer name must be a string' })
  @IsOptional()
  @Transform(({ value }) => sanitize(value))
  name?: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsOptional()
  @Transform(({ value }) => sanitize(value.toLowerCase()))
  email?: string;

  @IsString({ message: 'Phone number must be a string' })
  @IsOptional()
  @Transform(({ value }) => sanitize(value))
  phone?: string;

  @IsString({ message: 'Customer ID must be a string' })
  @IsOptional()
  @Transform(({ value }) => sanitize(value))
  customerId?: string;

  // Receiver information
  @IsString({ message: 'Receiver name must be a string' })
  @IsOptional()
  @Transform(({ value }) => sanitize(value))
  receiverName?: string;

  @IsString({ message: 'Receiver email must be a string' })
  @IsOptional()
  @Transform(({ value }) => sanitize(value.toLowerCase()))
  receiverEmail?: string;

  @IsString({ message: 'Receiver phone must be a string' })
  @IsOptional()
  @Transform(({ value }) => sanitize(value))
  receiverPhone?: string;

  @IsString({ message: 'Receiver ID must be a string' })
  @IsOptional()
  @Transform(({ value }) => sanitize(value))
  receiverId?: string;

  // Order assignment info
  @IsString({ message: 'Branch ID must be a string' })
  @IsOptional()
  @Transform(({ value }) => sanitize(value))
  branchId?: string;

  @IsString({ message: 'Driver ID must be a string' })
  @IsOptional()
  @Transform(({ value }) => sanitize(value))
  driverId?: string;

  @IsEnum(ServiceType, { message: 'Invalid service type provided' })
  @IsOptional()
  serviceType: ServiceType;

  @IsEnum(FulfillmentType, { message: 'Invalid fulfillment type provided' })
  @IsOptional()
  fulfillmentType: FulfillmentType;

  @IsString({ message: 'Tracking code must be a string' })
  @IsOptional()
  @Transform(({ value }) => sanitize(value))
  trackingCode: string;

  @Type(() => Number)
  @IsNumber({}, { message: 'Weight must be a number' })
  @IsPositive({ message: 'Weight must be greater than zero' })
  weight: number;

  @IsEnum(ParcelCategory, { message: 'Invalid parcel category' })
  @IsOptional()
  category?: ParcelCategory;

  @IsBoolean({ message: 'isFragile must be a boolean' })
  @IsOptional()
  isFragile?: boolean;

  @IsEnum(ShipmentType, { message: 'Invalid shipment type' })
  @IsOptional()
  shipmentType?: ShipmentType;

  @IsEnum(ShippingScope, { message: 'Invalid shipping scope' })
  @IsOptional()
  shippingScope?: ShippingScope;

  @Type(() => Number)
  @IsOptional()
  @IsNumber({}, { message: 'Length must be a number' })
  @IsPositive({ message: 'Length must be positive' })
  length?: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber({}, { message: 'Width must be a number' })
  @IsPositive({ message: 'Width must be positive' })
  width?: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber({}, { message: 'Height must be a number' })
  @IsPositive({ message: 'Height must be positive' })
  height?: number;

  @ValidateIf((o) => o.fulfillmentType === FulfillmentType.PICKUP)
  @IsDateString({}, { message: 'Pickup date must be a valid ISO date' })
  @IsOptional()
  pickupDate?: string;

  @ValidateIf((o) => o.fulfillmentType === FulfillmentType.PICKUP)
  @IsOptional()
  @ValidateNested({ message: 'Pickup address must be a valid object' })
  @Type(() => AddressDto)
  pickupAddress?: AddressDto;

  @ValidateNested({ message: 'Delivery address must be a valid object' })
  @IsNotEmpty({ message: 'Delivery address is required' })
  @Type(() => AddressDto)
  deliveryAddress: AddressDto;

  @IsDateString({}, { message: 'Delivery date must be a valid ISO date' })
  @IsOptional()
  deliveryDate?: string;

  @Type(() => Number)
  @IsNumber({}, { message: 'Cost must be a number' })
  @IsOptional()
  cost?: number;

  @IsString({ message: 'Payment ID must be a string' })
  @IsOptional()
  @Transform(({ value }) => sanitize(value))
  paymentId?: string;

  @IsBoolean({ message: 'isUnusual must be a boolean' })
  @IsOptional()
  isUnusual?: boolean;

  @IsString({ message: 'Unusual reason must be a string' })
  @IsOptional()
  @Transform(({ value }) => sanitize(value))
  unusualReason?: string;
}

// ---------------- UPDATE DTO ----------------

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  @IsEnum(OrderStatus, { message: 'Invalid order status' })
  @IsOptional()
  status: OrderStatus;
}

// ---------------- ACCEPT DROPOFF ----------------

export class AcceptDropOffDto {
  @IsString({ message: 'Tracking code must be a string' })
  @IsNotEmpty({ message: 'Tracking code is required' })
  @Transform(({ value }) => sanitize(value))
  trackingCode: string;
}

// ---------------- CONFIRM PICKUP ORDER ----------------

export class ConfirmPickUpOrderDto {
  @IsString({ message: 'Order Id must be a string' })
  @IsNotEmpty({ message: 'Order Id field is required' })
  @Transform(({ value }) => sanitize(value))
  orderId: string;

  @IsString({ message: 'Driver Id must be a string' })
  @IsNotEmpty({ message: 'Driver Id field is required' })
  @Transform(({ value }) => sanitize(value))
  driverId: string;
}

// ---------------- CONFIRM PICKUP ORDER ----------------

export class ApproveOrderDto {
  @IsString({ message: 'Order Id must be a string' })
  @IsNotEmpty({ message: 'Order Id field is required' })
  @Transform(({ value }) => sanitize(value))
  orderId: string;

  @IsString({ message: 'Reason must be a string' })
  @IsNotEmpty({ message: 'Reason is required' })
  @Transform(({ value }) => sanitize(value))
  reason: string;
}

// ---------------- MARK UNUSUAL ORDER ----------------

export class MarkUnusualOrderDto {

  @IsNotEmpty({ message: 'Is Fragile field is required' })
  @IsBoolean({ message: 'Is Fragile Field must be a boolean' })
  @IsOptional()
  isFragile: string;

  @IsString({ message: 'Unusual Reason must be a string' })
  @IsNotEmpty({ message: 'Unusual Reason is required' })
  @Transform(({ value }) => sanitize(value))
  unusualReason: string;

}

// ---------------- VALIDATE ORDER ----------------

export class ValidateOrderDto extends PartialType(CreateOrderDto) {
  @IsString({ message: 'Validated by must be a string' })
  @IsNotEmpty({ message: 'Validated by field is required' })
  @Transform(({ value }) => sanitize(value))
  validatedBy?: string;

  @IsString({ message: 'Validated notes must be a string' })
  @IsOptional()
  @Transform(({ value }) => sanitize(value))
  validatedNotes?: string;
}

// ---------------- ADD EXCEPTION ----------------

export class AddException {
  @IsString({ message: 'Order ID must be a string' })
  @IsNotEmpty({ message: 'Order ID is required' })
  @Transform(({ value }) => sanitize(value))
  orderId: string;

  @IsString({ message: 'Reason must be a string' })
  @IsNotEmpty({ message: 'Reason is required' })
  @Transform(({ value }) => sanitize(value))
  reason: string;

  @IsString({ message: 'Type must be a string' })
  @IsNotEmpty({ message: 'Exception type is required' })
  @Transform(({ value }) => sanitize(value))
  type: string;
}

// ---------------- CANCEL ORDER ----------------

export class CancelOrderDto {
  @IsString({ message: 'Order ID must be a string' })
  @IsNotEmpty({ message: 'Order ID is required' })
  @Transform(({ value }) => sanitize(value))
  orderId: string;

  @IsString({ message: 'Reason must be a string' })
  @IsNotEmpty({ message: 'Cancel reason is required' })
  @Transform(({ value }) => sanitize(value))
  reason: string;
}
