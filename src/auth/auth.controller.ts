import {
  Controller,
  ForbiddenException,
  Logger,
  UseGuards,
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PATTERNS } from '../contracts';
import { AuthUseCaseImpl } from './auth.usecase.impl';
import {
  AuthRegisterDto,
  AuthLoginDto,
  AuthChangePasswordDto,
  AuthLoginMobileDto,
} from './auth.entity';
import { Public } from '../common/decorator/public.decorator';
import { IResponse } from '../common/types';
import { handleCatch } from '../common/handleCatch';
import { CheckPermission } from '../common/decorator/check-permission.decorator';
import { PermissionGuard } from '../common/permission.guard';
import { PermissionActions } from '../contracts/permission-actions.enum';
import { RateLimitGuard } from '../common/rate-limit.guard';

@Controller()
export class AuthMessageController {
  constructor(private readonly usecases: AuthUseCaseImpl) {}
  private readonly logger = new Logger(AuthMessageController.name);

  @Public()
  @MessagePattern(PATTERNS.AUTH_REGISTER)
  async register(@Payload() dto: AuthRegisterDto) {
    const user = await this.usecases.register(dto);
    return new IResponse(true, 'User is registered Succuessfuly', user);
  }

  @Public()
  @UseGuards(RateLimitGuard)
  @MessagePattern(PATTERNS.AUTH_LOGIN)
  async login(@Payload() payload: { dto: AuthLoginDto }) {
    const { dto } = payload;
    const data = await this.usecases.login(dto);
    return new IResponse(true, 'User is logged in Succuessfuly', data);
  }

  @Public()
  @UseGuards(RateLimitGuard)
  @MessagePattern(PATTERNS.AUTH_LOGIN_MOBILE)
  async loginMobile(@Payload() payload: { dto: AuthLoginMobileDto }) {
    const { dto } = payload;
    const data = await this.usecases.loginMobile(dto);
    return new IResponse(true, 'User is logged in Succuessfuly', data);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Auth', PermissionActions.READ)
  @MessagePattern(PATTERNS.AUTH_REFRESH_TOKEN)
  async refreshToken(@Payload() data: any) {
    const user = data.user; // decoded JWT
    // Object-level authorization: always match user from token
    if (!user?.sub) throw new ForbiddenException('Unauthorized');
    const tokens = await this.usecases.refreshToken(
      user?.sub,
      data.refreshToken,
    );
    return new IResponse(true, 'Token has been refreshed!', tokens);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Auth', PermissionActions.READ)
  @MessagePattern(PATTERNS.AUTH_FIND_AUTHENTICATED_USER)
  async getAuthenticatedUser(@Payload() data: any) {
    const user = data.user; // decoded JWT
    // Object-level authorization: always match user from token
    if (!user?.sub) throw new ForbiddenException('Unauthorized');
    const userData = await this.usecases.getAuthenticatedUser(user?.sub);
    return new IResponse(true, 'User Fetched successfully!', userData);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Auth', PermissionActions.UPDATE)
  @MessagePattern(PATTERNS.AUTH_CHANGE_PASSWORD)
  async changePassword(
    @Payload() data: { user: any; body: AuthChangePasswordDto },
  ) {
    const user = data.user; // decoded JWT
    const body = data.body;
    // Object-level authorization
    if (!user?.sub) throw new ForbiddenException('Unauthorized');
    await this.usecases.changePassword(user?.sub, body);
    return new IResponse(
      true,
      'Password changed successfully. Please log in again.',
    );
  }

  @Public()
  @MessagePattern('SUPPER_ADDMIN')
  async superAdmin(@Payload() dto: any) {
    const user = await this.usecases.createSuperAdmin();
    return new IResponse(true, 'User is registered Succuessfuly', user);
  }
}
//
