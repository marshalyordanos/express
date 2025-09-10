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
  Query,
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

  // user
  @Get(':id')
  async findUser(@Param('id') id: string) {
    return this.userClient.send(PATTERNS.USER_FIND_BY_ID, { id });
  }

  @Get()
  async findAll(
    @Req() req,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('search') search?: string,
    @Query('branchId') branchId?: string,
  ) {
    const authHeader = req.headers['authorization'] || null;

    return this.userClient.send(PATTERNS.USER_FIND_ALL, {
      headers: { authorization: authHeader },
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 10,
      search: search || null,
      branchId: branchId ? Number(branchId) : null,
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
