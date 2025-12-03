import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  Inject,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PATTERNS } from '../contracts';
import {
  PermissionDto,
  RoleDto,
  ChangeRolePermissionDto,
  PermissionActionDto,
  AssignUserRoleDto,
  RemovePermissionDto,
} from '../operations/acl/access_control.entity';
import * as jwt from 'jsonwebtoken';
import { ListQueryDto } from '../common/query/query.dto';


@Controller('access-control')
export class AccessControlGatewayController {
  constructor(
    @Inject('USER_SERVICE')
    private readonly accessClient: ClientProxy,
  ) {}

  // ------------ ROLES ------------
  @Get('roles/all')
  async findAllRole(@Req() req, @Query() query: ListQueryDto) {
    const forwarded = (req.headers['x-forwarded-for'] as string) || '';
    const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
    let decodedUser = null;
    return this.accessClient.send(PATTERNS.ROLE_FIND_ALL_FREE, {
      user: decodedUser,
      ip,
      query,
    });
  }
  
  @Get('roles/:id')
  async findRoleById(@Req() req, @Param('id') id: string) {
    const authHeader = req.headers['authorization'] || null;
    let token = req.headers['authorization']?.replace('Bearer ', '') || null;

    const forwarded = (req.headers['x-forwarded-for'] as string) || '';
    const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
    let decodedUser = null;
    try {
      decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
    } catch (err) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    return this.accessClient.send(PATTERNS.ROLE_FIND_BY_ID, {
      id,
      headers: { authorization: authHeader },
      user: decodedUser,
      ip,
    });
  }



  @Get('roles')
  async findAllRoles(
    @Req() req,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('search') search?: string,
  ) {
    const authHeader = req.headers['authorization'] || null;
    let token = req.headers['authorization']?.replace('Bearer ', '') || null;

    const forwarded = (req.headers['x-forwarded-for'] as string) || '';
    const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
    let decodedUser = null;
    try {
      decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
    } catch (err) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    return this.accessClient.send(PATTERNS.ROLE_FIND_ALL, {
      headers: { authorization: authHeader },
      user: decodedUser,
      ip,
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 10,
      search: search || null,
    });
  }

  @Post('roles')
  async createRole(@Req() req, @Body() dto: Partial<RoleDto>) {
    const authHeader = req.headers['authorization'] || null;
    let token = req.headers['authorization']?.replace('Bearer ', '') || null;

    const forwarded = (req.headers['x-forwarded-for'] as string) || '';
    const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
    let decodedUser = null;
    try {
      decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
    } catch (err) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    return this.accessClient.send(PATTERNS.ROLE_CREATE, {
      data: dto,
      headers: { authorization: authHeader },
      user: decodedUser,
      ip,
    });
  }

  @Patch('roles/:id')
  async updateRole(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: Partial<RoleDto>,
  ) {
    const authHeader = req.headers['authorization'] || null;
    let token = req.headers['authorization']?.replace('Bearer ', '') || null;

    const forwarded = (req.headers['x-forwarded-for'] as string) || '';
    const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
    let decodedUser = null;
    try {
      decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
    } catch (err) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    return this.accessClient.send(PATTERNS.ROLE_UPDATE, {
      id,
      data: dto,
      headers: { authorization: authHeader },
      user: decodedUser,
      ip,
    });
  }

  @Delete('roles/:id')
  async deleteRole(@Req() req, @Param('id') id: string) {
    const authHeader = req.headers['authorization'] || null;
    let token = req.headers['authorization']?.replace('Bearer ', '') || null;

    const forwarded = (req.headers['x-forwarded-for'] as string) || '';
    const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
    let decodedUser = null;
    try {
      decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
    } catch (err) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    return this.accessClient.send(PATTERNS.ROLE_DELETE, {
      id,
      headers: { authorization: authHeader },
      user: decodedUser,
      ip,
    });
  }

  // ------------ PERMISSIONS ------------

  @Get('permissions/:id')
  async findPermissionById(@Req() req, @Param('id') id: string) {
    const authHeader = req.headers['authorization'] || null;
    let token = req.headers['authorization']?.replace('Bearer ', '') || null;

    const forwarded = (req.headers['x-forwarded-for'] as string) || '';
    const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
    let decodedUser = null;
    try {
      decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
    } catch (err) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    return this.accessClient.send(PATTERNS.PERMISSION_FIND_BY_ID, {
      id,
      headers: { authorization: authHeader },
      user: decodedUser,
      ip,
    });
  }

  @Get('permissions')
  async findAllPermissions(
    @Req() req,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('search') search?: string,
  ) {
    const authHeader = req.headers['authorization'] || null;
    let token = req.headers['authorization']?.replace('Bearer ', '') || null;

    const forwarded = (req.headers['x-forwarded-for'] as string) || '';
    const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
    let decodedUser = null;
    try {
      decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
    } catch (err) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    return this.accessClient.send(PATTERNS.PERMISSION_FIND_ALL, {
      headers: { authorization: authHeader },
      user: decodedUser,
      ip,
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 10,
      search: search || null,
    });
  }

  @Post('permissions')
  async createPermission(@Req() req, @Body() dto: Partial<PermissionDto>) {
    const authHeader = req.headers['authorization'] || null;
    let token = req.headers['authorization']?.replace('Bearer ', '') || null;

    const forwarded = (req.headers['x-forwarded-for'] as string) || '';
    const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
    let decodedUser = null;
    try {
      decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
    } catch (err) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    return this.accessClient.send(PATTERNS.PERMISSION_CREATE, {
      data: dto,
      headers: { authorization: authHeader },
      user: decodedUser,
      ip,
    });
  }

  @Patch('permissions/:id')
  async updatePermission(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: Partial<PermissionDto>,
  ) {
    const authHeader = req.headers['authorization'] || null;
    let token = req.headers['authorization']?.replace('Bearer ', '') || null;

    const forwarded = (req.headers['x-forwarded-for'] as string) || '';
    const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
    let decodedUser = null;
    try {
      decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
    } catch (err) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    return this.accessClient.send(PATTERNS.PERMISSION_UPDATE, {
      id,
      data: dto,
      headers: { authorization: authHeader },
      user: decodedUser,
      ip,
    });
  }

  @Delete('permissions/:id')
  async deletePermission(@Req() req, @Param('id') id: string) {
    const authHeader = req.headers['authorization'] || null;
    let token = req.headers['authorization']?.replace('Bearer ', '') || null;

    const forwarded = (req.headers['x-forwarded-for'] as string) || '';
    const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
    let decodedUser = null;
    try {
      decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
    } catch (err) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    return this.accessClient.send(PATTERNS.PERMISSION_DELETE, {
      id,
      headers: { authorization: authHeader },
      user: decodedUser,
      ip,
    });
  }

  // ---------- ROLE ↔ PERMISSION ------------

  @Post('roles/permissions/assign')
  async assignPermissionsToRole(
    @Req() req,
    @Body() dto: ChangeRolePermissionDto,
  ) {
    const authHeader = req.headers['authorization'] || null;
    let token = req.headers['authorization']?.replace('Bearer ', '') || null;

    const forwarded = (req.headers['x-forwarded-for'] as string) || '';
    const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
    let decodedUser = null;
    try {
      decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
    } catch (err) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    return this.accessClient.send(PATTERNS.ROLE_ASSIGN_PERMISSIONS, {
      data: dto,
      headers: { authorization: authHeader },
      user: decodedUser,
      ip,
    });
  }

  @Post('roles/:roleId/permissions/remove')
  async removePermissionFromRole(
    @Req() req,
    @Param('roleId') roleId: string,
    @Body() dto: RemovePermissionDto,
  ) {
    const { permissionId } = dto;
    const authHeader = req.headers['authorization'] || null;
    let token = req.headers['authorization']?.replace('Bearer ', '') || null;

    const forwarded = (req.headers['x-forwarded-for'] as string) || '';
    const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
    let decodedUser = null;
    try {
      decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
    } catch (err) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    return this.accessClient.send(PATTERNS.ROLE_REMOVE_PERMISSION, {
      roleId,
      permissionId: permissionId,
      headers: { authorization: authHeader },
      user: decodedUser,
      ip,
    });
  }

  @Post('roles/:roleId/permissions/update')
  async updatePermissionFromRole(
    @Req() req,
    @Param('roleId') roleId: string,
    @Body()
    data: PermissionActionDto,
  ) {
    const authHeader = req.headers['authorization'] || null;
    let token = req.headers['authorization']?.replace('Bearer ', '') || null;

    const forwarded = (req.headers['x-forwarded-for'] as string) || '';
    const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
    let decodedUser = null;
    try {
      decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
    } catch (err) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    return this.accessClient.send(PATTERNS.ROLE_UPDATE_PERMISSION, {
      roleId,
      data: data,
      headers: { authorization: authHeader },
      user: decodedUser,
      ip,
    });
  }

  @Patch('assign-user-role')
  async assignUserRole(@Req() req, @Body() dto: AssignUserRoleDto) {
    const authHeader = req.headers['authorization'] || null;
    let token = req.headers['authorization']?.replace('Bearer ', '') || null;

    const forwarded = (req.headers['x-forwarded-for'] as string) || '';
    const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
    let decodedUser = null;
    try {
      decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
    } catch (err) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    return this.accessClient.send(PATTERNS.ROLE_ASSIGN_USER, {
      data: dto,
      headers: { authorization: authHeader },
      user: decodedUser,
      ip,
    });
  }
}
