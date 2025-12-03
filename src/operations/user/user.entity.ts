import { AddressPurpose, DriverStatus, DriverType } from '@prisma/client';
import {
  ArrayNotEmpty,
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export interface UserDto {
  name: string;
  email: string;
  password: string;
  role?: string; // SUPER_ADMIN, CUSTOMER, DRIVER etc.
  branchId?: string;
  phone?: string;
  emergencyContactPhone: string;
  emergencyContactName: string;
}

export class CreateCustomerDto {
  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be a string' })
  @Transform(({ value }) => escape(value.trim()))
  name: string;

  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Email must be valid' })
  @Transform(({ value }) => value.trim().toLowerCase())
  email: string;

  // @IsNotEmpty({ message: 'Password is required' })
  // @IsString({ message: 'Password must be a string' })
  // @MinLength(8, { message: 'Password must be at least 8 characters long' })
  // @Transform(({ value }) => value.trim())
  // password: string;

  @IsNotEmpty({ message: 'Role Id is required' })
  @IsString({ message: 'Role Id must be a string' })
  @Transform(({ value }) => value?.trim())
  role: string;

  @IsOptional()
  @IsString({ message: 'Branch ID must be a string' })
  @Transform(({ value }) => value?.trim())
  branchId?: string;

  @IsString()
  @Transform(({ value }) => escape(value.trim()))
  customerType: string = 'INDIVIDUAL';

  @IsOptional()
  @IsString({ message: 'Customer category ID must be a string' })
  customerCategoryId?: string;

  @IsNotEmpty({ message: 'Phone is required' })
  @IsString({ message: 'Phone must be a string' })
  @Transform(({ value }) => value.trim())
  phone: string;

  // --- Corporate only fields ---
  @IsOptional()
  @IsString({ message: 'Company name must be a string' })
  @Transform(({ value }) => escape(value?.trim()))
  companyName?: string;

  @IsOptional()
  @IsString({ message: 'Tax ID must be a string' })
  @Transform(({ value }) => escape(value?.trim()))
  taxId?: string;

  @IsOptional()
  @IsString({ message: 'Contact person must be a string' })
  @Transform(({ value }) => escape(value?.trim()))
  contactPerson?: string;

  @IsOptional()
  @IsString({ message: 'Contact phone must be a string' })
  @Transform(({ value }) => value?.trim())
  contactPhone?: string;

  @IsOptional()
  @IsString({ message: 'Contact email must be a string' })
  @Transform(({ value }) => value?.trim().toLowerCase())
  @IsEmail({}, { message: 'Contact email must be valid' })
  contactEmail?: string;

  @IsOptional()
  @IsString({ message: 'Industry type must be a string' })
  @Transform(({ value }) => escape(value?.trim()))
  industryType?: string;

  @IsOptional()
  @IsString({ message: 'Website must be a string' })
  @Transform(({ value }) => escape(value?.trim()))
  website?: string;

  @IsOptional()
  @IsString({ message: 'Address must be a string' })
  @Transform(({ value }) => escape(value?.trim()))
  address?: string;

  @IsOptional()
  @IsString({ message: 'Notes must be a string' })
  @Transform(({ value }) => escape(value?.trim()))
  notes?: string;
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

export class NotificationPreferencesDto {
  email?: boolean;
  inApp?: boolean;
  push?: boolean;
  userId: string;
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
