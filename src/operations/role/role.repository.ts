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

  async findAllRoles(
    page: number,
    pageSize: number,
    search: string,
  ): Promise<{ roles: Partial<Role>[]; pagination: IPagination }> {
    const skip = (page - 1) * pageSize;
    const where: any = {};

    if (search) {
      where.OR = [{ name: { contains: search, mode: 'insensitive' } }];
    }

    const [roles, total] = await Promise.all([
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

  async deleteByName(name: string): Promise<string> {
    const role = await this.prisma.role.findUnique({ where: { name } });
    if (!role) {
      throw new Error('Role not found');
    }
    const result = await this.prisma.role.delete({ where: { name } });
    if (result) {
      console.log(
        'Role deleted successfully with id: ' +
          result.id +
          ' and name: ' +
          result.name +
          'and result is: ' +
          result,
      );
    } else {
      console.log('this is result : ', result);
    }
    return 'Role deleted successfully with name: ' + name;
  }

  async deleteById(id: string): Promise<string> {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) {
      throw new Error('Role not found');
    }
    const result = await this.prisma.role.delete({ where: { id } });
    if (result) {
      console.log(
        'Role deleted successfully with id: ' +
          result.id +
          ' and name: ' +
          result.name +
          'and result is: ' +
          result,
      );
    } else {
      console.log('this is result : ', result);
    }
    return 'Role deleted successfully with id: ' + id;
  }

  async updateRole(id: string, data: RoleUpdateDto): Promise<Role> {
    return this.prisma.role.update({ where: { id }, data });
  }
}
