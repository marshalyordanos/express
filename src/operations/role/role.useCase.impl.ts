import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { RoleCreateDto, RoleUpdateDto } from './role.entity';
import { RoleUseCases } from './role.useCase';
import { IPagination } from '../../common/types';
import { RoleRepository } from './role.repository';

@Injectable()
export class RoleUseCaseImpl implements RoleUseCases {
  constructor(private readonly roleRepo: RoleRepository) {}

  async createRole(data: RoleCreateDto): Promise<Role> {
    return this.roleRepo.createRole(data);
  }
  async findRole(payload: { id?: string; name?: string }): Promise<Role> {
    if (payload.id) {
      return this.roleRepo.findRolById(payload.id);
    } else if (payload.name) {
      return this.roleRepo.findRoleByName(payload.name);
    } else {
      return null;
    }
  }
  async findAllRoles(
    page: number,
    pageSize: number,
    search?: string,
  ): Promise<{ roles: Partial<Role>[]; pagination: IPagination }> {
    return this.roleRepo.findAllRoles(page, pageSize, search);
  }

  async deleteRole(payload: { id?: string; name?: string }): Promise<string> {
    if (payload.id) {
      return this.roleRepo.deleteById(payload.id);
    } else if (payload.name) {
      return this.roleRepo.deleteByName(payload.name);
    } else {
      return 'Invalid payload: Must provide either id or name';
    }
  }

  async updateRole(id: string, data: RoleUpdateDto): Promise<Role> {
    return this.roleRepo.updateRole(id, data);
  }
}
