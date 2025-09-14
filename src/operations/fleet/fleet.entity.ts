import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
  IsNumber,
} from 'class-validator';
import { VehicleStatus } from '@prisma/client'; // assuming you use Prisma enums

// DTO for creating a new vehicle
export interface CreateVehicleDto {
  plateNumber: string;
  type: string;
  status?: VehicleStatus; // default to ACTIVE
  driverId?: string; // optional assignment on creation
}

// DTO for updating vehicle details
export class UpdateVehicleDto {
  @IsOptional()
  @IsString()
  plateNumber?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsEnum(VehicleStatus)
  status?: VehicleStatus;

  @IsOptional()
  @IsString()
  driverId?: string; // assign or reassign a driver
}

// DTO for assigning/unassigning a vehicle to a driver
export class AssignVehicleDto {
  @IsNotEmpty()
  @IsString()
  vehicleId: string;

  @IsNotEmpty()
  @IsString()
  driverId: string;
}

// DTO for logging vehicle maintenance
export class VehicleMaintenanceDto {
  @IsNotEmpty()
  @IsString()
  vehicleId: string;

  @IsNotEmpty()
  @IsString()
  maintenance: string;

  @IsOptional()
  @IsNumber()
  cost?: number;
}

// DTO for querying vehicle maintenance history (optional filters)
export class VehicleMaintenanceQueryDto {
  @IsOptional()
  @IsString()
  vehicleId?: string;

  @IsOptional()
  fromDate?: Date;

  @IsOptional()
  toDate?: Date;
}
