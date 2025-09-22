import { Injectable, Inject } from '@nestjs/common';
import { UserRepository } from './user.repository';
import {
  AddressDto,
  AddressUpdateDto,
  ChangeRoleDto,
  PreferencesDto,
  UserDto,
} from './user.entity';
import { User } from '@prisma/client';
import { IPagination } from 'src/common/types';
import { UserUsecase } from './user.usecase';
import { RoleRepository } from '../role/role.repository';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class UserUseCasesImp implements UserUsecase {
  constructor(private readonly userRepo: UserRepository) {}

 async findUserByEmail(email: string): Promise<User | null> {

    const user = await this.userRepo.findUserByEmail(email);
    if (!user) {
      throw new RpcException(`User with email ${email} not found`);
    }
    return user;
  }

  async getUser(id: string) {
    return this.userRepo.findUserById(id);
  }

  async getAllUsers(
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

    const [users, total] = await this.userRepo.findAll(skip, pageSize, where);

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

  async updateUser(id: string, data: Partial<UserDto>) {
    return this.userRepo.updateUser(id, data);
  }

  async deleteUser(id: string) {
    return this.userRepo.deleteUser(id);
  }

  async addAddress(data: AddressDto) {
    return this.userRepo.addAddress(data);
  }

  async listAddresses(userId: string) {
    return this.userRepo.listAddresses(userId);
  }

  async updateAddress(id: string, data: Partial<AddressUpdateDto>) {
    return this.userRepo.updateAddress(id, data);
  }

  async deleteAddress(id: string) {
    return this.userRepo.deleteAddress(id);
  }

  updatePreferences(userId: string, data: PreferencesDto) {
    return this.userRepo.updatePreferences(userId, data);
  }
}
