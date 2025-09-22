import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PATTERNS } from '../../contracts';
import { UserUseCasesImp } from './user.usecase.impl';
import {
  AddressDto,
  ChangeRoleDto,
  PreferencesDto,
  UserDto,
} from './user.entity';
import { Public } from '../../common/decorator/public.decorator';
import { IResponse } from '../../common/types';
import { handleCatch } from '../../common/handleCatch';

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
  async findAll(@Payload() data: any) {
    try {
      const user = data.user;
      console.log('Current user:', user);

      const { page = 1, pageSize = 10, search, branchId } = data;

      const result = await this.usecases.getAllUsers(
        page,
        pageSize,
        search,
        branchId,
      );

      return IResponse.success(
        'Users fetched successfully',
        result.users,
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
      const result= await this.usecases.findUserByEmail(payload.email);

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
