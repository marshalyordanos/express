import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Inject,
  Delete,
  Query,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PATTERNS } from '../contracts';
import {
  BranchCreateDto,
  BranchUpdateDto,
} from '../operations/branch/branch.entity';
import { ListQueryDto } from '../common/query/query.dto';
import * as jwt from 'jsonwebtoken';
import { SanitizePipe } from '../common/sanitize.pipe';
import { lastValueFrom } from 'rxjs';
import { tryCatch } from 'bullmq';

@Controller('branch')
export class BranchGatewayController {
  constructor(
    @Inject('USER_SERVICE') private readonly branchClient: ClientProxy,
  ) {}

  @Post()
  async createBranch(@Body() data: BranchCreateDto, @Req() req) {
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

    return this.branchClient.send(PATTERNS.BRANCH_CREATE, {
      data,
      headers: { authorization: authHeader },
      user: decodedUser, // ✅ send user info
      ip,
    });
  }

  @Get()
  async findAllBranches(@Req() req, @Query() query: ListQueryDto) {
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
    return this.branchClient.send(PATTERNS.BRANCH_FIND_ALL, {
      headers: { authorization: authHeader },
      user: decodedUser, // ✅ send user info
      ip,
      query,
    });
  }

  @Patch(':id')
  async updateBranch(
    @Param('id') id: string,
    @Body() dto: BranchUpdateDto,
    @Req() req,
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
    return this.branchClient.send(PATTERNS.BRANCH_UPDATE, {
      id,
      data: dto,
      headers: { authorization: authHeader },
      user: decodedUser, // ✅ send user info
      ip,
    });
  }

  @Delete(':id')
  async deleteBranch(@Param('id') id: string, @Req() req) {
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
    return this.branchClient.send(PATTERNS.BRANCH_DELETE, {
      id,
      headers: { authorization: authHeader },
      user: decodedUser, // ✅ send user info
      ip,
    });
  }

  //Needs Sanitization
  @Post('assign-manager')
  async assignManager(
    @Body() data: { branchId: string; managerId: string },
    @Req() req,
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
    return this.branchClient.send(PATTERNS.BRANCH_ASSIGN_MANAGER, {
      branchId: data.branchId,
      managerId: data.managerId,
      headers: { authorization: authHeader },
      user: decodedUser, // ✅ send user info
      ip,
    });
  }

  //Needs Sanitization
  @Post('revoke-manager')
  async revokeManager(
    @Body() data: { branchId: string; managerId: string },
    @Req() req,
  ) {
    console.log('Controller received:', data);
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
    return this.branchClient.send(PATTERNS.BRANCH_REVOKE_MANAGER, {
      branchId: data.branchId,
      managerId: data.managerId,
      headers: { authorization: authHeader },
      user: decodedUser, // ✅ send user info
      ip,
    });
  }

    @Get("alls")
  async findAllBranchFrees(@Req() req, @Query() query: ListQueryDto) {
    // const authHeader = req.headers['authorization'] || null;
    // let token = req.headers['authorization']?.replace('Bearer ', '') || null;
    try {
      
          const forwarded = (req.headers['x-forwarded-for'] as string) || '';
          const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
          let decodedUser = null;
          // try {
          //   decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
          //   // decodedUser = this.jwtService.verify(token);
          // } catch (err) {
          //   throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
          // }
      
      return this.branchClient.send(PATTERNS.BRANCH_FIND_ALL_FREE, {
        // headers: { authorization: authHeader },
        user: decodedUser, // ✅ send user info
        ip,
        query,
      });
    } catch (err) {
            console.error('Microservice error for original:', err);
      throw err;
    }
  }

    @Get('all')
  async findAllBranchFree(@Req() req, @Query() query: ListQueryDto) {
    try {
      const forwarded = (req.headers['x-forwarded-for'] as string) || '';
      const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;

      // If JWT needed:
      // const token = req.headers['authorization']?.replace('Bearer ', '') || null;
      // const decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');

      const payload = {
        user: null, // or decodedUser if JWT needed
        ip,
        query,
      };

      console.log('--- Gateway sending payload to microservice ---');
      console.log(JSON.stringify(payload, null, 2));

      const observable = this.branchClient.send(PATTERNS.BRANCH_FIND_ALL_FREE_SECOND , payload);

      // Convert Observable to Promise safely
      const result = await lastValueFrom(observable);

      console.log('--- Gateway received response from microservice ---');
      console.log(JSON.stringify(result, null, 2));

      return result;
    } catch (err) {
      console.error('--- Gateway ERROR receiving from microservice --- ::: ', err);
      console.error(err.stack);
      throw err;
    }
  }

  @Get(':id')
  async findBranchById(@Param('id') id: string, @Req() req) {
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
    return this.branchClient.send(PATTERNS.BRANCH_FIND_BY_ID, {
      id,
      headers: { authorization: authHeader },
      user: decodedUser, // ✅ send user info
      ip,
    });
  }
}
