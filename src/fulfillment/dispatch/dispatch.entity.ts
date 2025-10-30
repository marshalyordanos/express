import {
  DriverStatus,
  DriverType,
  ParcelCategory,
  ServiceType,
  ShippingScope,
} from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { escape } from 'lodash';


export class AssignDriverForPickup {
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.trim())
  orderId: string;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.trim())
  driverId: string;
}

export class BatchDispatchDto {
  @IsNotEmpty()
  @IsEnum(ShippingScope)
  scope: ShippingScope; // ShippingScope (IN_TOWN, REGIONAL, INTERNATIONAL)

  @IsNotEmpty()
  @IsEnum(ServiceType)
  serviceType: ServiceType; // ServiceType (SAME_DAY, EXPRESS, etc.)

  @IsOptional()
  @IsEnum(ParcelCategory)
  category?: ParcelCategory; // e.g., Electronics, Documents, Mixed

  @IsOptional()
  @IsBoolean()
  isFragile?: boolean;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.trim())
  originId: string;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.trim())
  destinationId: string;

  @IsOptional()
  @IsString()
   @Transform(({ value }) => escape(value?.trim()))
  notes?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value.trim())
  createdById?: string; // FK to User (manager/staff who created)

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value.trim())
  driverId?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value.trim())
  vehicleId?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value.trim())
  awbNumber?: string; // required only for international

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @Transform(({ value }) => value.map((v: string) => v.trim()))
  orders: string[]; // Array of order IDs to include in this batch

  @IsNotEmpty()
  @IsDateString(
    {},
    { message: 'shipmentDate must be a valid ISO date (YYYY-MM-DD)' },
  )
  shipmentDate: string; // Example: "2025-09-24"
}

export class CreateDriver {
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.trim())
  userId: string;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.trim())
  vehicleId: string;

  @IsNotEmpty()
  @IsEnum(DriverStatus, { message: 'Invalid driver status' })
  status: DriverStatus;

  @IsNotEmpty()
  @IsEnum(DriverType, { message: 'Invalid driver type' })
  type: DriverType;

  @IsOptional()
  @IsNumber({}, { message: 'Latitude must be a number' })
  currentLat: number;

  @IsOptional()
  @IsNumber({}, { message: 'Longitude must be a number' })
  currentLong: number;
}

export class AssignOfficerForBatch {
  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @Transform(({ value }) => value.map((v: string) => v.trim()))
  batchId: string[];

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.trim())
  officerId: string;
}

export class BatchHandoverDto {
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.trim())
  handedById: string; // Cargo officer ID

  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @Transform(({ value }) => value.map((v: string) => v.trim()))
  batchIds: string[]; // IDs of batches being handed over

  @IsOptional()
  @IsString()
  @Transform(({ value }) => escape(value?.trim()))
  method?: string; // e.g., "handed to airport", "receipt scanned"

  @IsOptional()
  @IsString()
   @Transform(({ value }) => escape(value?.trim()))
  reference?: string; // optional receipt number, QR code, or photo URL

  @IsOptional()
  @IsString()
   @Transform(({ value }) => escape(value?.trim()))
  notes?: string; // additional notes or comments

  @IsOptional()
  @IsString()
   @Transform(({ value }) => escape(value?.trim()))
  currentLocation?: string; // additional notes or comments
}

export class OrderScanTokenDto {
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.trim())
  scannedBy: string; // officer ID

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.trim())
  token: string; // scanned QR code token
}

export class ConfirmBatchHandoverDto {
  @IsString()
  @IsNotEmpty({ message: 'handedById is required' })
  @Transform(({ value }) => value.trim())
  handedById: string;

  @IsString()
  @IsOptional()
   @Transform(({ value }) => escape(value?.trim()))
  method?: string;

  @IsString()
  @IsOptional()
   @Transform(({ value }) => escape(value?.trim()))
  reference?: string;

  @IsString()
  @IsOptional()
   @Transform(({ value }) => escape(value?.trim()))
  notes?: string;
}

export class CompleteDeliveryDto {
  @IsString()
  @IsNotEmpty({ message: 'orderId is required' })
  @Transform(({ value }) => value.trim())
  orderId: string;

  @IsString()
  @IsNotEmpty({ message: 'driverId is required' })
  @Transform(({ value }) => value.trim())
  driverId: string;

  @IsString()
  @IsOptional()
   @Transform(({ value }) => escape(value?.trim()))
  notes?: string;
}

export class LastMileDeliveryDto {
  @IsString()
  @IsNotEmpty({ message: 'orderId is required' })
  @Transform(({ value }) => value.trim())
  orderId: string;

  @IsString()
  @IsNotEmpty({ message: 'driverId is required' })
  @Transform(({ value }) => value.trim())
  driverId: string;

  @IsString()
  @IsOptional()
   @Transform(({ value }) => escape(value?.trim()))
  notes?: string;
}

export class GenerateQrDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => value?.map((v: string) => v.trim()))
  orderIds?: string[];

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  batchId?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  branchId?: string;

  @IsOptional()
  @IsEnum(ServiceType)
  serviceType?: ServiceType;

  @IsOptional()
  @IsEnum(ShippingScope)
  shippingScope?: ShippingScope;
}
