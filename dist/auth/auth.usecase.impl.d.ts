import { AuthUseCase } from './auth.usecase';
import { AuthRepository } from './auth.repository';
import { User } from '@prisma/client';
import { AuthRegisterDto, AuthLoginDto, AuthTokens, AuthChangePasswordDto, AuthForgotPasswordDto, AuthResetPasswordDto, AuthVerifyEmailDto, AuthLoginMobileDto } from './auth.entity';
import { JwtService } from '@nestjs/jwt';
import { AppLogger } from '../common/app-logger.service';
import { NotificationPublisher } from '../common/notification-publisher';
export declare class AuthUseCaseImpl implements AuthUseCase {
    private readonly authRepository;
    private readonly jwtService;
    private readonly logger;
    private readonly notificationPublisher;
    constructor(authRepository: AuthRepository, jwtService: JwtService, logger: AppLogger, notificationPublisher: NotificationPublisher);
    register(data: AuthRegisterDto): Promise<User>;
    login(data: AuthLoginDto): Promise<{
        user: User;
        tokens: AuthTokens;
    }>;
    loginMobile(data: AuthLoginMobileDto): Promise<{
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
    getAuthenticatedUser(sub: string): Promise<{
        password: string;
        name: string;
        id: string;
        customId: string | null;
        email: string;
        phone: string | null;
        branchId: string | null;
        createdAt: Date;
        updatedAt: Date;
        emailVerified: boolean;
        roleId: string | null;
        isStaff: boolean;
        isSuperAdmin: boolean;
        emergencyContactName: string | null;
        emergencyContactPhone: string | null;
        isActive: boolean;
        customerType: import(".prisma/client").$Enums.CustomerType | null;
        customerCategoryId: string | null;
        createdBy: string | null;
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
    private generateTokens;
    createSuperAdmin(): Promise<void>;
}
