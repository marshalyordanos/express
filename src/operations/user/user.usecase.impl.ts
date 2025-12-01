import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import {
  AddressDto,
  AddressUpdateDto,
  CreateDriver,
  CustomerCategoryDto,
  NotificationPreferencesDto,
  PreferencesDto,
  UpdateCorporateInfoDto,
  UpdateCustomerCategoryDto,
  UserDto,
} from './user.entity';
import { Address, User } from '@prisma/client';
import { UserUsecase } from './user.usecase';
import { RpcException } from '@nestjs/microservices';
import { ListQueryDto } from 'src/common/query/query.dto';
import { AppLogger } from '../../common/app-logger.service';
import { handleCatch } from '../../common/handleCatch';

@Injectable()
export class UserUseCasesImp implements UserUsecase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext('OperationsService', 'UserUseCasesImp');
  }
  async getCustomerDetail(query: ListQueryDto, customerId: string) {
     try {
       const customerRole= await this.userRepo.findRoleByName("CUSTOMER");
       return await this.userRepo.getCustomerDetail(query, customerId, customerRole.id);
     } catch (error) {
       handleCatch(error)
     }
   }

  // ✅ FIND USER BY EMAIL (with logger + error handling)
  async findUserByEmail(email: string): Promise<User | null> {
    try {
      this.logger.log(`🔍 Searching user by email: ${email}`);

      const user = await this.userRepo.findUserByEmail(email);
      delete user.password;
      if (!user) {
        this.logger.warn(`❌ User not found for email: ${email}`);
        throw new RpcException(`User with email ${email} not found`);
      }

      this.logger.log(`✅ User found: ${user.id}`);
      return user;
    } catch (error) {
      this.logger.error(
        `🚨 Error finding user by email: ${error.message}`,
        error.stack,
      );
      throw new RpcException(error.message || 'Failed to find user by email');
    }
  }

  // ✅ GET USER BY ID
  async getUser(id: string): Promise<User> {
    try {
      this.logger.log(`🔍 Fetching user by id: ${id}`);
      const user = await this.userRepo.findUserById(id);

      delete user.password;
      if (!user) {
        this.logger.warn(`❌ User not found with id: ${id}`);
        throw new RpcException(`User with id ${id} not found`);
      }

      this.logger.log(`✅ User retrieved: ${user.id}`);
      return user;
    } catch (error) {
      this.logger.error(
        `🚨 Error fetching user by id: ${error.message}`,
        error.stack,
      );
      throw new RpcException(error.message || 'Failed to fetch user');
    }
  }

  // ✅ GET ALL USERS
  async getAllUsers(query: ListQueryDto) {
    try {
      this.logger.log(
        `📋 Fetching all users with query: ${JSON.stringify(query)}`,
      );
      const users = await this.userRepo.findAll(query);
      this.logger.log(`✅ Found ${users?.pagination.total || 0} users`);
      return users;
    } catch (error) {
      this.logger.error(
        `🚨 Error fetching all users: ${error.message}`,
        error.stack,
      );
      throw new RpcException(error.message || 'Failed to fetch all users');
    }
  }

  // ✅ UPDATE USER
  async updateUser(id: string, data: Partial<UserDto>): Promise<User> {
    try {
      this.logger.log(`✏️ Updating user with id: ${id}`);
      const updated = await this.userRepo.updateUser(id, data);

      delete updated.password;
      if (!updated) {
        this.logger.warn(`❌ Failed to update user: ${id}`);
        throw new RpcException(`User with id ${id} not found`);
      }

      this.logger.log(`✅ User updated successfully: ${id}`);
      return updated;
    } catch (error) {
      this.logger.error(
        `🚨 Error updating user: ${error.message}`,
        error.stack,
      );
      throw new RpcException(error.message || 'Failed to update user');
    }
  }

  // ✅ DELETE USER
  async deleteUser(id: string): Promise<User> {
    try {
      this.logger.log(`🗑️ Deleting user with id: ${id}`);

      const user = await this.userRepo.findUserById(id);
      if (!user) {
        this.logger.warn(`❌ User not found: ${id}`);
        throw new RpcException(`User with id ${id} not found`);
      }

      const deletedUser = await this.userRepo.deleteUser(id);
      delete deletedUser.password;
      this.logger.log(`✅ User deleted successfully: ${id}`);
      return deletedUser;
    } catch (error) {
      this.logger.error(
        `🚨 Error deleting user: ${error.message}`,
        error.stack,
      );
      throw new RpcException(error.message || 'Failed to delete user');
    }
  }

  // ✅ CREATE ADDRESS
  async addAddress(data: AddressDto): Promise<Address> {
    try {
      this.logger.log(`🏠 Adding address for user: ${data.userId}`);

      const address = await this.userRepo.addAddress(data);
      this.logger.log(`✅ Address added successfully (ID: ${address.id})`);
      return address;
    } catch (error) {
      this.logger.error(
        `🚨 Failed to add address: ${error.message}`,
        error.stack,
      );
      throw new RpcException(error.message || 'Failed to add address');
    }
  }

  // ✅ LIST USER ADDRESSES
  async listAddresses(userId: string): Promise<Address[]> {
    try {
      this.logger.log(`📋 Fetching addresses for user: ${userId}`);

      const addresses = await this.userRepo.listAddresses(userId);
      this.logger.log(
        `✅ Found ${addresses.length} addresses for user ${userId}`,
      );

      return addresses;
    } catch (error) {
      this.logger.error(
        `🚨 Failed to list addresses: ${error.message}`,
        error.stack,
      );
      throw new RpcException(error.message || 'Failed to list user addresses');
    }
  }

  // ✅ UPDATE ADDRESS
  async updateAddress(
    id: string,
    data: Partial<AddressUpdateDto>,
    userId: string,
  ): Promise<Address> {
    try {
      this.logger.log(`✏️ Updating address with id: ${id}`);

      const existing = await this.userRepo.findAddressById(id);
      if (!existing) {
        this.logger.warn(`❌ Address not found: ${id}`);
        throw new RpcException(`Address with id ${id} not found`);
      }

      if (
        (existing.purpose === 'USER_HOME' ||
          existing.purpose === 'USER_WORK') &&
        existing.userId !== userId
      ) {
        this.logger.warn(
          `❌ Tried to update another user's address: ${id}. User: ${userId}`,
        );
        throw new RpcException(`Address with id ${id} not found`);
      }

      const updated = await this.userRepo.updateAddress(id, data);
      this.logger.log(`✅ Address updated successfully (ID: ${id})`);

      return updated;
    } catch (error) {
      this.logger.error(
        `🚨 Failed to update address: ${error.message}`,
        error.stack,
      );
      throw new RpcException(error.message || 'Failed to update address');
    }
  }

  // ✅ DELETE ADDRESS
  async deleteAddress(id: string): Promise<string> {
    try {
      this.logger.log(`🗑️ Deleting address with id: ${id}`);

      const existing = await this.userRepo.findAddressById(id);
      if (!existing) {
        this.logger.warn(`❌ Address not found: ${id}`);
        throw new RpcException(`Address with id ${id} not found`);
      }

      await this.userRepo.deleteAddress(id);
      this.logger.log(`✅ Address deleted successfully: ${id}`);

      return `Address deleted successfully with id: ${id}`;
    } catch (error) {
      this.logger.error(
        `🚨 Failed to delete address: ${error.message}`,
        error.stack,
      );
      throw new RpcException(error.message || 'Failed to delete address');
    }
  }

  // ✅ UPDATE USER PREFERENCES
  async updatePreferences(userId: string, data: PreferencesDto, user: string) {
    try {
      this.logger.log(`⚙️ Updating preferences for user: ${user}`);

      if (userId !== user) {
        this.logger.warn(
          `❌ Tried to update preferences for another user. User: ${user}, Target: ${userId}`,
        );
        throw new RpcException({
          statusCode: 401,
          message: 'Unauthorized. You can only update your own preferences',
        });
      }
      const updated = await this.userRepo.updatePreferences(user, data);
      this.logger.log(
        `✅ Preferences updated successfully for user: ${userId}`,
      );

      return updated;
    } catch (error) {
      this.logger.error(
        `🚨 Failed to update preferences for user ${userId}: ${error.message}`,
        error.stack,
      );
      throw new RpcException(error.message || 'Failed to update preferences');
    }
  }

  // ✅ UPDATE CORPORATE INFO
  async updateCorporateInfo(userId: string, data: UpdateCorporateInfoDto) {
    try {
      this.logger.log(`🏢 Updating corporate info for user: ${userId}`);

      const result = await this.userRepo.updateCorporateInfo(userId, data);
      this.logger.log(`✅ Corporate info updated for user: ${userId}`);

      return result;
    } catch (error) {
      this.logger.error(
        `🚨 Failed to update corporate info for user ${userId}: ${error.message}`,
        error.stack,
      );
      throw new RpcException(
        error.message || 'Failed to update corporate info',
      );
    }
  }

  // ✅ GET CUSTOMER ORDERS
  async getCustomerOrder(query: ListQueryDto, customerId: string) {
    try {
      this.logger.log(`📦 Fetching orders for customer: ${customerId}`);
      const orders = await this.userRepo.getCustomerOrders(query, customerId);
      this.logger.log(
        `✅ Retrieved ${orders?.data?.length || 0} orders for customer: ${customerId}`,
      );

      return orders;
    } catch (error) {
      this.logger.error(
        `🚨 Failed to get customer orders for ${customerId}: ${error.message}`,
        error.stack,
      );
      throw new RpcException(error.message || 'Failed to get customer orders');
    }
  }

  // ✅ GET ALL CUSTOMERS
  async getAllCustomer(query: ListQueryDto) {
    try {
      this.logger.log('👥 Fetching all customers');

      const role = await this.userRepo.findRoleByName('CUSTOMER');
      if (!role) {
        this.logger.warn('❌ CUSTOMER role not found in database');
        throw new RpcException('CUSTOMER role is not found!');
      }

      const customers = await this.userRepo.getAllCustomer(query, role.id);
      this.logger.log(
        `✅ Retrieved ${customers?.pagination.total || 0} customers`,
      );

      return customers;
    } catch (error) {
      this.logger.error(
        `🚨 Failed to get all customers: ${error.message}`,
        error.stack,
      );
      throw new RpcException(error.message || 'Failed to fetch customers');
    }
  }

  // 🚧 FUTURE IMPLEMENTATION PLACEHOLDER
  async findCategoryByName(name: string) {
    this.logger.warn(`⚠️ findCategoryByName is not implemented yet`);
    throw new RpcException('Method not implemented.');
  }

  // ✅ DELETE CUSTOMER CATEGORY
  async deleteCategory(id: string) {
    try {
      this.logger.log(`🗑️ Deleting category with id: ${id}`);

      const category = await this.userRepo.findCategory(id);
      if (!category) {
        this.logger.warn(`❌ Category not found: ${id}`);
        throw new RpcException('Category not found');
      }

      await this.userRepo.deleteCategory(id);
      this.logger.log(`✅ Category deleted successfully: ${id}`);

      return `Category deleted successfully (ID: ${id})`;
    } catch (error) {
      this.logger.error(
        `🚨 Failed to delete category: ${error.message}`,
        error.stack,
      );
      throw new RpcException(error.message || 'Failed to delete category');
    }
  }

  // ✅ UPDATE CUSTOMER CATEGORY
  async updateCategory(id: string, data: UpdateCustomerCategoryDto) {
    try {
      this.logger.log(`✏️ Updating category with id: ${id}`);

      const category = await this.userRepo.findCategory(id);
      if (!category) {
        this.logger.warn(`❌ Category not found: ${id}`);
        throw new RpcException('Category not found');
      }

      const updated = await this.userRepo.updateCategory(id, data);
      this.logger.log(`✅ Category updated successfully (ID: ${id})`);

      return updated;
    } catch (error) {
      this.logger.error(
        `🚨 Failed to update category: ${error.message}`,
        error.stack,
      );
      throw new RpcException(error.message || 'Failed to update category');
    }
  }

  // ✅ LIST CUSTOMER CATEGORIES
  async listCategories(query: ListQueryDto) {
    try {
      this.logger.log('📋 Listing customer categories');

      const result = await this.userRepo.listCategories(query);
      this.logger.log(
        `✅ Retrieved ${result?.pagination.total || 0} categories`,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `🚨 Failed to list categories: ${error.message}`,
        error.stack,
      );
      throw new RpcException(error.message || 'Failed to list categories');
    }
  }

  // ✅ FIND CATEGORY BY ID
  async findCategory(id: string) {
    try {
      this.logger.log(`Finding category with ID: ${id}`);
      const category = await this.userRepo.findCategory(id);

      if (!category) {
        this.logger.warn(`Category not found: ${id}`);
        throw new RpcException('Category not found');
      }

      this.logger.log(`Category found successfully: ${id}`);
      return category;
    } catch (error) {
      this.logger.error(`Error finding category: ${id}`, error.stack);
      throw new RpcException(error.message || 'Failed to find category');
    }
  }

  // ✅ CREATE CUSTOMER CATEGORY
  async createCategory(data: CustomerCategoryDto) {
    try {
      this.logger.log(`Creating category with data: ${JSON.stringify(data)}`);
      const category = await this.userRepo.createCategory(data);
      this.logger.log(`Category created successfully: ${category.id}`);
      return category;
    } catch (error) {
      this.logger.error('Error creating category', error.stack);
      throw new RpcException(error.message || 'Failed to create category');
    }
  }

  // ✅ ASSIGN CUSTOMERS TO CATEGORY
  async assignCustomersToCategory(
    customerIds: string[],
    customerCategoryId: string,
  ) {
    try {
      this.logger.log(
        `🗑️ Attempting to to assign customers with ids [${customerIds}] to category [${customerCategoryId}]`,
      );
      if (!customerIds?.length || !customerCategoryId) {
        throw new RpcException('Customer IDs and Category ID are required');
      }

      this.logger.debug(
        `Assigning customers to category: ${customerCategoryId}`,
      );
      const category = await this.userRepo.findCategory(customerCategoryId);

      if (!category) {
        this.logger.warn(`CustomerCategory not found: ${customerCategoryId}`);
        throw new RpcException(
          `CustomerCategory ${customerCategoryId} not found`,
        );
      }

      const result = await this.userRepo.assignCustomersToCategory(
        customerIds,
        customerCategoryId,
      );
      this.logger.log(
        `Assigned ${customerIds.length} customers to category: ${customerCategoryId}`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Error assigning customers to category: ${customerCategoryId}`,
        error.stack,
      );
      throw new RpcException(
        error.message || 'Failed to assign customers to category',
      );
    }
  }

  // ✅ REMOVE CUSTOMERS FROM CATEGORY
  async removeCustomersFromCategory(customerIds: string[]) {
    try {
      this.logger.log(
        `🗑️ Attempting to to remove customers with ids [${customerIds}] from category.`,
      );
      if (!customerIds?.length) {
        throw new RpcException('Customer IDs are required');
      }

      this.logger.debug(
        `Removing customers from category: ${JSON.stringify(customerIds)}`,
      );
      const result =
        await this.userRepo.removeCustomersFromCategory(customerIds);
      this.logger.log(`Removed ${customerIds.length} customers from category`);
      return result;
    } catch (error) {
      this.logger.error('Error removing customers from category', error.stack);
      throw new RpcException(
        error.message || 'Failed to remove customers from category',
      );
    }
  }

  async createUserNotificationPreference(userId: string) {
    try {
      this.logger.log(
        `Creating user notification preference requested by user: ${userId}`,
      );
      const preference =
        await this.userRepo.createUserNotificationPreferences(userId);
      this.logger.log(
        `User notification preference created successfully: ${preference.id}`,
      );
      return preference;
    } catch (error) {
      this.logger.error(
        'Error creating user notification preference',
        error.stack,
      );
      throw new RpcException(
        error.message || 'Failed to create user notification preference',
      );
    }
  }

  async updateUserNotificationPreference(
    data: NotificationPreferencesDto,
    userId: string,
  ) {
    try {
      this.logger.log(
        `Updating user notification preference with data: ${JSON.stringify(data)}. and requested by user: ${userId}`,
      );
      const preference = await this.userRepo.updateUserNotificationPreferences(
        userId,
        data,
      );
      this.logger.log(
        `User notification preference updated successfully: ${preference.id}`,
      );
      return preference;
    } catch (error) {
      this.logger.error(
        'Error updating user notification preference',
        error.stack,
      );
      throw new RpcException(
        error.message || 'Failed to update user notification preference',
      );
    }
  }

  async getUserNotificationPreference(userId: string) {
    try {
      this.logger.log(
        `Fetching user notification preference for user: ${userId}`,
      );
      const preference =
        await this.userRepo.getUserNotificationPreferences(userId);
      this.logger.log(
        `User notification preference fetched successfully: ${preference?.id || null}`,
      );
      return preference;
    } catch (error) {
      this.logger.error(
        'Error fetching user notification preference',
        error.stack,
      );
      throw new RpcException(
        error.message || 'Failed to fetch user notification preference',
      );
    }
  }

  // Create Driver
  async createDriver(data: CreateDriver, userId: string) {
    this.logger.log(
      `Creating driver for Email ${data.email} with vehicle ${data.vehicleId}, requested by user: ${userId}`,
    );

    try {
      // Validate input first
      if (!data.vehicleId || !data.roleId) {
        throw new RpcException({
          statusCode: 400,
          message: 'Vehicle ID and Role ID are required to create a driver.',
        });
      }

      // ✅ Run both lookups in parallel (faster)
      const [vehicle, role] = await Promise.all([
        this.userRepo.findVehicleById(data.vehicleId),
        this.userRepo.findRoleById(data.roleId),
      ]);

      if (!vehicle) {
        this.logger.warn(`Vehicle not found: ${data.vehicleId}`);
        throw new RpcException({
          statusCode: 404,
          message: `Vehicle with ID ${data.vehicleId} not found.`,
        });
      }

      if (!role) {
        this.logger.warn(`Role not found: ${data.roleId}`);
        throw new RpcException({
          statusCode: 404,
          message: `Role with ID ${data.roleId} not found.`,
        });
      }

      // ✅ Create user + driver + log + vehicle update in single transaction
      const { user, driver } = await this.userRepo.createDriver(data, userId);

      this.logger.log(`Driver created successfully for ${data.email}`);

      // ✅ Merge response for efficiency & convenience
      return {
        success: true,
        message: 'Driver created successfully',
        data: {
          ...user,
          driver: {
            ...driver,
            vehicleId: data.vehicleId,
            roleId: data.roleId,
          },
        },
      };
    } catch (error) {
      this.logger.error(
        `Failed to create driver: ${error.message}`,
        error.stack,
      );
      throw error instanceof RpcException
        ? error
        : new RpcException({ message: error.message, statusCode: 500 });
    }
  }

  // Find Driver
  async findDriver(query: ListQueryDto) {
    this.logger.log(`Finding drivers with query: ${JSON.stringify(query)}`);

    try {
      const drivers = await this.userRepo.findDriver(query);
      this.logger.verbose(`Found ${drivers.pagination.total} drivers`);
      return drivers;
    } catch (error) {
      this.logger.error(`Find driver failed: ${error.message}`, error.stack);
      throw new RpcException(error.message);
    }
  }
}
