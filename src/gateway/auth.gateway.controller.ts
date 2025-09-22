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
import {
  AuthChangePasswordDto,
  AuthLoginDto,
  AuthRegisterDto,
} from '../auth/auth.entity';
@Controller('auth')
export class AuthGatewayController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {}

  @Post('register')
  async register(@Body() dto: AuthRegisterDto) {
    return this.authClient.send(PATTERNS.AUTH_REGISTER, dto);
  }

  @Post('login')
  async login(@Body() dto: AuthLoginDto) {
    return this.authClient.send(PATTERNS.AUTH_LOGIN, dto);
  }

  @Get('refresh')
  async refreshToken(@Req() req: Request) {
    const authHeader = req.headers['authorization'] || null;
    let token = req.headers['authorization']?.replace('Bearer ', '') || null;

    return this.authClient.send(
      PATTERNS.AUTH_REFRESH_TOKEN,

      {
        refreshToken: token,
        headers: { authorization: authHeader },
      },
    );
  }

  @Post('change-password')
  async changePassword(
    @Req() req: Request,
    @Body() body: AuthChangePasswordDto,
  ) {
    const authHeader = req.headers['authorization'] || null;

    return this.authClient.send(PATTERNS.AUTH_CHANGE_PASSWORD, {
      headers: { authorization: authHeader },

      body,
    });
  }

  @Post('superAdmin')
  async superAdmin(@Body() dto: any) {
    return this.authClient.send('SUPPER_ADDMIN', {});
  }
}
