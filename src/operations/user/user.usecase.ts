import { IPagination } from 'src/common/types';
import { ChangeRoleDto, UserDto } from './user.entity';
import { User } from '@prisma/client';

export interface UserUsecase {
  getUser(id: string): Promise<User | null>;
  getAllUsers(
    page: number,
    pageSize: number,
    search?: string,
    branchId?: number,
  ): Promise<{
    users: Partial<User>[];
    pagination: IPagination;
  }>;
  updateUser(id: string, data: Partial<UserDto>): Promise<User>;
  deleteUser(id: string): Promise<User>;
  changeUserRole(data: ChangeRoleDto): Promise<User>;
  createStaff(data: UserDto, email: string): Promise<User>;
  findStaffByRole(data: any): Promise<{
    users: Partial<User>[];
    pagination: IPagination;
  }>;
  findAllStaff(
    data: any,
  ): Promise<{ users: Partial<User>[]; pagination: IPagination }>;
  findUserByEmail(email: string): Promise<User | null>;
}
