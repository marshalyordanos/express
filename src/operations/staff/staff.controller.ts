import { Controller, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import * as handleCatch from '../../common/handleCatch';
import { IResponse } from '../../common/types';
import { PATTERNS } from '../../contracts';
import { AssignStaffToBranchDto, ChangeRoleDto, UpdateStaffDto } from './staff.entity';
import { StaffUseCasesImpl } from './staff.useCase.impl';
import { RegisterStaffDto } from './staff.entity';
import { ListQueryDto } from '../../common/query/query.dto';
import { CheckPermission } from '../../common/decorator/check-permission.decorator';
import { PermissionGuard } from '../../common/permission.guard';
import { PermissionActions } from '../../contracts/permission-actions.enum';
import { RateLimitGuard } from '../../common/rate-limit.guard';

@Controller()
export class StaffMessageController {
  constructor(private readonly usecases: StaffUseCasesImpl) {}

  //COmpleted as Marshal wants
  //Create staff
  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Staff', PermissionActions.CREATE)
  @MessagePattern(PATTERNS.STAFF_CREATE)
  async createStaff(@Payload() payload: { user: any; data: RegisterStaffDto }) {
    const userId = payload?.user?.sub;
      const result = await this.usecases.createStaff(payload.data, userId);
      return IResponse.success('Staff created successfully', result);
  }

  //Completed but additional
  //Get all staffs by role
  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Staff', PermissionActions.READ)
  @MessagePattern(PATTERNS.STAFF_FIND_BY_ROLE)
  async findStaffByRole(
    @Payload()
    payload: {
      query: ListQueryDto;
      role: string;
      headers: { authorization: string };
    },
  ) {
      const result = await this.usecases.findStaffByRole(
        payload.query,
        payload.role,
      );

      return IResponse.success(
        'Staff fetched successfully for role',
        result.Staffs,
        result.pagination,
      );
  }

  //COmpleted as marshal wanted
  //Get all staffs
  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Staff', PermissionActions.READ)
  @MessagePattern(PATTERNS.STAFF_FIND_ALL)
  async findStaff(@Payload() payload: { query: ListQueryDto }) {
      const result = await this.usecases.findAllStaff(payload.query);
      return IResponse.success(
        'Staff fetched successfully',
        result.Staffs,
        result.pagination,
      );
  }

  //Completed as marshal wanted
  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Staff', PermissionActions.UPDATE)
  @MessagePattern(PATTERNS.USER_CHANGE_ROLE)
  async changeUserRole(@Payload() payload: {data: ChangeRoleDto}) {
      const result = await this.usecases.changeUserRole(payload.data);
      return IResponse.success('Role changed successfully', result);
    
  }
  //Delete staff members
  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Staff', PermissionActions.DELETE)
  @MessagePattern(PATTERNS.STAFF_DELETE)
  async deleteStaff(@Payload() payload: { id: string }) {
      const result = await this.usecases.deleteStaff(payload.id);
      return IResponse.success('Staff deleted successfully', result);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Staff', PermissionActions.READ)
  @MessagePattern(PATTERNS.STAFF_FIND_BY_ID)
  async findStaffById(@Payload() payload: { id: string }) {
      const result = await this.usecases.findStaffById(payload.id);
      return IResponse.success('User fetched successfully', result);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Staff', PermissionActions.UPDATE)
  @MessagePattern(PATTERNS.STAFF_UPDATE)
  async updateStaff(@Payload() payload: { id: string; data: UpdateStaffDto }) {
      const result = await this.usecases.updateStaff(payload.id, payload.data);
      return IResponse.success('User updated successfully', result);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Staff', PermissionActions.READ)
  @MessagePattern(PATTERNS.STAFF_FIND_BY_BRANCH)
  async findStaffByBranch(
    @Payload()
    payload: {
      query: ListQueryDto;
      branchId: string;
      headers: { authorization: string };
    },
  ) {
      const result = await this.usecases.findStaffByBranch(
        payload.query,
        payload.branchId,
      );

      return IResponse.success(
        'Users fetched successfully',
        result.Staffs,
        result.pagination,
      );
    
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Staff', PermissionActions.CREATE)
  @MessagePattern(PATTERNS.STAFF_ASSIGN_BRANCH)
  async assignStaffToBranch(@Payload() payload: {data: AssignStaffToBranchDto}) {
      const { staffIds, branchId } = payload.data;
      const result = await this.usecases.assignStaffToBranch(
        staffIds,
        branchId,
      );
      return IResponse.success('Staffs assigned successfully', result);
    
  }
}
