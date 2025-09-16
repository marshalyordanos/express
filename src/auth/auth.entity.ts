import { Role } from '@prisma/client';

export interface AuthRegisterDto {
  name: string;
  email: string;
  password: string;
  role: string;
  branchId?: string;
  phone?: string;
}

export interface AuthLoginDto {
  email: string;
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
