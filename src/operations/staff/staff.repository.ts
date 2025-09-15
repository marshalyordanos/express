import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { User, Prisma } from '@prisma/client';
import { IPagination } from 'src/common/types';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChangeRoleDto, UserDto } from '../user/user.entity';
import { UpdateStaffDto } from './staff.entity';

@Injectable()
export class StaffRepository {

  constructor(private prisma: PrismaService) {}

  async changeUserRole(data: ChangeRoleDto): Promise<User> {
    // Find user
    const user = await this.prisma.user.findUnique({
      where: { id: data.userId },
    });

    if (!user) {
      throw new BadRequestException(`User with id ${data.userId} not found`);
    }

    // Find role
    const role = await this.prisma.role.findUnique({
      where: { name: data.role },
    });

    if (!role) {
      throw new BadRequestException(`Role ${data.role} not found`);
    }

    // Update user with new role
    return this.prisma.user.update({
      where: { id: data.userId },
      data: {
        role: { connect: { id: role.id } },
      },
      include: {
        role: true, // optional: return updated role info
        branch: true, // optional: return branch info if relevant
      },
    });
  }

  async createStaff(
    data: UserDto,
    email: string,
    roleId: string,
  ): Promise<User> {
    // Check if the requester is a SUPER_ADMIN
    const isAdmin = await this.prisma.user.findUnique({
      where: { email },
      include: { role: true }, // Include role details
    });

    if (!isAdmin) {
      Logger.error(
        `Admin not found for email: ${email}`,
        undefined,
        'UserRepository',
      );
      throw new BadRequestException('Admin not found');
    }

    if (isAdmin.role.name !== 'SUPER_ADMIN') {
      Logger.error(
        `User ${email} is not a SUPER_ADMIN`,
        undefined,
        'UserRepository',
      );
      throw new BadRequestException('Only Super Admin can create staff');
    }

    const userExists = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (userExists) {
      throw new BadRequestException('User already exists');
    }

    if (data.branchId) {
        const branch = await this.prisma.branch.findUnique({
          where: { id: data.branchId },
        })
        
        if (!branch) {
            throw new BadRequestException('Branch not found');
        }
    }

    // Transform DTO into Prisma create input
    const prismaData: Prisma.UserCreateInput = {
      name: data.name,
      email: data.email,
      password: data.password,
      phone: data.phone,
      isStaff: true,
      role: { connect: { id: roleId } }, // relation
      branch: data.branchId ? { connect: { id: data.branchId } } : undefined,
    };

    return this.prisma.user.create({
      data: prismaData,
    });
  }

  async findRoleByName(roleName: string) {
    return this.prisma.role.findUnique({ where: { name: roleName } });
  }

  async findStaffByRole(data: any): Promise<{
    users: Partial<User>[];
    pagination: IPagination;
  }> {
    const { page = 1, pageSize = 10, role } = data;

    const skip = (page - 1) * pageSize;
    console.log('roleName: ', role);

    // Check role existence
    const roles = await this.prisma.role.findUnique({
      where: { name: role },
    });

    if (!role) {
      throw new Error(`Invalid role: ${role}`);
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: pageSize,
        where: {
          roleId: roles.id,
        },
        include: {
          role: true,
          branch: true,
        },
      }),
      this.prisma.user.count({ where: { roleId: roles.id } }),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    return {
      users,
      pagination: {
        total,
        page,
        pageSize,
        totalPages,
      },
    };
  }
  async findUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
      include: { role: true, branch: true },
    });
  }
  async deleteStaff(id: string) {
    await this.prisma.user.delete({ where: { id } });

    return 'User deleted successfully with id: ' + id;
  }
  async findStaffById(id: string) {
    const result= await this.prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
        branch: true,
      },
    });
    if (!result) {
        throw new Error('User not found');
    }
    return result;
  }
  async findAllStaff(
    data: any,
  ): Promise<{ users: Partial<User>[]; pagination: IPagination }> {
    const { page = 1, pageSize = 10, search } = data;

    const skip = (page - 1) * pageSize;

    // Dynamic filters
    const where: any = {
      isStaff: true, //  filter only staff
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: pageSize,
        where,
        include: {
          role: true,
          branch: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    return {
      users,
      pagination: {
        total,
        page,
        pageSize,
        totalPages,
      },
    };
  }

  async updateStaff(id: string, data: UpdateStaffDto) {
    return await this.prisma.user.update({ where: { id }, data });
  }

   async findStaffByBranch(data: any): Promise< { staffs: Partial<User>[]; pagination: IPagination; } > {
      const { page = 1, pageSize = 10, branchId, search } = data;

      const skip= (page - 1) * pageSize;

      const where: any = {
        isStaff: true, 
        branchId,
      };

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [staffs, total] = await Promise.all([
        this.prisma.user.findMany({
          skip,
          take: pageSize,
          where,
          include: {
            role: true,
            branch: true,
          },
        }),
        this.prisma.user.count({ where }),
      ]);

      const totalPages = Math.ceil(total / pageSize);

      return {
        staffs,
        pagination: {
          total,
          page,
          pageSize,
          totalPages,
        },
      };
  }

async assignStaffToBranch(staffIds: string[], branchId: string) {
  return await this.prisma.user.updateMany({
    where: {
      id: { in: staffIds },
    },
    data: { branchId },
  });
}

}
