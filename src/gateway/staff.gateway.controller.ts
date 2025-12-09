import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { PATTERNS } from '../contracts';
import {
  AssignStaffToBranchDto,
  ChangeRoleDto,
  CreateDriver,
  RegisterStaffDto,
  UpdateStaffDto,
} from '../operations/staff/staff.entity';
import { ListQueryDto } from '../common/query/query.dto';
import * as jwt from 'jsonwebtoken';
import { SanitizePipe } from '../common/sanitize.pipe';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
// import { Express } from 'express';
// import { File as MulterFile } from 'multer';
// import { File } from 'multer';

@Controller('staff')
export class StaffGatewayController {
  constructor(
    @Inject('USER_SERVICE') private readonly staffClient: ClientProxy,
  ) {}

  //endpoint for changing user role in case it is needed and needs role name and user id
  @Patch('role/change')
  async changeUserRole(@Body() dto: ChangeRoleDto, @Req() req) {
    console.log('dto: ', dto);
    const authHeader = req.headers['authorization'] || null;
    let token = req.headers['authorization']?.replace('Bearer ', '') || null;

    const forwarded = (req.headers['x-forwarded-for'] as string) || '';
    const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
    let decodedUser = null;
    try {
      decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
      // decodedUser = this.jwtService.verify(token);
    } catch (err) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }

    return this.staffClient.send(PATTERNS.USER_CHANGE_ROLE, {
      data: dto,
      headers: { authorization: authHeader },
      user: decodedUser, // ✅ send user info
      ip,
    });
  }
  //Get staff or user using their email
  @Get('email/:email')
  async findUserByEmail(@Param('email') email: string, @Req() req) {
    const authHeader = req.headers['authorization'] || null;
    let token = req.headers['authorization']?.replace('Bearer ', '') || null;

    const forwarded = (req.headers['x-forwarded-for'] as string) || '';
    const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
    let decodedUser = null;
    try {
      decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
      // decodedUser = this.jwtService.verify(token);
    } catch (err) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    return this.staffClient.send(PATTERNS.USER_FIND_BY_EMAIL, {
      email,
      headers: { authorization: authHeader },
      user: decodedUser, // ✅ send user info
      ip,
    });
  }

  //Create staff with roles like Internal driver,customer service, dispatch officer, branch manager
  @Post()
  async createStaff(@Req() req, @Body() dto: RegisterStaffDto) {
    const authHeader = req.headers['authorization'] || null;
    let token = req.headers['authorization']?.replace('Bearer ', '') || null;

    const forwarded = (req.headers['x-forwarded-for'] as string) || '';
    const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
    let decodedUser = null;
    try {
      decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
      // decodedUser = this.jwtService.verify(token);
    } catch (err) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    console.log('=========================: ', authHeader);
    return this.staffClient.send(PATTERNS.STAFF_CREATE, {
      headers: { authorization: authHeader },
      user: decodedUser, // ✅ send user info
      ip,
      data: dto,
    });
  }
  //Get all staff for roles like Internal driver,customer service, dispatch officer, branch manager
  @Get()
  async findStaff(@Req() req, @Query() query: ListQueryDto) {
    const authHeader = req.headers['authorization'] || null;
    let token = req.headers['authorization']?.replace('Bearer ', '') || null;

    const forwarded = (req.headers['x-forwarded-for'] as string) || '';
    const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
    let decodedUser = null;
    try {
      decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
      // decodedUser = this.jwtService.verify(token);
    } catch (err) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }

    return this.staffClient.send(PATTERNS.STAFF_FIND_ALL, {
      headers: { authorization: authHeader },
      user: decodedUser, // ✅ send user info
      ip,
      query,
    });
  }

  //Get staff by their roles and it is manadatory to pass role
  @Get('role/:id')
  async findStaffByRole(
    @Req() req,
    @Param('id') id: string,
    // @Query('page') page?: number,
    // @Query('pageSize') pageSize?: number,
    @Query() query: ListQueryDto,
  ) {
    const authHeader = req.headers['authorization'] || null;
    let token = req.headers['authorization']?.replace('Bearer ', '') || null;

    const forwarded = (req.headers['x-forwarded-for'] as string) || '';
    const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
    let decodedUser = null;
    try {
      decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
      // decodedUser = this.jwtService.verify(token);
    } catch (err) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }

    return this.staffClient.send(PATTERNS.STAFF_FIND_BY_ROLE, {
      headers: { authorization: authHeader },
      user: decodedUser, // ✅ send user info
      ip,
      query: { ...query },
      role: id,
    });
  }
  //delete staff with roles like Internal driver,customer service, dispatch officer, branch manager
  @Delete(':id')
  async deleteStaff(@Param('id') id: string, @Req() req) {
    console.log('Deleting....');
    const authHeader = req.headers['authorization'] || null;
    let token = req.headers['authorization']?.replace('Bearer ', '') || null;

    const forwarded = (req.headers['x-forwarded-for'] as string) || '';
    const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
    let decodedUser = null;
    try {
      decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
      // decodedUser = this.jwtService.verify(token);
    } catch (err) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }

    return this.staffClient.send(PATTERNS.STAFF_DELETE, {
      id,
      headers: { authorization: authHeader },
      user: decodedUser, // ✅ send user info
      ip,
    });
  }

  @Patch(':id')
  async updateStaff(
    @Param('id') id: string,
    @Body() dto: UpdateStaffDto,
    @Req() req,
  ) {
    console.log('this is dto : ', dto);
    const authHeader = req.headers['authorization'] || null;
    let token = req.headers['authorization']?.replace('Bearer ', '') || null;

    const forwarded = (req.headers['x-forwarded-for'] as string) || '';
    const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
    let decodedUser = null;
    try {
      decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
      // decodedUser = this.jwtService.verify(token);
    } catch (err) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }

    return this.staffClient.send(PATTERNS.STAFF_UPDATE, {
      id,
      data: dto,
      headers: { authorization: authHeader },
      user: decodedUser, // ✅ send user info
      ip,
    });
  }

  @Get('/branch/:branchId')
  async findStaffByBranch(
    @Req() req,
    @Param('branchId') branchId: string,
    // @Query('search') search?: string,
    // @Query('page') page?: number,
    // @Query('pageSize') pageSize?: number,
    @Query() query: ListQueryDto,
  ) {
    const authHeader = req.headers['authorization'] || null;
    let token = req.headers['authorization']?.replace('Bearer ', '') || null;

    const forwarded = (req.headers['x-forwarded-for'] as string) || '';
    const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
    let decodedUser = null;
    try {
      decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
      // decodedUser = this.jwtService.verify(token);
    } catch (err) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }

    return this.staffClient.send(PATTERNS.STAFF_FIND_BY_BRANCH, {
      headers: { authorization: authHeader },
      user: decodedUser, // ✅ send user info
      ip,
      branchId,
      query,
    });
  }

  @Post('/driver')
  @UseInterceptors(FilesInterceptor('licenseImages', 2))
  async createDriver(
    @UploadedFiles() files: any[],
    @Body() body: any,
    @Req() req,
  ) {
    
    // const authHeader = req.headers['authorization'] || null;
    // const token = authHeader?.replace('Bearer ', '');
    // const decodedUser = jwt.verify(token, process.env.JWT_SECRET);
    // Attach files (as buffer/base64)
    // Attach file buffers
    if (files?.length > 0) {
      body.licenseFront = files[0]?.buffer || null;
      body.licenseBack = files[1]?.buffer || null;
    }
    const forwarded = req.headers['x-forwarded-for'] as string;
    const ip = forwarded?.split(',')[0] || req.ip;

    return this.staffClient.send(PATTERNS.STAFF_CREATE_DRIVER, {
      data: body,
      // headers: { authorization: authHeader },
      user: null,
      ip,
    });
  }

  @Get('/driver')
  async findDriver(@Query() query: ListQueryDto, @Req() req) {
    // const authHeader = req.headers['authorization'] || null;
    // let token = req.headers['authorization']?.replace('Bearer ', '') || null;

    const forwarded = (req.headers['x-forwarded-for'] as string) || '';
    const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
    let decodedUser = null;
    // try {
    //   decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
    //   // decodedUser = this.jwtService.verify(token);
    // } catch (err) {
    //   throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    // }
    return this.staffClient.send(PATTERNS.STAFF_FIND_DRIVER, {
      query,
      // headers: { authorization: authHeader },
      user: decodedUser, // ✅ send user info
      ip,
    });
  }
  @Post('assign-branch')
  async assignBranch(@Body() dto: AssignStaffToBranchDto, @Req() req) {
    const authHeader = req.headers['authorization'] || null;
    let token = req.headers['authorization']?.replace('Bearer ', '') || null;

    const forwarded = (req.headers['x-forwarded-for'] as string) || '';
    const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
    let decodedUser = null;
    try {
      decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
      // decodedUser = this.jwtService.verify(token);
    } catch (err) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    return this.staffClient.send(PATTERNS.STAFF_ASSIGN_BRANCH, {
      data: dto,
      headers: { authorization: authHeader },
      user: decodedUser, // ✅ send user info
      ip,
    });
  }

  @Get(':id')
  async findStaffById(@Param('id') id: string, @Req() req) {
    const authHeader = req.headers['authorization'] || null;
    let token = req.headers['authorization']?.replace('Bearer ', '') || null;

    const forwarded = (req.headers['x-forwarded-for'] as string) || '';
    const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
    let decodedUser = null;
    try {
      decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
      // decodedUser = this.jwtService.verify(token);
    } catch (err) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    return this.staffClient.send(PATTERNS.STAFF_FIND_BY_ID, {
      id,
      headers: { authorization: authHeader },
      user: decodedUser, // ✅ send user info
      ip,
    });
  }
}
