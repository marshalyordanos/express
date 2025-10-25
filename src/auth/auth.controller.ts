import {
  Controller,
  ForbiddenException,
  Logger,
  UseGuards,
} from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
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
    try {
      const user = await this.usecases.register(dto);
      return new IResponse(true, 'User is registered Succuessfuly', user);
    } catch (error) {
      handleCatch(error);
    }
  }

  @Public()
  @UseGuards(RateLimitGuard)
  @MessagePattern(PATTERNS.AUTH_LOGIN)
  async login(@Payload() payload: {dto: AuthLoginDto}) {
    try {
      const { dto } = payload;
      console.log('data: ', dto);

      const data = await this.usecases.login(dto);
      return new IResponse(true, 'User is logged in Succuessfuly', data);
    } catch (error) {
      handleCatch(error);
    }
  }

  @Public()
  @UseGuards(RateLimitGuard)
  @MessagePattern(PATTERNS.AUTH_LOGIN_MOBILE)
  async loginMobile(@Payload() payload: {dto: AuthLoginMobileDto}) {
    try {
      const { dto } = payload;
      console.log('data: ', dto);

      const data = await this.usecases.loginMobile(dto);
      return new IResponse(true, 'User is logged in Succuessfuly', data);
    } catch (error) {
      handleCatch(error);
    }
  }

  @UseGuards(PermissionGuard,RateLimitGuard)
  @CheckPermission('Auth', PermissionActions.READ)
  @MessagePattern(PATTERNS.AUTH_REFRESH_TOKEN)
  async refreshToken(@Payload() data: any) {
    try {
      const user = data.user; // decoded JWT
      console.log('Current user:', user);

      // Object-level authorization: always match user from token
      if (!user?.sub) throw new ForbiddenException('Unauthorized');
      console.log('Current user sub :', user?.sub);
      console.log('Refresh token :', data.refreshToken);

      const tokens = await this.usecases.refreshToken(
        user?.sub,
        data.refreshToken,
      );

      this.logger.log(`Token refreshed for userId=${user.sub}`);
      return new IResponse(true, 'Token has been refreshed!', tokens);
    } catch (error) {
      this.logger.error(`Refresh token failed: ${error.message} ;;;`);
      handleCatch(error);
    }
  }

  @UseGuards(PermissionGuard,RateLimitGuard)
  @CheckPermission('Auth', PermissionActions.READ)
  @MessagePattern(PATTERNS.AUTH_FIND_AUTHENTICATED_USER)
  async getAuthenticatedUser(@Payload() data: any) {
    try {
      const user = data.user; // decoded JWT
      console.log('Current user:', user);

      // Object-level authorization: always match user from token
      if (!user?.sub) throw new ForbiddenException('Unauthorized');
      console.log('Current user sub :', user?.sub);

     const userData= await this.usecases.getAuthenticatedUser(user?.sub);

      this.logger.log(`User fetched for userId=${user.sub}`);
      return new IResponse(true, 'User Fetched successfully!', userData);
    } catch (error) {
      this.logger.error(`User fetch failed: ${error.message}`, error.stack);
      handleCatch(error);
    }
  }
  
  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Auth', PermissionActions.UPDATE)
  @MessagePattern(PATTERNS.AUTH_CHANGE_PASSWORD)
  async changePassword(
    @Payload() data: { user: any; body: AuthChangePasswordDto },
  ) {
    try {
      const user = data.user; // decoded JWT
      const body = data.body;
      console.log('Current user:', user, body);
      // Object-level authorization
      if (!user?.sub) throw new ForbiddenException('Unauthorized');
      console.log('Current user sub:', user?.sub);

      await this.usecases.changePassword(user?.sub, body);
      this.logger.log(`Password changed successfully for userId=${user.sub}`);
      return new IResponse(true, 'Password changed successfully');
    } catch (error) {
      this.logger.error(
        `Change password failed for userId=${data.user?.sub}: ${error.message}`,
        error.stack,
      );
      handleCatch(error);
    }
  }

  @Public()
  @MessagePattern('SUPPER_ADDMIN')
  async superAdmin(@Payload() dto: any) {
    try {
      const user = await this.usecases.createSuperAdmin();
      return new IResponse(true, 'User is registered Succuessfuly', user);
    } catch (error) {
      handleCatch(error);
    }
  }
}
//
