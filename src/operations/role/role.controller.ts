import { BadRequestException, Controller, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { IResponse } from '../../common/types';
import { handleCatch } from '../../common/handleCatch';
import { Public } from '../../common/decorator/public.decorator';
import { RoleUseCaseImpl } from './role.useCase.impl';
import { PATTERNS } from '../../contracts';
import { RoleCreateDto, RoleUpdateDto } from './role.entity';
import { ListQueryDto } from '../../common/query/query.dto';
import { CheckPermission } from '../../common/decorator/check-permission.decorator';
import { PermissionGuard } from '../../common/permission.guard';
import { PermissionActions } from '../../contracts/permission-actions.enum';
import { RoleDto } from '../acl/access_control.entity';

@Controller()
export class RoleMessageController {
  constructor(private readonly usecases: RoleUseCaseImpl) {}

  @UseGuards(PermissionGuard)
  @CheckPermission('Role', PermissionActions.CREATE)
  // @Public()
  @MessagePattern(PATTERNS.ROLE_CREATE)
  async createRole(@Payload() payload: { data: RoleCreateDto }) {
    try {
      console.log(
        '-----------------------------------------------------------------',
      );
      return this.usecases.createRole(payload.data);
    } catch (error) {
      handleCatch(error);
    }
  }

  @UseGuards(PermissionGuard)
  @CheckPermission('Role', PermissionActions.READ)
  // @Public()
  @MessagePattern(PATTERNS.ROLE_FIND_BY_ID)
  async findRole(@Payload() payload: { id: string }) {
    console.log('payload: ', payload.id);

    try {
      return this.usecases.findRole(payload.id);
    } catch (error) {}
  }

  @UseGuards(PermissionGuard)
  @CheckPermission('Role', PermissionActions.READ)
  // @Public()
  @MessagePattern(PATTERNS.ROLE_FIND_ALL)
  async getAllRoles(
    @Payload()
    payload: {
      query: ListQueryDto;
      headers: { authorization: string };
    },
  ) {
    try {
      const user = payload.headers;
      console.log('Current user:', user);

      // const { page = 1, pageSize = 10, search } = data;

      const result = await this.usecases.findAllRoles(payload.query);

      return IResponse.success(
        'Roles fetched successfully',
        result.roles,
        result.pagination,
      );
      return;
    } catch (error) {
      handleCatch(error);
    }
  }

  @UseGuards(PermissionGuard)
  @CheckPermission('Role', PermissionActions.DELETE)
  // @Public()
  @MessagePattern(PATTERNS.ROLE_DELETE)
  async deleteRole(@Payload() payload: { id: string }) {
    console.log('payload: ', payload);
    try {
      // const { id, name } = payload.data;
      return this.usecases.deleteRole(payload.id);
    } catch (error) {
      handleCatch(error);
    }
  }

  @UseGuards(PermissionGuard)
  @CheckPermission('Role', PermissionActions.UPDATE)
  // @Public()
    @MessagePattern(PATTERNS.ROLE_UPDATE)
    async updateRole(@Payload() payload: { id: string; data: RoleUpdateDto}) {
      try {
        console.log('payload: ', payload);
        
        const result = await this.usecases.updateRole(payload.id, payload.data);
        return IResponse.success('Role updated successfully');
      } catch (error) {
        handleCatch(error);
      }
    }
}
