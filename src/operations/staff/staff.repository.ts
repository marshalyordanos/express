import { Injectable } from '@nestjs/common';
import { User, Prisma, Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UserDto } from '../user/user.entity';
import { UpdateStaffDto } from './staff.entity';
import { ListQueryDto } from '../../common/query/query.dto';
import { PrismaQueryFeature } from '../../common/query/prisma-query-feature';

@Injectable()
export class StaffRepository {
  constructor(private prisma: PrismaService) {}

  async changeUserRole(userId: string, role: Role): Promise<Partial<User>> {
    // Update user with new role
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        role: { connect: { id: role.id } },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        emailVerified: true,
        role: {
          select: { id: true, name: true },
        },
        createdBy: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findStaffByEmailAndPhone(
    email: string,
    phone: string,
  ): Promise<{ existingEmailStaff: any; existingStaffPhone: any }> {
    const [existingEmailStaff, existingStaffPhone] = await Promise.all([
      this.prisma.user.findUnique({ where: { email } }),
      this.prisma.user.findUnique({ where: { phone } }),
    ]);

    return { existingEmailStaff, existingStaffPhone };
  }

  async findRoleById(roleId: string) {
    return this.prisma.role.findUnique({
      where: { id: roleId },
    });
  }
  async createStaff(data: UserDto, userId: string): Promise<User> {
    // Transform DTO into Prisma create input
    const prismaData: Prisma.UserCreateInput = {
      name: data.name,
      email: data.email,
      password: data.password,
      phone: data.phone,
      isStaff: true,
      role: data.role ? { connect: { id: data.role } } : undefined, // relation
      branch: data.branchId ? { connect: { id: data.branchId } } : undefined,
      createdBy: userId,
    };

    return this.prisma.user.create({
      data: prismaData,
    });
  }

  async findRoleByName(roleName: string) {
    return this.prisma.role.findUnique({ where: { name: roleName } });
  }
  async findBranchById(branchId: string) {
    return this.prisma.branch.findUnique({ where: { id: branchId } });
  }

  async findStaffByRole(roleId: string, payload: ListQueryDto) {
    const feature = new PrismaQueryFeature({
      search: payload.search,
      filter: payload.filter,
      sort: payload.sort,
      page: payload.page,
      pageSize: payload.pageSize,
      searchableFields: ['name', 'email', 'phone'],
    });
    const query = feature.getQuery();
    // Merge roleId condition with query.where
    const where = {
      ...query.where,
      roleId, // 🔹 ensures we filter only staff with this roleId
    };
    const results = await Promise.all([
      this.prisma.user.findMany({
        ...query,
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          emailVerified: true,
          role: {
            select: { id: true, name: true },
          },
          branch: {
            select: { id: true, name: true },
          },
          createdBy: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.user.count({
        where: {
          ...query.where, // from PrismaQueryFeature
          ...where, // additional filters (e.g., isStaff)
        },
      }),
    ]);

    const Staffs = results[0] || [];
    const total = results[1] || 0;

    return {
      Staffs,
      pagination: feature.getPagination(total),
    };
  }
  async findUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
      include: { role: true, branch: true },
    });
  }
  async deleteStaff(id: string) {
    return await this.prisma.user.delete({ where: { id } });
  }
  async findStaffById(id: string) {
    return await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        emailVerified: true,
        role: {
          select: { id: true, name: true },
        },
        branch: {
          select: { id: true, name: true },
        },
        createdBy: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
  async findAllStaff(payload: ListQueryDto) {
    const feature = new PrismaQueryFeature({
      search: payload.search,
      filter: payload.filter,
      sort: payload.sort,
      page: payload.page,
      pageSize: payload.pageSize,
      searchableFields: ['name', 'email', 'phone'],
    });

    const query = feature.getQuery();

    console.log('Query to be queried : ', query);

    // 🔹 Optimize: select only needed fields instead of deleting later
    const [Staffs, total] = await Promise.all([
      this.prisma.user.findMany({
        ...query,
        where: {
          ...query.where,
          isStaff: true, // optional: filter only staff
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          emailVerified: true,
          role: {
            select: { id: true, name: true },
          },
          branch: {
            select: { id: true, name: true },
          },
          createdBy: true,
          createdAt: true,
          updatedAt: true,
        },
      }),

      this.prisma.user.count({
        where: {
          ...query.where,
          isStaff: true,
        },
      }),
    ]);

    return {
      Staffs,
      pagination: feature.getPagination(total),
    };
  }

  async updateStaff(id: string, data: UpdateStaffDto) {
    return await this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        createdBy: true,
      },
    });
  }

  async findStaffByBranch(payload: ListQueryDto, branchId: string) {
    const feature = new PrismaQueryFeature({
      search: payload.search,
      filter: payload.filter,
      sort: payload.sort,
      page: payload.page,
      pageSize: payload.pageSize,
      searchableFields: ['name', 'email', 'phone'],
    });

    const query = feature.getQuery();
    console.log('query: ', query);

    // Merge roleId condition with query.where
    const where = {
      ...query.where,
      branchId, // 🔹 ensures we filter only staff with this roleId
    };

    const results = await Promise.all([
      this.prisma.user.findMany({
        ...query,
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          emailVerified: true,
          role: {
            select: { id: true, name: true },
          },
          branch: {
            select: { id: true, name: true },
          },
          createdBy: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    const Staffs = results[0] || [];
    const total = results[1] || 0;
    return {
      Staffs,
      pagination: feature.getPagination(total),
    };
  }

  async assignStaffToBranch(staffIds: string[], branchId: string) {
    return await this.prisma.user.updateMany({
      where: { id: { in: staffIds } },
      data: { branchId },
    });
  }
}
