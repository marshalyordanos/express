import { Controller, Inject, UseGuards } from '@nestjs/common';
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
import { PermissionGuard } from '../../common/permission.guard';
import { PermissionActions } from '../../contracts/permission-actions.enum';
import { CheckPermission } from '../../common/decorator/check-permission.decorator';
import { ListQueryDto } from '../../common/query/query.dto';

@Controller()
export class BranchMessageController {
  constructor(private readonly usecases: BranchUseCaseImpl) {}

  @UseGuards(PermissionGuard)
  @CheckPermission('Branch', PermissionActions.CREATE)
  // @Public()
  @MessagePattern(PATTERNS.BRANCH_CREATE)
  async createBranch(@Payload() payload:{data: BranchCreateDto}) {
    try {
      const result = await this.usecases.createBranch(payload.data);
      return new IResponse(true, 'Branch is created Succuessfuly', result);
    } catch (error) {
      handleCatch(error);
    }
  }

  @UseGuards(PermissionGuard)
  @CheckPermission('Branch', PermissionActions.READ)
  // @Public()
  @MessagePattern(PATTERNS.BRANCH_FIND_BY_ID)
  async findBranchById(@Payload() data: { id: string }) {
    try {
      const result = await this.usecases.findBranchById(data.id);
      return IResponse.success('Branches fetched successfullyy', result);
    } catch (error) {
      handleCatch(error);
    }
  }

  @UseGuards(PermissionGuard)
  @CheckPermission('Branch', PermissionActions.UPDATE)
  // @Public()
  @MessagePattern(PATTERNS.BRANCH_UPDATE)
  async updateBranch(
    @Payload() payload: { id: string; data: Partial<BranchUpdateDto> },
  ) {
    try {
      const result = await this.usecases.updateBranch(payload.id, payload.data);
      return new IResponse(true, 'Branch is Updated Succuessfuly', result);
    } catch (error) {
      handleCatch(error);
    }
  }


  @UseGuards(PermissionGuard)
  @CheckPermission('Branch', PermissionActions.DELETE)
  // @Public()
  @MessagePattern(PATTERNS.BRANCH_DELETE)
  async deleteBranch(@Payload() data: { id: string }) {
    try {
      const result = await this.usecases.deleteBranch(data.id);
      return new IResponse(true, 'Branch is Deleted Succuessfuly', result);
    } catch (error) {
      handleCatch(error);
    }
  }


  @UseGuards(PermissionGuard)
  @CheckPermission('Branch', PermissionActions.CREATE)
  // @Public()
  @MessagePattern(PATTERNS.BRANCH_ASSIGN_MANAGER)
  async assignManager(
    @Payload() payload: { branchId: string; managerId: string },
  ) {
    try {
      console.log(
        `Branch Id: ${payload.branchId}, Managrer managerId: ${payload.managerId} to be assigned.`,
      );
      const result = await this.usecases.assignManager(
        payload.branchId,
        payload.managerId,
      );
      return new IResponse(
        true,
        'Branch Manager assigned Succuessfuly',
        result,
      );
    } catch (error) {
      handleCatch(error);
    }
  }


  @UseGuards(PermissionGuard)
  @CheckPermission('Branch', PermissionActions.CREATE)
  // @Public()
  @MessagePattern(PATTERNS.BRANCH_REVOKE_MANAGER)
  async revokeManager(
    @Payload() payload: { branchId: string; managerId: string },
  ) {
    console.log(
      `Branch Id : ${payload.branchId}, Manager Id : ${payload.managerId} to be revoked.`,
    );

    try {
      const result = await this.usecases.revokeManager(
        payload.branchId,
        payload.managerId,
      );
      return new IResponse(true, 'Branch Manager revoked Succuessfuly', result);
    } catch (error) {}
  }

  @UseGuards(PermissionGuard)
  @CheckPermission('Branch', PermissionActions.READ)
  // @Public()
  @MessagePattern(PATTERNS.BRANCH_FIND_ALL)
  async findAllBranches(@Payload() payload: {query: ListQueryDto}) {
    console.log('data: ', payload);

    try {
      // const { page = 1, pageSize = 10, search } = data;

      const branches = await this.usecases.findAllBranch(
        payload.query
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
