import { Controller, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PATTERNS } from '../../contracts';
import { AccessControlUsecaseImpl } from './access_control.usecase.impl';
import {
  PermissionDto,
  RoleDto,
  ChangeRolePermissionDto,
  PermissionActionDto,
  AssignUserRoleDto,
} from './access_control.entity';
import { IResponse } from '../../common/types';
import { handleCatch } from '../../common/handleCatch';
import { CheckPermission } from '../../common/decorator/check-permission.decorator';
import { PermissionGuard } from '../../common/permission.guard';
import {
  PermissionActions,
  ScopeAction,
} from '../../contracts/permission-actions.enum';
import { RateLimitGuard } from '../../common/rate-limit.guard';
import { Public } from '../../common/decorator/public.decorator';
import { ListQueryDto } from '../../common/query/query.dto';

@Controller()
export class AccessControlMessageController {
  constructor(private readonly usecases: AccessControlUsecaseImpl) {}

  // ----------- ROLES -----------

  // @UseGuards(PermissionGuard, RateLimitGuard)
  // @CheckPermission('Role', PermissionActions.READ)
  @Public()
  @MessagePattern(PATTERNS.ROLE_FIND_BY_ID)
  async findRoleById(@Payload() payload: { id: string }) {
    const result = await this.usecases.getRole(payload.id);
    return IResponse.success('Role fetched successfully', result);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Role', PermissionActions.READ)
  @MessagePattern(PATTERNS.ROLE_FIND_ALL)
  async findAllRoles(@Payload() payload: any) {
    const { page = 1, pageSize = 10, search } = payload;
    const result = await this.usecases.getAllRoles(page, pageSize, search);
    return IResponse.success(
      'Roles fetched successfully',
      result.roles,
      result.pagination,
    );
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Role', PermissionActions.CREATE)
  @MessagePattern(PATTERNS.ROLE_CREATE)
  async createRole(@Payload() payload: { data: Partial<RoleDto> }) {
    const result = await this.usecases.createRole(payload.data);
    return IResponse.success('Role created successfully', result);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Role', PermissionActions.UPDATE)
  @MessagePattern(PATTERNS.ROLE_UPDATE)
  async updateRole(@Payload() payload: { id: string; data: Partial<RoleDto> }) {
    const result = await this.usecases.updateRole(payload.id, payload.data);
    return IResponse.success('Role updated successfully', result);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Role', PermissionActions.DELETE)
  @MessagePattern(PATTERNS.ROLE_DELETE)
  async deleteRole(@Payload() payload: { id: string }) {
    const result = await this.usecases.deleteRole(payload.id);
    return IResponse.success('Role deleted successfully', result);
  }

  @Public()
  @MessagePattern(PATTERNS.ROLE_FIND_ALL_FREE)
  async getAllRolesFree(
    @Payload()
    payload: {
      query: ListQueryDto;
    },
  ) {
    const result = await this.usecases.findAllRoles(payload.query);
    return IResponse.success(
      'Roles fetched successfully',
      result.roles,
      result.pagination,
    );
  }

  // ----------- PERMISSIONS -----------

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Permission', PermissionActions.READ)
  @MessagePattern(PATTERNS.PERMISSION_FIND_BY_ID)
  async findPermissionById(@Payload() payload: { id: string }) {
    const result = await this.usecases.getPermission(payload.id);
    return IResponse.success('Permission fetched successfully', result);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Permission', PermissionActions.READ)
  @MessagePattern(PATTERNS.PERMISSION_FIND_ALL)
  async findAllPermissions(@Payload() payload: any) {
    const { page = 1, pageSize = 10, search } = payload;
    const result = await this.usecases.getAllPermissions(
      page,
      pageSize,
      search,
    );
    return IResponse.success(
      'Permissions fetched successfully',
      result.permissions,
      result.pagination,
    );
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Permission', PermissionActions.CREATE)
  @MessagePattern(PATTERNS.PERMISSION_CREATE)
  async createPermission(@Payload() payload: { data: PermissionDto }) {
    const result = await this.usecases.createPermission(payload.data);
    return IResponse.success('Permission created successfully', result);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Permission', PermissionActions.UPDATE)
  @MessagePattern(PATTERNS.PERMISSION_UPDATE)
  async updatePermission(
    @Payload() payload: { id: string; data: Partial<PermissionDto> },
  ) {
    const result = await this.usecases.updatePermission(
      payload.id,
      payload.data,
    );
    return IResponse.success('Permission updated successfully', result);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Permission', PermissionActions.DELETE)
  @MessagePattern(PATTERNS.PERMISSION_DELETE)
  async deletePermission(@Payload() payload: { id: string }) {
    const result = await this.usecases.deletePermission(payload.id);
    return IResponse.success('Permission deleted successfully', result);
  }

  // ----------- ROLE ↔ PERMISSION -----------

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('PermissionRole', PermissionActions.CREATE)
  @MessagePattern(PATTERNS.ROLE_ASSIGN_PERMISSIONS)
  async assignPermissionsToRole(
    @Payload() payload: { data: ChangeRolePermissionDto },
  ) {
    const result = await this.usecases.assignPermissionsToRole(payload.data);
    return IResponse.success(
      'Permissions assigned to role successfully',
      result,
    );
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('PermissionRole', PermissionActions.UPDATE)
  @MessagePattern(PATTERNS.ROLE_UPDATE_PERMISSION)
  async updatePermissionFromRole(
    @Payload()
    payload: {
      roleId: string;
      data: PermissionActionDto;
    },
  ) {
    const result = await this.usecases.updatedPermissionFromRole(
      payload.roleId,
      payload.data,
    );
    return IResponse.success(
      'Permission updated from role successfully',
      result,
    );
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('PermissionRole', PermissionActions.DELETE)
  @MessagePattern(PATTERNS.ROLE_REMOVE_PERMISSION)
  async removePermissionFromRole(
    @Payload()
    payload: {
      roleId: string;
      permissionId: string;
    },
  ) {
    const result = await this.usecases.removePermissionFromRole(
      payload.roleId,
      payload.permissionId,
    );
    return IResponse.success(
      'Permission removed from role successfully',
      result,
    );
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('PermissionRole', PermissionActions.CREATE)
  @MessagePattern(PATTERNS.ROLE_ASSIGN_USER)
  async assignUserRole(@Payload() payload: { data: AssignUserRoleDto }) {
    const result = await this.usecases.assignRoleToUser(
      payload.data.userId,
      payload.data.roleId,
    );
    return IResponse.success('Role assigned to user successfully', result);
  }
}
