import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { RoleCreateDto, RoleUpdateDto } from './role.entity';
import { RoleUseCases } from './role.useCase';
import { IPagination } from '../../common/types';
import { RoleRepository } from './role.repository';
import { RpcException } from '@nestjs/microservices';
import { ListQueryDto } from '../../common/query/query.dto';

@Injectable()
export class RoleUseCaseImpl implements RoleUseCases {
  constructor(private readonly roleRepo: RoleRepository) {}

  async createRole(data: RoleCreateDto): Promise<Role> {
    return this.roleRepo.createRole(data);
  }
  async findRole(id: string): Promise<Role> {

      return this.roleRepo.findRolById(id);

  }
  async findAllRoles(query: ListQueryDto) {
    return await this.roleRepo.findAllRoles(query);
  }

  async deleteRole(id: string): Promise<string> {
    console.log('payload: ', id);

      const role = await this.roleRepo.findRolById(id);
      if (!role) throw new RpcException(`Role ${id} not found`);

      await this.roleRepo.deleteById(id);
      return `Role deleted successfully with id: ${id}`;
    
  }

  async updateRole(id: string, data: RoleUpdateDto): Promise<Role> {
    return this.roleRepo.updateRole(id, data);
  }
}
