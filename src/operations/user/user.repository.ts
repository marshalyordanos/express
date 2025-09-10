import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserDto } from './user.entity';
import { User } from '@prisma/client';
import { IPagination } from 'src/common/types';

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
    return this.prisma.user.update({ where: { id }, data });
  }
  async deleteUser(id: string): Promise<User> {
    return this.prisma.user.delete({ where: { id: id } });
  }
}
