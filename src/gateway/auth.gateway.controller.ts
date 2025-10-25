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
import { firstValueFrom, timeout, catchError, throwError } from 'rxjs';
import { PATTERNS } from '../contracts';
import { MicroserviceClientsModule } from './clients.module';
import { Request } from 'express';
import {
  AuthChangePasswordDto,
  AuthLoginDto,
  AuthLoginMobileDto,
  AuthRegisterDto,
} from '../auth/auth.entity';
import * as jwt from 'jsonwebtoken';
import { JwtService } from '@nestjs/jwt';
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
    console.log('Forwarded ip address ::', forwarded);

    const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
    console.log('Forwarded ip address second ::', ip);
    const secIp: string = forwarded.split(',')[0] || '';
    const secondIp: string = forwarded.split(',')[1] || '';
    const thirdIp: string = forwarded.split(',')[2] || '';
    const jjip= req.ip;
    const lll= req.socket.remoteAddress;
    console.log('Forwarded ip address 1 ::', ip);
    console.log('Forwarded ip address 2 ::', secIp);
    console.log('Forwarded ip address 3 ::', secondIp);
    console.log('Forwarded ip address 4 ::', thirdIp);
    console.log('Forwarded ip address 5 ::', jjip);
    console.log('Forwarded ip address 6 ::', lll);
    return this.authClient.send(PATTERNS.AUTH_LOGIN, { dto, ip });
  }

  @Post('login-mobile')
  async loginMobile(@Body() dto: AuthLoginMobileDto, @Req() req: Request) {
    const forwarded = (req.headers['x-forwarded-for'] as string) || '';
    console.log('Forwarded ip address ::', forwarded);

    const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
    const secIp: string = forwarded.split(',')[0] || '';
    const secondIp: string = forwarded.split(',')[1] || '';
    const thirdIp: string = forwarded.split(',')[2] || '';
    const jjip= req.ip;
    const lll= req.socket.remoteAddress;
    console.log('Forwarded ip address 1 ::', ip);
    console.log('Forwarded ip address 2 ::', secIp);
    console.log('Forwarded ip address 3 ::', secondIp);
    console.log('Forwarded ip address 4 ::', thirdIp);
    console.log('Forwarded ip address 5 ::', jjip);
    console.log('Forwarded ip address 6 ::', lll);

    return this.authClient.send(PATTERNS.AUTH_LOGIN_MOBILE, {
      dto,
      ip,
    });
  }

  @Get('refresh')
  async refreshToken(@Req() req: Request) {
    const authHeader = req.headers['authorization'] || null;
    let token = req.headers['authorization']?.replace('Bearer ', '') || null;

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
      ip: req.ip,
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
      ip: req.ip,
      body,
    });
  }

  @Get('user')
  async getAuthenticatedUser(@Req() req: Request) {
    const authHeader = req.headers['authorization'] || null;

    let token = req.headers['authorization']?.replace('Bearer ', '') || null;

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
      ip: req.ip,
    });
  }

  @Post('superAdmin')
  async superAdmin(@Body() dto: any) {
    return this.authClient.send('SUPPER_ADDMIN', {});
  }
}
