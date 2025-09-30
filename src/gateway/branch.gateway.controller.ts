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
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PATTERNS } from '../contracts';
import {
  BranchCreateDto,
  BranchUpdateDto,
} from '../operations/branch/branch.entity';

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
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('search') search?: string,
  ) {
    return this.branchClient.send(PATTERNS.BRANCH_FIND_ALL, {
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 10,
      search: search || null,
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
