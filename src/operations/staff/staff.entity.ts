import { DriverStatus, DriverType } from '@prisma/client';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  IsIn,
  IsArray,
  ArrayNotEmpty,
  IsEnum,
  IsNumber,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class RegisterStaffDto {
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  branchId?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsNotEmpty()
  @IsString()
  emergencyContactPhone: string;

  @IsNotEmpty()
  @IsString()
  emergencyContactName: string;
}

export class UpdateStaffDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsEmail({}, { message: 'Invalid email format' })
  @IsOptional()
  email: string;

  @IsOptional()
  @IsString()
  branchId?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

export class ChangeRoleDto {
  @IsNotEmpty()
  @IsString()
  role: string;

  @IsNotEmpty()
  @IsString()
  userId: string;
}

export class AssignStaffToBranchDto {
  @IsArray({ message: 'staffIds must be an array of strings' })
  @ArrayNotEmpty({ message: 'staffIds cannot be empty' })
  @IsString({ each: true, message: 'Each staffId must be a string' })
  staffIds: string[];

  @IsNotEmpty({ message: 'branchId is required' })
  @IsString({ message: 'branchId must be a string' })
  branchId: string;
}

export class CreateDriver {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsOptional()
  roleId?: string; // SUPER_ADMIN, CUSTOMER, DRIVER etc.

  @IsNotEmpty()
  @IsOptional()
  branchId?: string;

  @IsNotEmpty()
  @IsOptional()
  phone?: string;
  
  @IsNotEmpty()
  @IsString()
  licenseNumber: string;

  @IsNotEmpty()
  @IsString()
  licenseExpiry: string;

  @IsNotEmpty()
  @IsString()
  emergencyContactPhone: string;

  @IsNotEmpty()
  @IsString()
  emergencyContactName: string;

  @IsOptional()
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
