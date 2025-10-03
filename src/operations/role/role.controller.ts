import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { IResponse } from '../../common/types';
import { handleCatch } from '../../common/handleCatch';
import { Public } from '../../common/decorator/public.decorator';
import { RoleUseCaseImpl } from './role.useCase.impl';
import { PATTERNS } from '../../contracts';
import { RoleCreateDto, RoleUpdateDto } from './role.entity';
import { ListQueryDto } from '../../common/query/query.dto';

@Controller()
export class RoleMessageController {
  constructor(private readonly usecases: RoleUseCaseImpl) {}
  @Public()
  @MessagePattern(PATTERNS.ROLE_CREATE)
  async createRole(@Payload() data: RoleCreateDto) {
    try {
      console.log(
        '-----------------------------------------------------------------',
      );
      return this.usecases.createRole(data);
    } catch (error) {
      handleCatch(error);
    }
  }

  @Public()
  @MessagePattern(PATTERNS.ROLE_FIND_BY_ID_OR_NAME)
  async findRole(@Payload() payload: { id?: string; name?: string }) {
    try {
      return this.usecases.findRole(payload);
    } catch (error) {}
  }

  @Public()
  @MessagePattern(PATTERNS.ROLE_FIND_ALL)
  async getAllRoles(@Payload() payload: { query: ListQueryDto , headers: { authorization: string } }) {
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

  @Public()
  @MessagePattern(PATTERNS.ROLE_DELETE)
  async deleteRole(@Payload() payload: { id?: string; name?: string }) {
    try {
      return this.usecases.deleteRole(payload);
    } catch (error) {
      handleCatch(error);
    }
  }

  @Public()
  @MessagePattern(PATTERNS.ROLE_UPDATE)
  async updateRole(@Payload() payload: { id: string; data: RoleUpdateDto }) {
    console.log(
      'Updating role with id: ' + payload.id + ' and data: ' + payload.data,
    );

    try {
      return this.usecases.updateRole(payload.id, payload.data);
    } catch (error) {
      handleCatch(error);
    }
  }
}
