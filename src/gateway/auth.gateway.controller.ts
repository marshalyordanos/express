import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Inject,
  Req,
  Get,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PATTERNS } from '../contracts';
import { Request } from 'express';
import {
  AuthChangePasswordDto,
  AuthLoginDto,
  AuthLoginMobileDto,
  AuthRegisterDto,
} from '../auth/auth.entity';
import * as jwt from 'jsonwebtoken';

@Controller('auth')
export class AuthGatewayController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
    // private readonly jwtService: JwtService,
  ) {}

  @Post('register')
  async register(@Body() dto: AuthRegisterDto) {
    try {
      return this.authClient.send(PATTERNS.AUTH_REGISTER, dto);
    } catch (error) {
      const err = error as any;
      const status = err?.statusCode || 500;
      throw new HttpException(err?.message || 'Internal server error', status);
    }
  }

  @Post('login')
  async login(@Body() dto: AuthLoginDto, @Req() req: Request) {
    const forwarded = (req.headers['x-forwarded-for'] as string) || '';
    const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
    return this.authClient.send(PATTERNS.AUTH_LOGIN, { dto, ip });
  }

  @Post('login-mobile')
  async loginMobile(@Body() dto: AuthLoginMobileDto, @Req() req: Request) {
    const forwarded = (req.headers['x-forwarded-for'] as string) || '';
    const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
    return this.authClient.send(PATTERNS.AUTH_LOGIN_MOBILE, {
      dto,
      ip,
    });
  }

  @Get('refresh')
  async refreshToken(@Req() req: Request) {
    const authHeader = req.headers['authorization'] || null;
    let token = req.headers['authorization']?.replace('Bearer ', '') || null;
    const forwarded = (req.headers['x-forwarded-for'] as string) || '';
    const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
    let decodedUser = null;
    try {
      decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
      // decodedUser = this.jwtService.verify(token);
    } catch (err) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    return this.authClient.send(PATTERNS.AUTH_REFRESH_TOKEN, {
      refreshToken: token,
      user: decodedUser, // ✅ send user info
      ip,
      headers: { authorization: authHeader },
    });
  }

  @Post('change-password')
  async changePassword(
    @Req() req: Request,
    @Body() body: AuthChangePasswordDto,
  ) {
    const authHeader = req.headers['authorization'] || null;
    let token = req.headers['authorization']?.replace('Bearer ', '') || null;
    const forwarded = (req.headers['x-forwarded-for'] as string) || '';
    const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
    let decodedUser = null;
    try {
      decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
      // decodedUser = this.jwtService.verify(token);
    } catch (err) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    return this.authClient.send(PATTERNS.AUTH_CHANGE_PASSWORD, {
      headers: { authorization: authHeader },
      user: decodedUser, // ✅ send user info
      ip,
      body,
    });
  }

  @Get('user')
  async getAuthenticatedUser(@Req() req: Request) {
    const authHeader = req.headers['authorization'] || null;

    let token = req.headers['authorization']?.replace('Bearer ', '') || null;

    const forwarded = (req.headers['x-forwarded-for'] as string) || '';
    const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
    let decodedUser = null;
    try {
      decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
      // decodedUser = this.jwtService.verify(token);
    } catch (err) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    return this.authClient.send(PATTERNS.AUTH_FIND_AUTHENTICATED_USER, {
      headers: { authorization: authHeader },
      user: decodedUser, // ✅ send user info
      ip,
    });
  }

  @Post('superAdmin')
  async superAdmin(@Body() dto: any) {
    return this.authClient.send('SUPPER_ADDMIN', {});
  }
}
