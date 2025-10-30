import { Controller, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PATTERNS } from '../../contracts';
import { UserUseCasesImp } from './user.usecase.impl';
import {
  AddressDto,
  CustomerCategoryDto,
  PreferencesDto,
  UpdateCorporateInfoDto,
  UpdateCustomerCategoryDto,
  UserDto,
} from './user.entity';
import { IResponse } from '../../common/types';
import { handleCatch } from '../../common/handleCatch';
import { ListQueryDto } from '../../common/query/query.dto';
import { CheckPermission } from '../../common/decorator/check-permission.decorator';
import { PermissionGuard } from '../../common/permission.guard';
import { PermissionActions, ScopeAction } from '../../contracts/permission-actions.enum';
import { RateLimitGuard } from '../../common/rate-limit.guard';

@Controller()
export class UserMessageController {
  constructor(private readonly usecases: UserUseCasesImp) {}

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('User', PermissionActions.READ)
  @MessagePattern(PATTERNS.USER_FIND_BY_ID)
  async findById(@Payload() payload: { id: string }) {
    const user = await this.usecases.getUser(payload.id);
    return IResponse.success('Fetch user successfully', user);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('User', PermissionActions.READ, ScopeAction.FULL)
  @MessagePattern(PATTERNS.USER_FIND_ALL)
  async findAll(@Payload() payload: { query: ListQueryDto }) {
    const result = await this.usecases.getAllUsers(payload.query);
    return IResponse.success(
      'Users fetched successfully',
      result.models,
      result.pagination,
    );
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('User', PermissionActions.UPDATE)
  @MessagePattern(PATTERNS.USER_UPDATE)
  async update(@Payload() payload: { data: Partial<UserDto> , user: any }) {
    const userId=payload.user.sub
    const user = await this.usecases.updateUser(userId, payload.data);
    return IResponse.success(' user updated successfully', user);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('User', PermissionActions.DELETE)
  @MessagePattern(PATTERNS.USER_DELETE)
  async deleteUser(@Payload() payload: { id: string }) {
    const user = await this.usecases.deleteUser(payload.id);
    return IResponse.success(' user deleted successfully', user);
  }

  //Get user by email
  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('User', PermissionActions.READ)
  @MessagePattern(PATTERNS.USER_FIND_BY_EMAIL)
  async findByEmail(@Payload() payload: { email: string }) {
    const result = await this.usecases.findUserByEmail(payload.email);
    return IResponse.success('User fetched successfully', result);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('User', PermissionActions.CREATE)
  @MessagePattern(PATTERNS.ADDRESS_CREATE)
  async addAddress(@Payload() payload: { data: AddressDto }) {
    const address = await this.usecases.addAddress(payload.data);
    return IResponse.success('Address added successfully', address);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('User', PermissionActions.READ)
  @MessagePattern(PATTERNS.ADDRESS_LIST)
  async listAddresses(@Payload() data: any) {
    const user = data.user;
    const addresses = await this.usecases.listAddresses(user.sub);
    return IResponse.success('Address fetched successfully', addresses);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('User', PermissionActions.UPDATE)
  @MessagePattern(PATTERNS.ADDRESS_UPDATE)
  async updateAddress(@Payload() payload: { id: string; data: any , user: any}) {
    const userId = payload.user.sub;
    const address = await this.usecases.updateAddress(payload.id, payload.data, userId);
    return IResponse.success('Address updated successfully', address);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('User', PermissionActions.DELETE)
  @MessagePattern(PATTERNS.ADDRESS_DELETE)
  async deleteAddress(@Payload() payload: { id: string }) {
    const address = await this.usecases.deleteAddress(payload.id);
    return IResponse.success('Address deleted successfully', address);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('User', PermissionActions.UPDATE)
  @MessagePattern(PATTERNS.PREFERENCES_UPDATE)
  async updatePreferences(
    @Payload() payload: { userId: string; data: PreferencesDto , user: any},
  ) {
    const user = payload.user.sub;
    const preff = await this.usecases.updatePreferences(
      payload.userId,
      payload.data,
      user
    );
    return IResponse.success('Preferences updated  successfully', preff);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('User', PermissionActions.UPDATE)
  @MessagePattern(PATTERNS.CORPORATEINFO_UPDATE)
  async updateCorporateInfo(
    @Payload() payload: { userId: string; data: UpdateCorporateInfoDto },
  ) {
    const corporateInfo = await this.usecases.updateCorporateInfo(
      payload.userId,
      payload.data,
    );
    return IResponse.success(
      'Corporate info updated  successfully',
      corporateInfo,
    );
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('User', PermissionActions.READ, ScopeAction.FULL)
  @MessagePattern(PATTERNS.USER_ALL_CUSTOMERS)
  async findAllCustomers(@Payload() payload: { query: ListQueryDto }) {
    const result = await this.usecases.getAllCustomer(payload.query);
    return IResponse.success(
      'Customers fetched successfully',
      result.models,
      result.pagination,
    );
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('User', PermissionActions.READ)
  @MessagePattern(PATTERNS.CUSTOMER_ORDERS)
  async getCustomerOrder(
    @Payload() payload: { user: any; query: ListQueryDto },
  ) {
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
  }

  //===============================================================================Customer Category==============================================================================================

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('CustomerCategory', PermissionActions.CREATE)
  @MessagePattern(PATTERNS.CUSTOMER_CATEGORY_CREATE)
  async createCategory(@Payload() payload: { data: CustomerCategoryDto }) {
    const category = await this.usecases.createCategory(payload.data);
    return IResponse.success('Category created successfully', category);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('CustomerCategory', PermissionActions.READ)
  @MessagePattern(PATTERNS.CUSTOMER_CATEGORY_FIND_ALL)
  async listCategories(@Payload() payload: { query: ListQueryDto }) {
    const categories = await this.usecases.listCategories(payload.query);
    return IResponse.success('Categories fetched successfully', categories);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('CustomerCategory', PermissionActions.READ)
  @MessagePattern(PATTERNS.CUSTOMER_CATEGORY_FIND_BY_ID)
  async findCategory(@Payload() payload: { id: string }) {
    const category = await this.usecases.findCategory(payload.id);
    return IResponse.success('Category fetched successfully', category);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('CustomerCategory', PermissionActions.UPDATE)
  @MessagePattern(PATTERNS.CUSTOMER_CATEGORY_UPDATE)
  async updateCategory(
    @Payload() payload: { id: string; data: UpdateCustomerCategoryDto },
  ) {
    const category = await this.usecases.updateCategory(
      payload.id,
      payload.data,
    );
    return IResponse.success('Category updated successfully', category);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('CustomerCategory', PermissionActions.DELETE)
  @MessagePattern(PATTERNS.CUSTOMER_CATEGORY_DELETE)
  async deleteCategory(@Payload() payload: { id: string }) {
    const category = await this.usecases.deleteCategory(payload.id);
    return IResponse.success('Category deleted successfully', category);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('CustomerCategory', PermissionActions.READ)
  @MessagePattern(PATTERNS.CUSTOMER_CATEGORY_ASSIGN_USER)
  async findCategoryByName(@Payload() payload: { name: string }) {
    const category = await this.usecases.findCategoryByName(payload.name);
    return IResponse.success('Category fetched successfully', category);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('CustomerCategory', PermissionActions.CREATE)
  @MessagePattern(PATTERNS.CUSTOMER_CATEGORY_ASSIGN_USER)
  async assignCategoryToUser(
    @Payload()
    payload: {
      data: { customerIds: string[]; customerCategoryId: string };
    },
  ) {
    const { customerIds, customerCategoryId } = payload.data;
    const category = await this.usecases.assignCustomersToCategory(
      customerIds,
      customerCategoryId,
    );
    return IResponse.success('Category assigned successfully', category);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('CustomerCategory', PermissionActions.CREATE)
  @MessagePattern(PATTERNS.CUSTOMER_CATEGORY_UNASSIGN_USER)
  async unassignCategoryToUser(
    @Payload() payload: { customerIds: string[]; customerCategoryId: string },
  ) {
    const category = await this.usecases.removeCustomersFromCategory(
      payload.customerIds,
    );
    return IResponse.success('Category unassigned successfully', category);
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
