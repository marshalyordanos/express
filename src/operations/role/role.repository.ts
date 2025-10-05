import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RoleCreateDto, RoleUpdateDto } from './role.entity';
import { Role } from '@prisma/client';
import { IPagination } from '../../common/types';
import { ListQueryDto } from '../../common/query/query.dto';
import { PrismaQueryFeature } from '../../common/query/prisma-query-feature';

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

  async findAllRoles(payload: ListQueryDto) {

        const feature = new PrismaQueryFeature({
          search: payload.search,
          filter: payload.filter,
          sort: payload.sort,
          page: payload.page,
          pageSize: payload.pageSize,
          searchableFields: ['name', 'description',],
        });
    
        const query = feature.getQuery();
        console.log('quest1: ', query);
    
        const results = await Promise.all([
          this.prisma.role.findMany({
            ...query,
    
            where: query.where || {},
            select: {
              id: true,
              name: true,
              description: true,
              createdAt: true,
              updatedAt: true,
            },
          }),
          this.prisma.role.count({ where: query.where || {} }),
        ])

        const roles = results[0] || [];
        const total = results[1] || 0;
    
        return {
          roles,
          pagination: feature.getPagination(total),
        }
  }

  async deleteByName(name: string) {
    return await this.prisma.role.delete({ where: { name } });
  }

  async deleteById(id: string) {
    return await this.prisma.role.delete({ where: { id } }); 
  }

  async updateRole(id: string, data: RoleUpdateDto): Promise<Role> {
    console.log("id and data", id, data);
    
    return this.prisma.role.update({ where: { id }, data });
  }
}
