import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Inject,
  Delete,
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
  async findAllBranches() {
    return this.branchClient.send(PATTERNS.BRANCH_FIND_ALL, {});
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
}
