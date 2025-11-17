import { User } from '@prisma/client';
import { AuthRegisterDto, AuthLoginDto, AuthTokens, AuthChangePasswordDto, AuthForgotPasswordDto, AuthResetPasswordDto, AuthVerifyEmailDto } from './auth.entity';
export interface AuthUseCase {
    register(data: AuthRegisterDto): Promise<User>;
    login(data: AuthLoginDto): Promise<{
        user: User;
        tokens: AuthTokens;
    }>;
    logout(userId: string, sessionId?: string): Promise<void>;
    refreshToken(userId: string, refreshToken: string): Promise<AuthTokens>;
    changePassword(userId: string, data: AuthChangePasswordDto): Promise<void>;
    forgotPassword(data: AuthForgotPasswordDto): Promise<{
        success: boolean;
        message: string;
    }>;
    resetPassword(data: AuthResetPasswordDto): Promise<{
        success: boolean;
        message: string;
    }>;
    verifyEmail(data: AuthVerifyEmailDto): Promise<{
        success: boolean;
        message: string;
    }>;
    resendVerification(email: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
