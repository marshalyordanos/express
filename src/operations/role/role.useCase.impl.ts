import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { RoleCreateDto, RoleUpdateDto } from './role.entity';
import { RoleUseCases } from './role.useCase';
import { IPagination } from '../../common/types';
import { RoleRepository } from './role.repository';
import { RpcException } from '@nestjs/microservices';

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
    const skip = (page - 1) * pageSize;
    const where: any = {};

    if (search) {
      where.OR = [{ name: { contains: search, mode: 'insensitive' } }];
    }

    const [roles, total] = await this.roleRepo.findAllRoles(
      skip,
      pageSize,
      where,
    );

    const totalPages = Math.ceil(total / pageSize);

    return {
      roles,
      pagination: {
        total,
        page,
        pageSize,
        totalPages,
      },
    };
  }

 async deleteRole(payload: { id?: string; name?: string }): Promise<string> {
  console.log("payload: ", payload);

  if (payload.id) {
    const role = await this.roleRepo.findRolById(payload.id);
    if (!role) throw new RpcException(`Role ${payload.id} not found`);

    await this.roleRepo.deleteById(payload.id);
    return `Role deleted successfully with id: ${payload.id}`;
  }

  if (payload.name) {
    const role = await this.roleRepo.findRoleByName(payload.name);
    if (!role) throw new RpcException(`Role ${payload.name} not found`);

    await this.roleRepo.deleteByName(payload.name);
    return `Role deleted successfully with name: ${payload.name}`;
  }

  throw new RpcException('Invalid payload: Must provide either id or name');
}


  async updateRole(id: string, data: RoleUpdateDto): Promise<Role> {
    return this.roleRepo.updateRole(id, data);
  }
}
