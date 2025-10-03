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
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PATTERNS } from '../contracts';
import {
  BranchCreateDto,
  BranchUpdateDto,
} from '../operations/branch/branch.entity';
import { query } from 'express';
import { ListQueryDto } from '../common/query/query.dto';

@Controller('branch')
export class BranchGatewayController {
  constructor(
    @Inject('USER_SERVICE') private readonly branchClient: ClientProxy,
  ) {}

  @Post()
  async createBranch(@Body() dto: BranchCreateDto) {
    return this.branchClient.send(PATTERNS.BRANCH_CREATE, dto);
  }

  @Get(':id')
  async findBranchById(@Param('id') id: string) {
    return this.branchClient.send(PATTERNS.BRANCH_FIND_BY_ID, { id });
  }

  @Get()
  async findAllBranches(
    @Req() req, @Query() query: ListQueryDto
  ) {
    const authHeader = req.headers['authorization'] || null;
    return this.branchClient.send(PATTERNS.BRANCH_FIND_ALL, {
      headers: { authorization: authHeader },
      query
    });
  }

  @Patch(':id')
  async updateBranch(@Param('id') id: string, @Body() dto: BranchUpdateDto) {
    return this.branchClient.send(PATTERNS.BRANCH_UPDATE, {
      id,
      data: dto,
    });
  }

  @Delete(':id')
  async deleteBranch(@Param('id') id: string) {
    return this.branchClient.send(PATTERNS.BRANCH_DELETE, { id });
  }

  @Post('assign-manager')
  async assignManager(@Body() data: { branchId: string; managerId: string }) {
    console.log('Controller received:', data); // Debug log
    return this.branchClient.send(PATTERNS.BRANCH_ASSIGN_MANAGER, {
      branchId: data.branchId,
      managerId: data.managerId,
    });
  }

  @Post('revoke-manager')
  async revokeManager(@Body() data: { branchId: string; managerId: string }) {
    console.log('Controller received:', data); // Debug log
    return this.branchClient.send(PATTERNS.BRANCH_REVOKE_MANAGER, {
      branchId: data.branchId,
      managerId: data.managerId,
    });
  }
}
