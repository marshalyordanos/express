import { AddressPurpose, DriverStatus, DriverType } from '@prisma/client';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Transform } from 'class-transformer';

export interface UserDto {
  name: string;
  email: string;
  password: string;
  role?: string; // SUPER_ADMIN, CUSTOMER, DRIVER etc.
  branchId?: string;
  phone?: string;
}

export class UserUpdateDto {
  name: string;
  email: string;
  password: string;
  branchId?: string;
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

export interface AddressDto {
  id?: string;
  label: string; // e.g. "Home", "Office"
  addressLine: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  lat?: string;
  long?: string;
  userId: string;
  purpose: AddressPurpose;
}

export interface PreferencesDto {
  defaultPayment?: string;
  defaultDropoffBranch?: string;
  deliveryNotes?: string;
}

export class AddressUpdateDto {
  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsString()
  addressLine?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  lat?: string;

  @IsOptional()
  @IsString()
  long?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;
}

export class UpdateCorporateInfoDto {
  @IsOptional() companyName?: string;
  @IsOptional() taxId?: string;
  @IsOptional() contactPerson?: string;
  @IsOptional() contactPhone?: string;
  @IsOptional() contactEmail?: string;
  @IsOptional() industryType?: string;
  @IsOptional() website?: string;
  @IsOptional() address?: string;
  @IsOptional() notes?: string;
}

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
  name?: string;

  @IsOptional()
  description?: string;
}

export class AssignCustomerToCategory {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  customerIds: string[];

  @IsNotEmpty()
  @IsString()
  customerCategoryId: string;
}

export class UnAssignCustomerToCategory {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  customerIds: string[];
}


export class NotificationPreferencesDto{
  email?: boolean;
  inApp?: boolean;
  push?: boolean;
  userId: string;
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
