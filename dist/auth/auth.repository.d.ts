import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { AuthRegisterDto } from './auth.entity';
export declare class AuthRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findByEmail(email: string): Promise<User | null>;
    findByPhone(phone: string): Promise<User | null>;
    createNotificationPreferences(id: string): Promise<{
        push: boolean;
        id: string;
        email: boolean;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        inApp: boolean;
    }>;
    findById(id: string): Promise<User | null>;
    findRoleById(id: string): Promise<{
        name: string;
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
    }>;
    createUser(data: AuthRegisterDto, hashedPassword: string): Promise<User>;
    saveRefreshToken(userId: string, token: string): Promise<void>;
    findSessionByRefreshToken(userId: string, token: string): Promise<{
        token: string;
        id: string;
        createdAt: Date;
        userId: string;
        expiresAt: Date;
    }>;
    removeRefreshToken(userId: string, sessionId?: string): Promise<void>;
    updateRefreshToken(userId: string, newToken: string, sessionId: string): Promise<void>;
    updatePassword(userId: string, hashedPassword: string): Promise<void>;
    generateResetToken(userId: string): Promise<string>;
    verifyResetToken(token: string): Promise<string | null>;
    invalidateResetToken(token: string): Promise<void>;
    sendVerificationEmail(userId: string, email: string): Promise<void>;
    sendVerificationPhone(userId: string, email: string): Promise<void>;
    verifyEmailToken(token: string): Promise<string | null>;
    markEmailAsVerified(userId: string): Promise<void>;
    sendResetPasswordEmail(email: string, token: string): Promise<void>;
    createSuperAdmin(): Promise<{
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
    invalidateRefreshToken(userId: string): Promise<void>;
}
