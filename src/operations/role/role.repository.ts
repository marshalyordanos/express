import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RoleCreateDto, RoleUpdateDto } from './role.entity';
import { Role } from '@prisma/client';
import { IPagination } from '../../common/types';

@Injectable()
export class RoleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createRole(data: RoleCreateDto): Promise<Role> {
    return this.prisma.role.create({ data });
  }

  async findRoleByName(name: string): Promise<Role> {
    return this.prisma.role.findUnique({ where: { name } });
  }
  async findRolById(id: string): Promise<Role> {
    return this.prisma.role.findUnique({ where: { id } });
  }

  async findAllRoles(skip: number, pageSize: number, where: any) {
    return await Promise.all([
      this.prisma.role.findMany({
        skip,
        take: pageSize,
        where,
        select: {
          id: true,
          name: true,
          description: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.role.count({ where }),
    ]);
  }

  async deleteByName(name: string) {
    return await this.prisma.role.delete({ where: { name } });
  }

  async deleteById(id: string) {
    return await this.prisma.role.delete({ where: { id } }); 
  }

  async updateRole(id: string, data: RoleUpdateDto): Promise<Role> {
    return this.prisma.role.update({ where: { id }, data });
  }
}
