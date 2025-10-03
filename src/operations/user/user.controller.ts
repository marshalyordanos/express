import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PATTERNS } from '../../contracts';
import { UserUseCasesImp } from './user.usecase.impl';
import {
  AddressDto,
  ChangeRoleDto,
  CustomerCategoryDto,
  PreferencesDto,
  UpdateCorporateInfoDto,
  UpdateCustomerCategoryDto,
  UserDto,
} from './user.entity';
import { Public } from '../../common/decorator/public.decorator';
import { IResponse } from '../../common/types';
import { handleCatch } from '../../common/handleCatch';
import { ListQueryDto } from '../../common/query/query.dto';

@Controller()
export class UserMessageController {
  constructor(private readonly usecases: UserUseCasesImp) {}

  @Public()
  @MessagePattern(PATTERNS.USER_FIND_BY_ID)
  async findById(@Payload() payload: { id: string }) {
    try {
      const user = await this.usecases.getUser(payload.id);
      return IResponse.success('Fetch user successfully', user);
    } catch (error) {
      handleCatch(error);
    }
  }

  // @Public()
  @MessagePattern(PATTERNS.USER_FIND_ALL)
  async findAll(@Payload() payload: { query: ListQueryDto }) {
    try {
      // const user = data.user;
      // console.log('Current user:', user);
      console.log('usecase: ', payload);

      const result = await this.usecases.getAllUsers(payload.query);

      return IResponse.success(
        'Users fetched successfully',
        result.models,
        result.pagination,
      );
    } catch (error) {
      handleCatch(error);
    }
  }

  @MessagePattern(PATTERNS.USER_UPDATE)
  async update(@Payload() payload: { id: string; data: Partial<UserDto> }) {
    try {
      const user = await this.usecases.updateUser(payload.id, payload.data);
      return IResponse.success(' user updated successfully', user);
    } catch (error) {
      handleCatch(error);
    }
  }

  @MessagePattern(PATTERNS.USER_DELETE)
  async deleteUser(@Payload() payload: { id: string }) {
    try {
      const user = await this.usecases.deleteUser(payload.id);
      return IResponse.success(' user deleted successfully', user);
    } catch (error) {
      handleCatch(error);
    }
  }

  //Get user by email
  @Public()
  @MessagePattern(PATTERNS.USER_FIND_BY_EMAIL)
  async findByEmail(@Payload() payload: { email: string }) {
    try {
      const result = await this.usecases.findUserByEmail(payload.email);

      return IResponse.success('User fetched successfully', result);
    } catch (error) {
      handleCatch(error);
    }
  }

  @MessagePattern(PATTERNS.ADDRESS_CREATE)
  async addAddress(@Payload() payload: { data: AddressDto }) {
    try {
      const address = await this.usecases.addAddress(payload.data);
      return IResponse.success('Address added successfully', address);
    } catch (error) {
      handleCatch(error);
    }
  }

  @MessagePattern(PATTERNS.ADDRESS_LIST)
  async listAddresses(@Payload() data: any) {
    try {
      const user = data.user;

      const addresses = await this.usecases.listAddresses(user.sub);
      return IResponse.success('Address fetched successfully', addresses);
    } catch (error) {
      handleCatch(error);
    }
  }

  @MessagePattern(PATTERNS.ADDRESS_UPDATE)
  async updateAddress(@Payload() payload: { id: string; data: any }) {
    try {
      const address = await this.usecases.updateAddress(
        payload.id,
        payload.data,
      );
      return IResponse.success('Address updated successfully', address);
    } catch (error) {
      handleCatch(error);
    }
  }

  @MessagePattern(PATTERNS.ADDRESS_DELETE)
  async deleteAddress(@Payload() payload: { id: string }) {
    try {
      const address = await this.usecases.deleteAddress(payload.id);
      return IResponse.success('Address deleted successfully', address);
    } catch (error) {
      handleCatch(error);
    }
  }
  @MessagePattern(PATTERNS.PREFERENCES_UPDATE)
  async updatePreferences(
    @Payload() payload: { userId: string; data: PreferencesDto },
  ) {
    try {
      console.log('userid: ', payload);
      const preff = await this.usecases.updatePreferences(
        payload.userId,
        payload.data,
      );
      return IResponse.success('Preferences updated  successfully', preff);
    } catch (error) {
      handleCatch(error);
    }
  }

  @MessagePattern(PATTERNS.CORPORATEINFO_UPDATE)
  async updateCorporateInfo(
    @Payload() payload: { userId: string; data: UpdateCorporateInfoDto },
  ) {
    try {
      console.log('userid: ', payload);
      const corporateInfo = await this.usecases.updateCorporateInfo(
        payload.userId,
        payload.data,
      );
      return IResponse.success(
        'Corporate info updated  successfully',
        corporateInfo,
      );
    } catch (error) {
      handleCatch(error);
    }
  }
  @MessagePattern(PATTERNS.USER_ALL_CUSTOMERS)
  async findAllCustomers(@Payload() payload: { query: ListQueryDto }) {
    try {
      const result = await this.usecases.getAllCustomer(payload.query);

      return IResponse.success(
        'Customers fetched successfully',
        result.models,
        result.pagination,
      );
    } catch (error) {
      handleCatch(error);
    }
  }

  @MessagePattern(PATTERNS.CUSTOMER_ORDERS)
  async getCustomerOrder(
    @Payload() payload: { user: any; query: ListQueryDto },
  ) {
    try {
      const user = payload.user;

      const result = await this.usecases.getCustomerOrder(
        payload.query,
        user.sub,
      );

      return IResponse.success(
        'Customer orders fetched successfully',
        result.models,
        result.pagination,
      );
    } catch (error) {
      handleCatch(error);
    }
  }

  //===============================================================================Customer Category==============================================================================================

  @Public()
  @MessagePattern(PATTERNS.CUSTOMER_CATEGORY_CREATE)
  async createCategory(@Payload() payload: { data: CustomerCategoryDto }) {
    try {
      const category = await this.usecases.createCategory(payload.data);
      return IResponse.success('Category created successfully', category);
    } catch (error) {
      handleCatch(error);
    }
  }

  @Public()
  @MessagePattern(PATTERNS.CUSTOMER_CATEGORY_FIND_ALL)
  async listCategories(@Payload() payload: { query: ListQueryDto }) {
    try {
      console.log("Category payload: ", payload);
      console.log("Category payload query: ", payload.query);
      
      const categories = await this.usecases.listCategories(payload.query);
      return IResponse.success('Categories fetched successfully', categories);
    } catch (error) {
      handleCatch(error);
    }
  }

  @Public()
  @MessagePattern(PATTERNS.CUSTOMER_CATEGORY_FIND_BY_ID)
  async findCategory(@Payload() payload: { id: string }) {
    try {
      const category = await this.usecases.findCategory(payload.id);
      return IResponse.success('Category fetched successfully', category);
    } catch (error) {
      handleCatch(error);
    }
  }

  @Public()
  @MessagePattern(PATTERNS.CUSTOMER_CATEGORY_UPDATE)
  async updateCategory(
    @Payload() payload: { id: string; data: UpdateCustomerCategoryDto },
  ) {
    try {
      const category = await this.usecases.updateCategory(
        payload.id,
        payload.data,
      );
      return IResponse.success('Category updated successfully', category);
    } catch (error) {
      handleCatch(error);
    }
  }

  @Public()
  @MessagePattern(PATTERNS.CUSTOMER_CATEGORY_DELETE)
  async deleteCategory(@Payload() payload: { id: string }) {
    try {
      const category = await this.usecases.deleteCategory(payload.id);
      return IResponse.success('Category deleted successfully', category);
    } catch (error) {
      handleCatch(error);
    }
  }

  @Public()
  @MessagePattern(PATTERNS.CUSTOMER_CATEGORY_ASSIGN_USER)
  async findCategoryByName(@Payload() payload: { name: string }) {
    try {
      const category = await this.usecases.findCategoryByName(payload.name);
      return IResponse.success('Category fetched successfully', category);
    } catch (error) {
      handleCatch(error);
    }
  }

  @Public()
  @MessagePattern(PATTERNS.CUSTOMER_CATEGORY_ASSIGN_USER)
  async assignCategoryToUser(
    @Payload() payload: { data: { customerIds: string[]; customerCategoryId: string }},
  ) {
    try {
      console.log("payload as payload :", payload);
      
       const { customerIds, customerCategoryId } = payload.data;
      console.log('payload: ', customerIds);
      console.log('payload: ', customerCategoryId);
      
      const category = await this.usecases.assignCustomersToCategory(
        customerIds,
        customerCategoryId,
      );
      return IResponse.success('Category assigned successfully', category);
    } catch (error) {
      handleCatch(error);
    }
  }

  @Public()
  @MessagePattern(PATTERNS.CUSTOMER_CATEGORY_UNASSIGN_USER)
  async unassignCategoryToUser(
    @Payload() payload: { customerIds: string[]; customerCategoryId: string },
  ) {
    try {
      const category = await this.usecases.removeCustomersFromCategory(
        payload.customerIds
      );
      return IResponse.success('Category unassigned successfully', category);
    } catch (error) {
      handleCatch(error);
    }
  }
}

// import { Controller, Get, Post, Put, Param, Body } from '@nestjs/common';
// import { UserUseCases } from './user.usecases';
// import { UserDto } from './user.entity';

// @Controller('users')
// export class UserController {
//   constructor(private readonly userUseCases: UserUseCases) {}

//   @Post()
//   async createUser(@Body() body: UserDto) {
//     return this.userUseCases.createUser(body);
//   }

//   @Get(':id')
//   async getUser(@Param('id') id: string) {
//     return this.userUseCases.getUser(id);
//   }

//   @Get()
//   async getAllUsers() {
//     return this.userUseCases.getAllUsers();
//   }

//   @Put(':id')
//   async updateUser(@Param('id') id: string, @Body() body: Partial<UserDto>) {
//     return this.userUseCases.updateUser(id, body);
//   }
// }
