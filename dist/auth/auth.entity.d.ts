export declare class AuthRegisterDto {
    name: string;
    email: string;
    password: string;
    role: string;
    branchId?: string;
    customerType: string;
    phone: string;
    companyName?: string;
    taxId?: string;
    contactPerson?: string;
    contactPhone?: string;
    contactEmail?: string;
    industryType?: string;
    website?: string;
    address?: string;
    notes?: string;
}
export declare class AuthLoginDto {
    email: string;
    password: string;
}
export declare class AuthLoginMobileDto {
    phone: string;
    password: string;
}
export declare class AuthChangePasswordDto {
    oldPassword: string;
    newPassword: string;
}
export declare class AuthResetPasswordDto {
    token: string;
    newPassword: string;
}
export declare class AuthForgotPasswordDto {
    email: string;
}
export declare class AuthVerifyEmailDto {
    token: string;
}
export declare class AuthMfaDto {
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
