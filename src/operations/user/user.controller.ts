import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PATTERNS } from '../../contracts';
import { UserUseCasesImp } from './user.usecase.impl';
import { ChangeRoleDto, UserDto } from './user.entity';
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
      return this.usecases.getUser(payload.id);
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
      return this.usecases.updateUser(payload.id, payload.data);
    } catch (error) {
      handleCatch(error);
    }
  }

  @MessagePattern(PATTERNS.USER_DELETE)
  async deleteUser(@Payload() payload: { id: string }) {
    try {
      return this.usecases.deleteUser(payload.id);
    } catch (error) {
      handleCatch(error);
    }
  }

  //Get user by email
  @Public()
  @MessagePattern(PATTERNS.USER_FIND_BY_EMAIL)
  async findByEmail(@Payload() payload: { email: string }) {
    try {
      return this.usecases.findUserByEmail(payload.email);
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
