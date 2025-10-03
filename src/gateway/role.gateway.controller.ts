import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  Search,
} from '@nestjs/common';

import { ClientProxy } from '@nestjs/microservices';
import { PATTERNS } from '../contracts';
import { RoleCreateDto, RoleUpdateDto } from '../operations/role/role.entity';
import { ListQueryDto } from '../common/query/query.dto';

@Controller('roles')
export class RoleGatewayController {
  constructor(
    @Inject('USER_SERVICE') private readonly roleClient: ClientProxy,
  ) {}

  //completed
  @Post()
  async createRole(@Body() data: RoleCreateDto) {
    return this.roleClient.send(PATTERNS.ROLE_CREATE, data);
  }

  //completed
  @Patch(':id')
  async updateRole(@Param('id') id: string, @Body() data: RoleUpdateDto) {
    return this.roleClient.send(PATTERNS.ROLE_UPDATE, {
      id,
      data: { ...data },
    });
  }

  //completed
  @Get()
  async getAllRoles(
    @Req() req, @Query() query: ListQueryDto
  ) {
    const authHeader = req.headers['authorization'] || null;

    return this.roleClient.send(PATTERNS.ROLE_FIND_ALL, {
      headers: { authorization: authHeader },
      query
    });
  }

  //completed
  @Get(':identifier')
  async getRole(@Param('identifier') identifier: string) {
    // Check if the identifier is an ID or name
    const isName = /^[A-Z]+$/.test(identifier);
    const isId = /^[a-z0-9]{24,25}$/.test(identifier);
    const payload = isId ? { id: identifier } : { name: identifier };

    return this.roleClient.send(PATTERNS.ROLE_FIND_BY_ID_OR_NAME, payload);
  }

  //completed
  @Delete(':identifier')
  async deleteRole(@Param('identifier') identifier: string) {
    // Check if the identifier is an ID or name
    const isName = /^[A-Z]+$/.test(identifier);
    const isId = /^[a-z0-9]{24,25}$/.test(identifier);

    // Create payload based on whether it's an ID or name
    const payload = isId ? { id: identifier } : { name: identifier };
    return this.roleClient.send(PATTERNS.ROLE_DELETE, payload);
  }
}
