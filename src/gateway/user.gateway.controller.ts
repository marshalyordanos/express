import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Inject,
  Delete,
  Req,
  Query,
  Logger,
  BadRequestException,
  Search,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PATTERNS } from '../contracts';
import { ChangeRoleDto, UserDto } from '../operations/user/user.entity';
import { firstValueFrom, lastValueFrom } from 'rxjs';

@Controller('users')
export class UserGatewayController {
  constructor(
    @Inject('USER_SERVICE') private readonly usersClient: ClientProxy,
  ) {}

  // user
  @Get(':id')
  async findUser(@Param('id') id: string) {
    return this.usersClient.send(PATTERNS.USER_FIND_BY_ID, { id });
  }

  @Get()
  async findAll(
    @Req() req,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('search') search?: string,
    @Query('branchId') branchId?: string,
  ) {
    const authHeader = req.headers['authorization'] || null;

    return this.usersClient.send(PATTERNS.USER_FIND_ALL, {
      headers: { authorization: authHeader },
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 10,
      search: search || null,
      branchId: branchId ? Number(branchId) : null,
    });
  }

  @Patch(':id')
  async updateUser(@Param('id') id: string, @Body() dto: UserDto) {
    return this.usersClient.send(PATTERNS.USER_UPDATE, { id, data: dto });
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return this.usersClient.send(PATTERNS.USER_DELETE, { id });
  }

  //endpoint for changing user role in case it is needed and needs role name and user id
  @Patch('role/change')
  async changeUserRole(@Body() dto: ChangeRoleDto) {
    console.log('dto: ', dto);
    
    return this.usersClient.send(PATTERNS.USER_CHANGE_ROLE,  {
      role: dto.role,
      userId: dto.userId,
    });
  }
  //Get staff or user using their email
  @Get('email/:email')
  async findUserByEmail(@Param('email') email: string) {
    return this.usersClient.send(PATTERNS.USER_FIND_BY_EMAIL, { email });
  }

  //Create staff with roles like Internal driver,customer service, dispatch officer, branch manager
  @Post('staff')
  async createStaff(@Req() req: Request, @Body() dto: UserDto) {
    const authHeader = req.headers['authorization'] || null;
    return this.usersClient.send(PATTERNS.STAFF_CREATE, {
      headers: { authorization: authHeader },
      data: dto,
    });
  }
  //Get all staff for roles like Internal driver,customer service, dispatch officer, branch manager
  @Get('staff/all')
  async findStaff(
    @Req() req: Request,
    @Query('search') search?: string,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
  ) {
    console.log('Getting all staff');

    const authHeader = req.headers['authorization'] || null;

    // Wait for microservice response
    const result = await firstValueFrom(
      this.usersClient.send(PATTERNS.STAFF_FIND_ALL, {
        headers: { authorization: authHeader },
        page: Number(page),
        pageSize: Number(pageSize),
        search,
      }),
    );

    console.log('Staff result:', result);
    return result;
  }

  //Get staff by their roles and it is manadatory to pass role
  @Get('role/staff')
  async findStaffByRole(
    @Req() req: Request,
    @Query('role') role: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    console.log('lOGGING FOR ROLE : ', role);
    const authHeader = req.headers['authorization'] || null;

    return this.usersClient.send(PATTERNS.STAFF_FIND_BY_ROLE, {
      headers: { authorization: authHeader },
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 10,
      role: role,
    });
  }
  //delete staff with roles like Internal driver,customer service, dispatch officer, branch manager
  @Delete('staff/:id')
  async deleteStaff(@Param('id') id: string) {
    return this.usersClient.send(PATTERNS.STAFF_DELETE, { id });
  }
}
