import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PATTERNS } from '../../contracts';
import { IResponse } from '../../common/types';
import { handleCatch } from '../../common/handleCatch';
import { Public } from '../../common/decorator/public.decorator';
import {
  AssignManagerDto,
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
  @MessagePattern(PATTERNS.BRANCH_ASSIGN_MANAGER)
  async assignManager(
    @Payload() payload: { branchId: string; managerId: string },
  ) {
    try {
      console.log(
        `Branch Id: ${payload.branchId}, Managrer managerId: ${payload.managerId} to be assigned.`,
      );
      return await this.usecases.assignManager(
        payload.branchId,
        payload.managerId,
      );
    } catch (error) {
      handleCatch(error);
    }
  }
  @Public()
  @MessagePattern(PATTERNS.BRANCH_REVOKE_MANAGER)
  async revokeManager(
    @Payload() payload: { branchId: string; managerId: string },
  ) {
    console.log(
      `Branch Id : ${payload.branchId}, Manager Id : ${payload.managerId} to be revoked.`,
    );

    try {
      return this.usecases.revokeManager(payload.branchId, payload.managerId);
    } catch (error) {}
  }

  @Public()
  @MessagePattern(PATTERNS.BRANCH_FIND_ALL)
  async findAllBranches(@Payload() data: any) {
    console.log('data: ', data);

    try {
      const { page = 1, pageSize = 10, search } = data;

      const branches = await this.usecases.findAllBranch(
        page,
        pageSize,
        search,
      );
      console.log('branches: ', branches);

      return IResponse.success(
        'Branches fetched successfullyy',
        branches.branches,
        branches.pagination,
      );
    } catch (error) {
      handleCatch(error);
    }
  }
}
