import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PATTERNS } from '../../contracts';
import { IResponse } from '../../common/types';
import { handleCatch } from '../../common/handleCatch';
import { Public } from '../../common/decorator/public.decorator';
import {
  BranchCreateDto,
  BranchResponseDto,
  BranchUpdateDto,
} from './branch.entity';
import { BranchUseCaseImpl } from './branch.useCase.impl';

@Controller()
export class BranchMessageController {
  constructor(private readonly usecases: BranchUseCaseImpl) {}

  @Public()
  @MessagePattern(PATTERNS.BRANCH_CREATE)
  async createBranch(@Payload() data: BranchCreateDto) {
    try {
      return this.usecases.createBranch(data);
    } catch (error) {
      handleCatch(error);
    }
  }
  @Public()
  @MessagePattern(PATTERNS.BRANCH_FIND_BY_ID)
  async findBranchById(@Payload() data: { id: string }) {
    try {
      return this.usecases.findBranchById(data.id);
    } catch (error) {
      handleCatch(error);
    }
  }
  @Public()
  @MessagePattern(PATTERNS.BRANCH_UPDATE)
  async updateBranch(
    @Payload() payload: { id: string; data: Partial<BranchUpdateDto> },
  ) {
    try {
      return this.usecases.updateBranch(payload.id, payload.data);
    } catch (error) {
      handleCatch(error);
    }
  }

  @Public()
  @MessagePattern(PATTERNS.BRANCH_DELETE)
  async deleteBranch(@Payload() data: { id: string }) {
    try {
      return this.usecases.deleteBranch(data.id);
    } catch (error) {
      handleCatch(error);
    }
  }

  @Public()
  @MessagePattern(PATTERNS.BRANCH_FIND_ALL)
  async findAllBranches() {
    console.log('Branchs fetched successfully');

    try {
      const branchs = await this.usecases.findAllBranch();
      return new IResponse(true, 'Branchs fetched successfully', branchs, null);
    } catch (error) {
      handleCatch(error);
    }
  }
}
