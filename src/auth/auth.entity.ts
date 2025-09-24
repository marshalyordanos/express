import { Role } from '@prisma/client';

import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsOptional,
  MinLength,
} from 'class-validator';

export class AuthRegisterDto {
  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be a string' })
  name: string;

  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Email must be valid' })
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @IsNotEmpty({ message: 'Role is required' })
  @IsString({ message: 'Role must be a string' })
  role: string;

  @IsOptional()
  @IsString({ message: 'Branch ID must be a string' })
  branchId?: string;

  @IsString()
  customerType: string = 'INDIVIDUAL';

  @IsNotEmpty({ message: 'Phone is required' })
  @IsString({ message: 'Phone must be a string' })
  phone: string;

  // --- Corporate only fields ---
  @IsOptional()
  @IsString({ message: 'Company name must be a string' })
  companyName?: string;

  @IsOptional()
  @IsString({ message: 'Tax ID must be a string' })
  taxId?: string;

  @IsOptional()
  @IsString({ message: 'Contact person must be a string' })
  contactPerson?: string;

  @IsOptional()
  @IsString({ message: 'Contact phone must be a string' })
  contactPhone?: string;

  @IsOptional()
  @IsString({ message: 'Contact email must be a string' })
  contactEmail?: string;

  @IsOptional()
  @IsString({ message: 'Industry type must be a string' })
  industryType?: string;

  @IsOptional()
  @IsString({ message: 'Website must be a string' })
  website?: string;

  @IsOptional()
  @IsString({ message: 'Address must be a string' })
  address?: string;

  @IsOptional()
  @IsString({ message: 'Notes must be a string' })
  notes?: string;
}

export interface AuthLoginDto {
  email: string;
  password: string;
}
export interface AuthLoginMobileDto {
  phone: string;
  password: string;
}

export interface AuthChangePasswordDto {
  oldPassword: string;
  newPassword: string;
}

export interface AuthResetPasswordDto {
  token: string;
  newPassword: string;
}

export interface AuthForgotPasswordDto {
  email: string;
}

export interface AuthVerifyEmailDto {
  token: string;
}

export interface AuthMfaDto {
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
