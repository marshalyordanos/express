import { ListQueryDto } from '../../common/query/query.dto';
import { IPagination } from '../../common/types';
import { RoleCreateDto, RoleUpdateDto } from './role.entity';
import { Role } from '@prisma/client';

export interface RoleUseCases {
  createRole(data: RoleCreateDto): Promise<Role>;
  findRole(id: string): Promise<Role>;
  findAllRoles(payload: ListQueryDto): Promise<{ roles: Partial<Role>[]; pagination: IPagination }>;
  deleteRole(id: string): Promise<string>;
  updateRole(id: string, data: RoleUpdateDto): Promise<Role>;
}
