import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ChangeRoleDto, UserDto } from './user.entity';
import { Prisma, User } from '@prisma/client';
import { IPagination } from 'src/common/types';
import { Role } from '../role/role.entity';

@Injectable()
export class UserRepository {

  constructor(private prisma: PrismaService) {}

  async findUserById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findAll(
    page: number,
    pageSize: number,
    search?: string,
    branchId?: number,
  ): Promise<{
    users: Partial<User>[];
    pagination: IPagination;
  }> {
    const skip = (page - 1) * pageSize;

    // Dynamic filters
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (branchId) {
      where.branchId = branchId;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: pageSize,
        where,
        select: {
          email: true,
          id: true,
          createdAt: true,
          emailVerified: true,
          branchId: true,
          name: true,
          phone: true,
          role: true,
          refreshTokens: true,
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

  async updateUser(id: string, data: Partial<UserDto>): Promise<User> {
    return null;
    // this.prisma.user.update({ where: { id }, data });
  }
  async deleteUser(id: string): Promise<User> {
    return this.prisma.user.delete({ where: { id: id } });
  }

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
      role: true,   // optional: return updated role info
      branch: true, // optional: return branch info if relevant
    },
  });
}


  async createStaff(data: UserDto, email: string, roleId: string): Promise<User> {
  // Check if the requester is a SUPER_ADMIN
  const isAdmin = await this.prisma.user.findUnique({
    where: { email },
    include: { role: true }, // Include role details
  });

  if (!isAdmin) {
    Logger.error(`Admin not found for email: ${email}`, undefined, 'UserRepository');
    throw new BadRequestException('Admin not found');
  }

  if (isAdmin.role.name !== 'SUPER_ADMIN') {
    Logger.error(`User ${email} is not a SUPER_ADMIN`, undefined, 'UserRepository');
    throw new BadRequestException('Only Super Admin can create staff');
  }

  const userExists = await this.prisma.user.findUnique({
    where: { email: data.email },
  });
  if (userExists) {
    throw new BadRequestException('User already exists');
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

async findStaffByRole(data: any):  Promise<{
    users: Partial<User>[];
    pagination: IPagination;
  }>  {
    const { page = 1, pageSize = 10, role } = data;

    const skip= (page - 1) * pageSize;
  console.log('roleName: ', role);

  // Check role existence
  const roles = await this.prisma.role.findUnique({
    where: { name: role },
  });

  if (!role) {
    throw new Error(`Invalid role: ${role}`);
  }

  const [users,total] = await Promise.all([
    this.prisma.user.findMany({
      skip,
      take:pageSize,
      where: {
        roleId: roles.id,
      },
      include:{
        role:true,
        branch:true
      }
    }),
    this.prisma.user.count({ where: { roleId: roles.id } })
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
  }
}
  async findUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }
  async deleteStaff(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }

 async findAllStaff(data: any): Promise<{ users: Partial<User>[]; pagination: IPagination }> {
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
}

