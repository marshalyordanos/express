import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsOptional,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { escape } from 'lodash';


export class AuthRegisterDto {
  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be a string' })
  @Transform(({ value }) => escape(value.trim()))
  name: string;

  
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Email must be valid' })
  @Transform(({ value }) => value.trim().toLowerCase())
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Transform(({ value }) => value.trim())
  password: string;

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

export class AuthLoginDto {
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Email must be valid' })
  @Transform(({ value }) => value.trim().toLowerCase())
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  @Transform(({ value }) => escape(value.trim()))
  password: string;
}
export class AuthLoginMobileDto {
  @IsNotEmpty({ message: 'Phone is required' })
  @IsString({ message: 'Phone must be a string' })
  @Transform(({ value }) => escape(value.trim()))
  phone: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  @Transform(({ value }) => escape(value.trim()))
  password: string;
}

export class AuthChangePasswordDto {
  @IsNotEmpty({ message: 'Old password is required' })
  @IsString({ message: 'Old password must be a string' })
  @Transform(({ value }) => escape(value.trim()))
  oldPassword: string;

  @IsNotEmpty({ message: 'New password is required' })
  @IsString({ message: 'New password must be a string' })
  @Transform(({ value }) => escape(value.trim()))
  newPassword: string;
}

export class AuthResetPasswordDto {
  @IsNotEmpty({ message: 'Token is required' })
  @IsString({ message: 'Token must be a string' })
  @Transform(({ value }) => escape(value.trim()))
  token: string;

  @IsNotEmpty({ message: 'New password is required' })
  @IsString({ message: 'New password must be a string' })
  @Transform(({ value }) => escape(value.trim()))
  newPassword: string;
}
export class AuthForgotPasswordDto {
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Email must be valid' })
  @Transform(({ value }) => value.trim().toLowerCase())
  email: string;
}

export class AuthVerifyEmailDto {
  @IsNotEmpty({ message: 'Token is required' })
  @IsString({ message: 'Token must be a string' })
  @Transform(({ value }) => escape(value.trim()))
  token: string;
}

export class AuthMfaDto {
  @IsNotEmpty({ message: 'MFA code is required' })
  @IsString({ message: 'MFA code must be a string' })
  @Transform(({ value }) => escape(value.trim()))
  code: string;
}
export interface AuthSession {
  id: string;
  device: string;
  ip: string;
  createdAt: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
