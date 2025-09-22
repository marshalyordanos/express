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
  Logger,
  BadRequestException,
  Search,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PATTERNS } from '../contracts';
import {
  AddressDto,
  AddressUpdateDto,
  ChangeRoleDto,
  UserDto,
} from '../operations/user/user.entity';
import { firstValueFrom, lastValueFrom } from 'rxjs';

@Controller('users')
export class UserGatewayController {
  constructor(
    @Inject('USER_SERVICE') private readonly usersClient: ClientProxy,
  ) {}

  @Post('addresses')
  async addAddress(@Body() dto: AddressDto, @Req() req) {
    const authHeader = req.headers['authorization'] || null;
    return this.usersClient.send(PATTERNS.ADDRESS_CREATE, {
      data: dto,
      headers: { authorization: authHeader },
    });
  }

  @Get('addresses')
  async listAddresses(@Req() req) {
    const authHeader = req.headers['authorization'] || null;
    return this.usersClient.send(PATTERNS.ADDRESS_LIST, {
      headers: { authorization: authHeader },
    });
  }

  @Patch('addresses/:id')
  async updateAddress(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: AddressUpdateDto,
  ) {
    const authHeader = req.headers['authorization'] || null;

    return this.usersClient.send(PATTERNS.ADDRESS_UPDATE, {
      headers: { authorization: authHeader },
      id,
      data: dto,
    });
  }

  @Delete('addresses/:id')
  async deleteAddress(@Req() req, @Param('id') id: string) {
    const authHeader = req.headers['authorization'] || null;

    return this.usersClient.send(PATTERNS.ADDRESS_DELETE, {
      headers: { authorization: authHeader },
      id,
    });
  }

  // user
  @Get('addresses/:id')
  async findUser(@Param('id') id: string) {
    return this.usersClient.send(PATTERNS.USER_FIND_BY_ID, { id });
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

    return this.usersClient.send(PATTERNS.USER_FIND_ALL, {
      headers: { authorization: authHeader },
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 10,
      search: search || null,
      branchId: branchId ? Number(branchId) : null,
    });
  }

  @Patch(':id')
  async updateUser(@Param('id') id: string, @Body() dto: UserDto) {
    return this.usersClient.send(PATTERNS.USER_UPDATE, { id, data: dto });
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return this.usersClient.send(PATTERNS.USER_DELETE, { id });
  }
}
