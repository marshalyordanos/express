import { ClientProxy } from '@nestjs/microservices';
import { Request } from 'express';
import { AuthChangePasswordDto, AuthLoginDto, AuthLoginMobileDto, AuthRegisterDto } from '../auth/auth.entity';
export declare class AuthGatewayController {
    private readonly authClient;
    constructor(authClient: ClientProxy);
    register(dto: AuthRegisterDto): Promise<import("rxjs").Observable<any>>;
    login(dto: AuthLoginDto, req: Request): Promise<import("rxjs").Observable<any>>;
    loginMobile(dto: AuthLoginMobileDto, req: Request): Promise<import("rxjs").Observable<any>>;
    refreshToken(req: Request): Promise<import("rxjs").Observable<any>>;
    changePassword(req: Request, body: AuthChangePasswordDto): Promise<import("rxjs").Observable<any>>;
    getAuthenticatedUser(req: Request): Promise<import("rxjs").Observable<any>>;
    superAdmin(dto: any): Promise<import("rxjs").Observable<any>>;
}
