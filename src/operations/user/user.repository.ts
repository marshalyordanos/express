import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AddressDto, UserUpdateDto } from './user.entity';
import { User } from '@prisma/client';

@Injectable()
export class UserRepository {
  constructor(private prisma: PrismaService) {}

  async findUserById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findAll(skip: number, pageSize: number, where: any) {
    return await Promise.all([
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
  }

  async updateUser(id: string, data: Partial<UserUpdateDto>): Promise<User> {
    return this.prisma.user.update({ where: { id }, data });
  }
  async deleteUser(id: string): Promise<User> {
    return this.prisma.user.delete({ where: { id: id } });
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }
  async addAddress(data: AddressDto) {
    return this.prisma.address.create({ data });
  }

  async listAddresses(userId: string) {
    return this.prisma.address.findMany({ where: { userId } });
  }

  async updateAddress(id: string, data: any) {
    return this.prisma.address.update({ where: { id }, data });
  }

  async deleteAddress(id: string) {
    return this.prisma.address.delete({ where: { id } });
  }
}
