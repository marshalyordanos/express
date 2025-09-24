import { ParcelCategory, ServiceType, ShippingScope } from '@prisma/client';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class AssignDriverForPickup {
  @IsNotEmpty()
  @IsString()
  orderId: string;

  @IsNotEmpty()
  @IsString()
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
  origin: string; // branch code or location

  @IsNotEmpty()
  @IsString()
  destination: string; // branch code or airport

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  createdById?: string; // FK to User (manager/staff who created)

  @IsOptional()
  @IsString()
  driverId?: string;

  @IsOptional()
  @IsString()
  vehicleId?: string;

  @IsOptional()
  @IsString()
  awbNumber?: string; // required only for international

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  orders: string[]; // Array of order IDs to include in this batch
}
 export class AssignDriverForBatch {
  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  batchId: string[];

  @IsNotEmpty()
  @IsString()
  driverId: string;
 }