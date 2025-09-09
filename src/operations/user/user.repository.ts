import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserDto } from './user.entity';
import { User } from '@prisma/client';

@Injectable()
export class UserRepository {
  constructor(private prisma: PrismaService) {}

  async findUserById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findAll(): Promise<Partial<User>[]> {
    return this.prisma.user.findMany({
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
    });
  }

  async updateUser(id: string, data: Partial<UserDto>): Promise<User> {
    return this.prisma.user.update({ where: { id }, data });
  }
  async deleteUser(id: string): Promise<User> {
    return this.prisma.user.delete({ where: { id: id } });
  }
}
