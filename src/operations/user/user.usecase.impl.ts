import { Injectable, Inject } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { UserDto } from './user.entity';
import { User } from '@prisma/client';
import { IPagination } from 'src/common/types';
import { UserUsecase } from './user.usecase';

@Injectable()
export class UserUseCasesImp implements UserUsecase {
  constructor(private readonly userRepo: UserRepository) {}

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
    return this.userRepo.findAll(page, pageSize, search, branchId);
  }

  async updateUser(id: string, data: Partial<UserDto>) {
    return this.userRepo.updateUser(id, data);
  }

  async deleteUser(id: string) {
    return this.userRepo.deleteUser(id);
  }
}
