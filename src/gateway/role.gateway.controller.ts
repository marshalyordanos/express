import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';

import { ClientProxy } from '@nestjs/microservices';
import { PATTERNS } from '../contracts';
import { RoleCreateDto, RoleUpdateDto } from '../operations/role/role.entity';
import { ListQueryDto } from '../common/query/query.dto';
import * as jwt from 'jsonwebtoken';
import { SanitizePipe } from '../common/sanitize.pipe';

@Controller('roles')
export class RoleGatewayController {
  constructor(
    @Inject('USER_SERVICE') private readonly roleClient: ClientProxy,
  ) {}

  //completed
  @Post()
  async createRole(@Body() data: RoleCreateDto, @Req() req) {
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
    return this.roleClient.send(PATTERNS.ROLE_CREATE, {
      data,
      headers: { authorization: authHeader },
      user: decodedUser, // ✅ send user info
      ip,
    });
  }

  //completed
  @Patch(':id')
  async updateRole(
    @Param('id') id: string,
    @Body() dto: RoleUpdateDto,
    @Req() req,
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
    return this.roleClient.send(PATTERNS.ROLE_UPDATE, {
      id,
      data: dto,
      headers: { authorization: authHeader },
      user: decodedUser, // ✅ send user info
      ip,
    });
  }

  //completed
  @Get()
  async getAllRoles(@Req() req, @Query() query: ListQueryDto) {
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

    return this.roleClient.send(PATTERNS.ROLE_FIND_ALL, {
      headers: { authorization: authHeader },
      user: decodedUser, // ✅ send user info
      ip,
      query,
    });
  }

  //completed
  @Get(':id')
  async getRole(@Param('id') id: string, @Req() req) {
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
    // Check if the identifier is an ID or name
    // const isName = /^[A-Z]+$/.test(identifier);
    // const isId = /^[a-z0-9]{24,25}$/.test(identifier);
    // const payload = isId ? { id: identifier } : { name: identifier };

    console.log('payload: ', id);

    return this.roleClient.send(PATTERNS.ROLE_FIND_BY_ID, {
      id,
      headers: { authorization: authHeader },
      user: decodedUser, // ✅ send user info
      ip,
    });
  }

  //completed
  @Delete(':id')
  async deleteRole(@Param('id') id: string, @Req() req) {
    // Check if the identifier is an ID or name
    // const isName = /^[A-Z]+$/.test(identifier);
    // const isId = /^[a-z0-9]{24,25}$/.test(identifier);
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
    return this.roleClient.send(PATTERNS.ROLE_DELETE, {
      id,
      headers: { authorization: authHeader },
      user: decodedUser, // ✅ send user info
      ip,
    });
  }
}
