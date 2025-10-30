import { Controller, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { IResponse } from '../../common/types';
import { handleCatch } from '../../common/handleCatch';
import { RoleUseCaseImpl } from './role.useCase.impl';
import { PATTERNS } from '../../contracts';
import { RoleCreateDto, RoleUpdateDto } from './role.entity';
import { ListQueryDto } from '../../common/query/query.dto';
import { CheckPermission } from '../../common/decorator/check-permission.decorator';
import { PermissionGuard } from '../../common/permission.guard';
import { PermissionActions } from '../../contracts/permission-actions.enum';
import { RateLimitGuard } from '../../common/rate-limit.guard';

@Controller()
export class RoleMessageController {
  constructor(private readonly usecases: RoleUseCaseImpl) {}

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Role', PermissionActions.CREATE)
  @MessagePattern(PATTERNS.ROLE_CREATE)
  async createRole(@Payload() payload: { data: RoleCreateDto }) {
    const result = await this.usecases.createRole(payload.data);
    return IResponse.success('Role created successfully', result);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Role', PermissionActions.READ)
  @MessagePattern(PATTERNS.ROLE_FIND_BY_ID)
  async findRole(@Payload() payload: { id: string }) {
    const result = await this.usecases.findRole(payload.id);
    return IResponse.success('Role fetched successfully', result);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Role', PermissionActions.READ)
  @MessagePattern(PATTERNS.ROLE_FIND_ALL)
  async getAllRoles(
    @Payload()
    payload: {
      query: ListQueryDto;
      headers: { authorization: string };
    },
  ) {
    const user = payload.headers;
    const result = await this.usecases.findAllRoles(payload.query);
    return IResponse.success(
      'Roles fetched successfully',
      result.roles,
      result.pagination,
    );
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Role', PermissionActions.DELETE)
  @MessagePattern(PATTERNS.ROLE_DELETE)
  async deleteRole(@Payload() payload: { id: string }) {
    const result = await this.usecases.deleteRole(payload.id);
    return IResponse.success('Role deleted successfully', result);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Role', PermissionActions.UPDATE)
  @MessagePattern(PATTERNS.ROLE_UPDATE)
  async updateRole(@Payload() payload: { id: string; data: RoleUpdateDto }) {
    const result = await this.usecases.updateRole(payload.id, payload.data);
    return IResponse.success('Role updated successfully', result);
  }
}
