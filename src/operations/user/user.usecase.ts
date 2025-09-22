import { IPagination } from 'src/common/types';
import {
  AddressDto,
  AddressUpdateDto,
  ChangeRoleDto,
  UserDto,
} from './user.entity';
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
  addAddress(data: AddressDto): Promise<any>;
  listAddresses(userId: string): Promise<any[]>;
  updateAddress(id: string, data: Partial<AddressUpdateDto>): Promise<any>;
  deleteAddress(id: string): Promise<any>;
}
