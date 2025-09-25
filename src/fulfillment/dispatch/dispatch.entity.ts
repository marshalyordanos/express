import { ParcelCategory, ServiceType, ShippingScope } from '@prisma/client';
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

  @IsNotEmpty()
  @IsDateString(
    {},
    { message: 'shipmentDate must be a valid ISO date (YYYY-MM-DD)' },
  )
  shipmentDate: string; // Example: "2025-09-24"
}
export class AssignOfficerForBatch {
  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  batchId: string[];

  @IsNotEmpty()
  @IsString()
  officerId: string;
}

export class BatchHandoverDto {
  @IsNotEmpty()
  @IsString()
  handedById: string; // Cargo officer ID

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  batchIds: string[]; // IDs of batches being handed over

  @IsOptional()
  @IsString()
  method?: string; // e.g., "handed to airport", "receipt scanned"

  @IsOptional()
  @IsString()
  reference?: string; // optional receipt number, QR code, or photo URL

  @IsOptional()
  @IsString()
  notes?: string; // additional notes or comments

  @IsOptional()
  @IsString()
  currentLocation?: string; // additional notes or comments
}

export class OrderScanTokenDto {
  @IsNotEmpty()
  @IsString()
  scannedBy: string; // officer ID

  @IsNotEmpty()
  @IsString()
  token: string; // scanned QR code token
}

export class ConfirmBatchHandoverDto {
  @IsString()
  @IsNotEmpty({ message: 'handedById is required' })
  handedById: string;

  @IsString()
  @IsOptional()
  method?: string;

  @IsString()
  @IsOptional()
  reference?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CompleteDeliveryDto {
  @IsString()
  @IsNotEmpty({ message: 'orderId is required' })
  orderId: string;

  @IsString()
  @IsNotEmpty({ message: 'driverId is required' })
  driverId: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class LastMileDeliveryDto {
  @IsString()
  @IsNotEmpty({ message: 'orderId is required' })
  orderId: string;

  @IsString()
  @IsNotEmpty({ message: 'driverId is required' })
  driverId: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
