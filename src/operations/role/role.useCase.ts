import { IPagination } from 'src/common/types';
import { RoleCreateDto, RoleUpdateDto } from './role.entity';
import { Role } from '@prisma/client';

export interface RoleUseCases {
  createRole(data: RoleCreateDto): Promise<Role>;
  findRole(payload: { id?: string; name?: string }): Promise<Role>;
  findAllRoles(
    page: number,
    pageSize: number,
    search?: string,
  ): Promise<{ roles: Partial<Role>[]; pagination: IPagination }>;
  deleteRole(payload: { id?: string; name?: string }): Promise<string>;
  updateRole(id: string, data: RoleUpdateDto): Promise<Role>;
}
