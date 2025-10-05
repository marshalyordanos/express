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
  async createRole(@Body() data: RoleCreateDto, @Req() req) {
    const authHeader = req.headers['authorization'] || null;
    return this.roleClient.send(PATTERNS.ROLE_CREATE, {
      data,
      headers: { authorization: authHeader },
    });
  }

  //completed
  @Patch(':id')
  async updateRole(
    @Param('id') id: string,
    @Body() dto: RoleUpdateDto,
    @Req() req,
  ) {
    console.log('data: ', dto);
    console.log('id: ', id);
    
    const authHeader = req.headers['authorization'] || null;
    return this.roleClient.send(PATTERNS.ROLE_UPDATE, {
      id,
      data: dto,
      headers: { authorization: authHeader },
    });
  }

  //completed
  @Get()
  async getAllRoles(@Req() req, @Query() query: ListQueryDto) {
    const authHeader = req.headers['authorization'] || null;

    return this.roleClient.send(PATTERNS.ROLE_FIND_ALL, {
      headers: { authorization: authHeader },
      query,
    });
  }

  //completed
  @Get(':id')
  async getRole(@Param('id') id: string, @Req() req) {
    const authHeader = req.headers['authorization'] || null;
    // Check if the identifier is an ID or name
    // const isName = /^[A-Z]+$/.test(identifier);
    // const isId = /^[a-z0-9]{24,25}$/.test(identifier);
    // const payload = isId ? { id: identifier } : { name: identifier };

    console.log('payload: ', id);
    
    return this.roleClient.send(PATTERNS.ROLE_FIND_BY_ID, {
      id,
      headers: { authorization: authHeader },
    });
  }

  //completed
  @Delete(':id')
  async deleteRole(@Param('id') id: string, @Req() req) {
    // Check if the identifier is an ID or name
    // const isName = /^[A-Z]+$/.test(identifier);
    // const isId = /^[a-z0-9]{24,25}$/.test(identifier);
    const authHeader = req.headers['authorization'] || null;

    // Create payload based on whether it's an ID or name
    // const data = isId ? { id: identifier } : { name: identifier };
    // console.log('payload: ', data);
    
    return this.roleClient.send(PATTERNS.ROLE_DELETE, {
      id,
      headers: { authorization: authHeader },
    });
  }
}
