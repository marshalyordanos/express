import { Controller, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PATTERNS } from '../../contracts';
import { IResponse } from '../../common/types';
import { handleCatch } from '../../common/handleCatch';
import { BranchCreateDto, BranchUpdateDto } from './branch.entity';
import { BranchUseCaseImpl } from './branch.useCase.impl';
import { PermissionGuard } from '../../common/permission.guard';
import { PermissionActions } from '../../contracts/permission-actions.enum';
import { CheckPermission } from '../../common/decorator/check-permission.decorator';
import { ListQueryDto } from '../../common/query/query.dto';
import { RateLimitGuard } from '../../common/rate-limit.guard';

@Controller()
export class BranchMessageController {
  constructor(private readonly usecases: BranchUseCaseImpl) {}

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Branch', PermissionActions.CREATE)
  @MessagePattern(PATTERNS.BRANCH_CREATE)
  async createBranch(@Payload() payload: { data: BranchCreateDto; user: any }) {
    const userId = payload?.user?.sub;
    const result = await this.usecases.createBranch(payload.data, userId);
    return new IResponse(true, 'Branch is created Succuessfuly', result);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Branch', PermissionActions.READ)
  @MessagePattern(PATTERNS.BRANCH_FIND_BY_ID)
  async findBranchById(@Payload() data: { id: string }) {
    const result = await this.usecases.findBranchById(data.id);
    return IResponse.success('Branches fetched successfullyy', result);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Branch', PermissionActions.UPDATE)
  @MessagePattern(PATTERNS.BRANCH_UPDATE)
  async updateBranch(
    @Payload() payload: { id: string; data: Partial<BranchUpdateDto> },
  ) {
    const result = await this.usecases.updateBranch(payload.id, payload.data);
    return new IResponse(true, 'Branch is Updated Succuessfuly', result);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Branch', PermissionActions.DELETE)
  @MessagePattern(PATTERNS.BRANCH_DELETE)
  async deleteBranch(@Payload() data: { id: string }) {
    const result = await this.usecases.deleteBranch(data.id);
    return new IResponse(true, 'Branch is Deleted Succuessfuly', result);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Branch', PermissionActions.CREATE)
  @MessagePattern(PATTERNS.BRANCH_ASSIGN_MANAGER)
  async assignManager(
    @Payload() payload: { branchId: string; managerId: string },
  ) {
    const result = await this.usecases.assignManager(
      payload.branchId,
      payload.managerId,
    );
    return new IResponse(true, 'Branch Manager assigned Succuessfuly', result);
  }
  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Branch', PermissionActions.DELETE)
  @MessagePattern(PATTERNS.BRANCH_REVOKE_MANAGER)
  async revokeManager(
    @Payload() payload: { branchId: string; managerId: string },
  ) {
    const result = await this.usecases.revokeManager(
      payload.branchId,
      payload.managerId,
    );
    return new IResponse(true, 'Branch Manager revoked Succuessfuly', result);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Branch', PermissionActions.READ)
  @MessagePattern(PATTERNS.BRANCH_FIND_ALL)
  async findAllBranches(@Payload() payload: { query: ListQueryDto }) {
    const branches = await this.usecases.findAllBranch(payload.query);
    return IResponse.success(
      'Branches fetched successfullyy',
      branches.branches,
      branches.pagination,
    );
  }
}
