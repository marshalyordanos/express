import { User } from '@prisma/client';
import {
  AuthRegisterDto,
  AuthLoginDto,
  AuthTokens,
  AuthChangePasswordDto,
  AuthForgotPasswordDto,
  AuthResetPasswordDto,
  AuthVerifyEmailDto,
} from './auth.entity';

export interface AuthUseCase {
  // Core authentication
  register(data: AuthRegisterDto): Promise<User>;
  login(data: AuthLoginDto): Promise<{ user: User; tokens: AuthTokens }>;
  logout(userId: string, sessionId?: string): Promise<void>;
  refreshToken(userId: string, refreshToken: string): Promise<AuthTokens>;

  // Password management
  changePassword(userId: string, data: AuthChangePasswordDto): Promise<void> ;
  forgotPassword(data: AuthForgotPasswordDto): Promise<{ success: boolean; message: string }>;
  resetPassword(data: AuthResetPasswordDto): Promise<{ success: boolean; message: string }>;

  // Email verification
  verifyEmail(data: AuthVerifyEmailDto): Promise<{ success: boolean; message: string }>;
  resendVerification(email: string): Promise<{ success: boolean; message: string }>;

  // MFA
  // setupMfa(userId: string): Promise<{ qrCodeUrl: string; secret: string }>;
  // verifyMfa(userId: string, data: AuthMfaDto): Promise<boolean>;
  // disableMfa(userId: string): Promise<void>;

  // Session & security
  // getActiveSessions(userId: string): Promise<AuthSession[]>;
  // revokeSession(userId: string, sessionId: string): Promise<void>;
  // revokeAllSessions(userId: string): Promise<void>;
}
