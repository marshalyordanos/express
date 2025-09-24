import { IPagination } from 'src/common/types';
import {
  AddressDto,
  AddressUpdateDto,
  ChangeRoleDto,
  PreferencesDto,
  UserDto,
} from './user.entity';
import { User } from '@prisma/client';
import { ListQueryDto } from 'src/common/query/query.dto';

export interface UserUsecase {
  getUser(id: string): Promise<User | null>;
  getAllUsers(query: ListQueryDto);
  updateUser(id: string, data: Partial<UserDto>): Promise<User>;
  deleteUser(id: string): Promise<User>;
  addAddress(data: AddressDto): Promise<any>;
  listAddresses(userId: string): Promise<any[]>;
  updateAddress(id: string, data: Partial<AddressUpdateDto>): Promise<any>;
  deleteAddress(id: string): Promise<any>;

  updatePreferences(userId: string, data: PreferencesDto): Promise<any>;
}
