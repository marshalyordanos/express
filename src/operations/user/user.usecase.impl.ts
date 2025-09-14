import { Injectable, Inject } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { ChangeRoleDto, UserDto } from './user.entity';
import { User } from '@prisma/client';
import { IPagination } from 'src/common/types';
import { UserUsecase } from './user.usecase';
import { RoleRepository } from '../role/role.repository';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class UserUseCasesImp implements UserUsecase {
  constructor(private readonly userRepo: UserRepository
  ) {}
 async createStaff(data: UserDto, email: string): Promise<User> {
  const roleName = data.role;
  const role = await this.userRepo.findRoleByName(roleName);

  if (!role) {
    throw new RpcException(`Invalid role: ${roleName}`);
  }

  // Pass DTO and roleId to repository
  return this.userRepo.createStaff(data, email, role.id);
}

 async findStaffByRole(data: any): Promise<{
    users: Partial<User>[];
    pagination: IPagination;
  }> {
      const { page = 1, pageSize = 10, role } = data;

    return this.userRepo.findStaffByRole(data);
  }
  async findAllStaff(data: any): Promise<{ users: Partial<User>[]; pagination: IPagination }> {
    return this.userRepo.findAllStaff(data);
  }
  findUserByEmail(email: string): Promise<User | null> {
    return this.userRepo.findUserByEmail(email);
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
    return this.userRepo.findAll(page, pageSize, search, branchId);
  }

  async updateUser(id: string, data: Partial<UserDto>) {
    return this.userRepo.updateUser(id, data);
  }

  async deleteUser(id: string) {
    return this.userRepo.deleteUser(id);
  }

  async changeUserRole(data: ChangeRoleDto): Promise<User> {
    return this.userRepo.changeUserRole(data);
  }
}
