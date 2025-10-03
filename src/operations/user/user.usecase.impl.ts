import { Injectable, Inject } from '@nestjs/common';
import { UserRepository } from './user.repository';
import {
  AddressDto,
  AddressUpdateDto,
  AssignCustomerToCategory,
  ChangeRoleDto,
  CustomerCategoryDto,
  PreferencesDto,
  UpdateCorporateInfoDto,
  UpdateCustomerCategoryDto,
  UserDto,
} from './user.entity';
import { User } from '@prisma/client';
import { IPagination } from 'src/common/types';
import { UserUsecase } from './user.usecase';
import { RoleRepository } from '../role/role.repository';
import { RpcException } from '@nestjs/microservices';
import { ListQueryDto } from 'src/common/query/query.dto';

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

  async getAllUsers(query: ListQueryDto) {
    const res = await this.userRepo.findAll(query);

    return res;
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

  updateCorporateInfo(userId: string, data: UpdateCorporateInfoDto) {
    return this.userRepo.updateCorporateInfo(userId, data);
  }
  async getCustomerOrder(query: ListQueryDto, customerId: string) {
    return this.userRepo.getCustomerOrders(query, customerId);
  }
  async getAllCustomer(query: ListQueryDto) {
    const role = await this.userRepo.findRoleByName('CUSTOMER');
    if (!role) {
      throw new RpcException('CUSTOMER role is not found!');
    }
    return this.userRepo.getAllCustomer(query, role.id);
  }

  async findCategoryByName(name: string) {
    throw new Error('Method not implemented.');
  }
  async deleteCategory(id: string) {
    const category = await this.userRepo.findCategory(id);
    if (!category) {
      throw new RpcException('Category not found');
    }
    return await this.userRepo.deleteCategory(id);
  }
  async updateCategory(id: string, data: UpdateCustomerCategoryDto) {
    const category = await this.userRepo.findCategory(id);
    if (!category) {
      throw new RpcException('Category not found');
    }
    return await this.userRepo.updateCategory(id, data);
  }
  async listCategories(query: ListQueryDto) {
    const result= await this.userRepo.listCategories(query);
    return result;
  }
  async findCategory(id: string) {
    const category = await this.userRepo.findCategory(id);
    if (!category) {
      throw new RpcException('Category not found');
    }
    return category;
  }
  async createCategory(data: CustomerCategoryDto) {
    return await this.userRepo.createCategory(data);
  }

  async assignCustomersToCategory(customerIds: string[],
    customerCategoryId: string) {
    // const { customerIds, customerCategoryId } = dto;
console.log('customerIds: ', customerIds);
console.log('customerCategoryId: ', customerCategoryId);

    // validate category
    const category = await this.userRepo.findCategory(customerCategoryId);
console.log('category: ', category);

    if (!category) {
      throw new RpcException(`CustomerCategory ${customerCategoryId} not found`);
    }

    return this.userRepo.assignCustomersToCategory(customerIds, customerCategoryId);
  }

  async removeCustomersFromCategory(customerIds: string[]) {
    return this.userRepo.removeCustomersFromCategory(customerIds);
  }
}
