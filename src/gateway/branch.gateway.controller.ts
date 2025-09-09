import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { IResponse } from 'src/common/types';
import { PATTERNS } from '../contracts';
import { BranchResponseDto } from '../branch/brach.branchDTO';
import { BranchCreateDto, BranchUpdateDto } from '../branch/brach.branchDTO';

@Controller('branches')
export class BranchGatewayController {
    
  constructor(
    @Inject('BRANCH_SERVICE') private readonly branchClient: ClientProxy,
  ) {}
  @Post()
  async createBranch(
    @Body() dto: BranchCreateDto,
  ) {
    return this.branchClient.send(PATTERNS.BRANCH_CREATE, dto);
  }

  @Get(':id')
  async findBranchById(
    @Param('id') id: string,
  ) {
    return this.branchClient
      .send(PATTERNS.BRANCH_FIND_BY_ID, { id });
  }

  @Get()
  async findAllBranches() {
    return this.branchClient.send(PATTERNS.BRANCH_FIND_ALL, {});
  }

  @Patch(':id')
  async updateBranch(
    @Param('id') id: string,
    @Body() dto: BranchUpdateDto,
  ) {
    return this.branchClient
      .send(PATTERNS.BRANCH_UPDATE, { id, data: dto });
  }

  @Delete(':id')
  async deleteBranch(@Param('id') id: string) {
    return this.branchClient.send(PATTERNS.BRANCH_DELETE, { id });
  }
}
