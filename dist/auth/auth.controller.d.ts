import { AuthUseCaseImpl } from './auth.usecase.impl';
import { AuthRegisterDto, AuthLoginDto, AuthChangePasswordDto, AuthLoginMobileDto } from './auth.entity';
import { IResponse } from '../common/types';
export declare class AuthMessageController {
    private readonly usecases;
    constructor(usecases: AuthUseCaseImpl);
    private readonly logger;
    register(dto: AuthRegisterDto): Promise<IResponse<{
        name: string;
        email: string;
        password: string;
        branchId: string | null;
        customerType: import(".prisma/client").$Enums.CustomerType | null;
        phone: string | null;
        id: string;
        customId: string | null;
        createdAt: Date;
        updatedAt: Date;
        emailVerified: boolean;
        roleId: string | null;
        isStaff: boolean;
        isSuperAdmin: boolean;
        emergencyContactName: string | null;
        emergencyContactPhone: string | null;
        isActive: boolean;
        customerCategoryId: string | null;
        createdBy: string | null;
    }>>;
    login(payload: {
        dto: AuthLoginDto;
    }): Promise<IResponse<{
        user: import(".prisma/client").User;
        tokens: import("./auth.entity").AuthTokens;
    }>>;
    loginMobile(payload: {
        dto: AuthLoginMobileDto;
    }): Promise<IResponse<{
        user: import(".prisma/client").User;
        tokens: import("./auth.entity").AuthTokens;
    }>>;
    refreshToken(data: any): Promise<IResponse<import("./auth.entity").AuthTokens>>;
    getAuthenticatedUser(data: any): Promise<IResponse<{
        name: string;
        email: string;
        password: string;
        branchId: string | null;
        customerType: import(".prisma/client").$Enums.CustomerType | null;
        phone: string | null;
        id: string;
        customId: string | null;
        createdAt: Date;
        updatedAt: Date;
        emailVerified: boolean;
        roleId: string | null;
        isStaff: boolean;
        isSuperAdmin: boolean;
        emergencyContactName: string | null;
        emergencyContactPhone: string | null;
        isActive: boolean;
        customerCategoryId: string | null;
        createdBy: string | null;
    }>>;
    changePassword(data: {
        user: any;
        body: AuthChangePasswordDto;
    }): Promise<IResponse<any>>;
    superAdmin(dto: any): Promise<IResponse<void>>;
}
