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
  PreferencesDto,
  UpdateCorporateInfoDto,
  UserDto,
} from '../operations/user/user.entity';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { ListQueryDto } from '../common/query/query.dto';

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

  @Patch('preferences/:id')
  async updatePreferences(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: PreferencesDto,
  ) {
    const authHeader = req.headers['authorization'] || null;

    return this.usersClient.send(PATTERNS.PREFERENCES_UPDATE, {
      headers: { authorization: authHeader },
      userId: id,
      data: dto,
    });
  }

  @Patch('corporate-info/:id')
  async updateCorporateInfo(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: UpdateCorporateInfoDto,
  ) {
    const authHeader = req.headers['authorization'] || null;

    return this.usersClient.send(PATTERNS.CORPORATEINFO_UPDATE, {
      headers: { authorization: authHeader },
      userId: id,
      data: dto,
    });
  }

  // user
  @Get('addresses/:id')
  async findUser(@Param('id') id: string) {
    return this.usersClient.send(PATTERNS.USER_FIND_BY_ID, { id });
  }

  @Get()
  async findAll(@Req() req, @Query() query: ListQueryDto) {
    const authHeader = req.headers['authorization'] || null;
    console.log('=================: ', query);
    return this.usersClient.send(PATTERNS.USER_FIND_ALL, {
      headers: { authorization: authHeader },
      query,
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
