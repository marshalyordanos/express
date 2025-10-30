import {
  AddressDto,
  AddressUpdateDto,
  CustomerCategoryDto,
  PreferencesDto,
  UpdateCustomerCategoryDto,
  UserDto,
} from './user.entity';
import { User } from '@prisma/client';
import { ListQueryDto } from 'src/common/query/query.dto';

export interface UserUsecase {
  getUser(id: string): Promise<User | null>;
  getAllUsers(query: ListQueryDto): Promise<any>;
  updateUser(id: string, data: Partial<UserDto>): Promise<User>;
  deleteUser(id: string): Promise<User>;
  addAddress(data: AddressDto): Promise<any>;
  listAddresses(userId: string): Promise<any[]>;
  updateAddress(id: string, data: Partial<AddressUpdateDto>, user: string): Promise<any>;
  deleteAddress(id: string): Promise<any>;

  updatePreferences(userId: string, data: PreferencesDto, user: string): Promise<any>;

  
  findCategoryByName(name: string): Promise<any>;
  deleteCategory(id: string): Promise<any>;
  updateCategory(id: string, data: UpdateCustomerCategoryDto): Promise<any>;
  listCategories(query: ListQueryDto): Promise<any>;
  findCategory(id: string): Promise<any>;
  createCategory(data: CustomerCategoryDto): Promise<any>;
  assignCustomersToCategory(
    customerIds: string[],
    customerCategoryId: string,
  ): Promise<any>;
  removeCustomersFromCategory(customerIds: string[]): Promise<any>;
  // getCustomerOrder(query: ListQueryDto, customerId: string): Promise<IPagination>;
}
