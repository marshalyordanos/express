import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Inject,
  Delete,
  Req,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { PATTERNS } from '../contracts';
import { UserDto } from '../operations/user/user.entity';
@Controller('users')
export class UserGatewayController {
  constructor(
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
  ) {}

  @Get(':id')
  async findUser(@Param('id') id: string) {
    return this.userClient.send(PATTERNS.USER_FIND_BY_ID, { id });
  }

  @Get()
  async findAll(@Req() req) {
    const authHeader = req.headers['authorization'] || null;

    return this.userClient.send(PATTERNS.USER_FIND_ALL, {
      headers: { authorization: authHeader },
    });
  }

  @Patch(':id')
  async updateUser(@Param('id') id: string, @Body() dto: UserDto) {
    return this.userClient.send(PATTERNS.USER_UPDATE, { id, data: dto });
  }

  @Delete('id')
  async deleteUser(@Param('id') id: string) {
    return this.userClient.send(PATTERNS.USER_DELETE, { id });
  }
}
