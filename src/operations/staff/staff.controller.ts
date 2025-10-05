import { Controller, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Public } from '../../common/decorator/public.decorator';
import * as handleCatch from '../../common/handleCatch';
import { IResponse } from '../../common/types';
import { PATTERNS } from '../../contracts';
import { ChangeRoleDto, UpdateStaffDto } from './staff.entity';
import { StaffUseCasesImpl } from './staff.useCase.impl';
import { RegisterStaffDto } from './staff.entity';
import { ListQueryDto } from '../../common/query/query.dto';
import { CheckPermission } from '../../common/decorator/check-permission.decorator';
import { PermissionGuard } from '../../common/permission.guard';
import { PermissionActions } from '../../contracts/permission-actions.enum';

@Controller()
export class StaffMessageController {
  constructor(private readonly usecases: StaffUseCasesImpl) {}

  //COmpleted as Marshal wants
  //Create staff
  @UseGuards(PermissionGuard)
  @CheckPermission('Staff', PermissionActions.CREATE)
  // @Public()
  @MessagePattern(PATTERNS.STAFF_CREATE)
  async createStaff(@Payload() payload: { headers: any; data: RegisterStaffDto }) {
    try {
      const result = await this.usecases.createStaff(payload.data);

      return IResponse.success('Staff created successfully', result);
    } catch (error) {
      handleCatch.handleCatch(error);
    }
  }

  //Completed but additional
  //Get all staffs by role
  @UseGuards(PermissionGuard)
  @CheckPermission('Staff', PermissionActions.READ)
  // @Public()
  @MessagePattern(PATTERNS.STAFF_FIND_BY_ROLE)
  async findStaffByRole(
    @Payload()
    payload: {
      query: ListQueryDto;
      role: string;
      headers: { authorization: string };
    },
  ) {
    console.log('INSIDE CONTROLLER FOR QUERY : ', payload.query);
    console.log('INSIDE CONTROLLER FOR ROLE : ', payload.role);
    console.log('INSIDE CONTROLLER FOR AUTH : ', payload.headers);

    try {
      // const user = payload.user;
      // const { role } = payload;

      const result = await this.usecases.findStaffByRole(
        payload.query,
        payload.role,
      );

      return IResponse.success(
        'Staff fetched successfully for role',
        result.Staffs,
        result.pagination,
      );
    } catch (error) {
      handleCatch.handleCatch(error);
    }
  }

  //COmpleted as marshal wanted
  //Get all staffs
  @UseGuards(PermissionGuard)
  @CheckPermission('Staff', PermissionActions.READ)
  // @Public()
  @MessagePattern(PATTERNS.STAFF_FIND_ALL)
  async findStaff(@Payload() payload: { query: ListQueryDto }) {
      console.log("payload 1: ", payload);

    try {
      console.log("payload: ", payload);
      
      // const { page = 1, pageSize = 10, search, branchId } = data;

      const result = await this.usecases.findAllStaff(payload.query);

      return IResponse.success(
        'Users fetched successfully',
        result.Staffs,
        result.pagination,
      );
    } catch (error) {
      handleCatch.handleCatch(error);
    }
  }

  //Completed as marshal wanted
  @UseGuards(PermissionGuard)
  @CheckPermission('Staff', PermissionActions.UPDATE)
  // @Public()
  @MessagePattern(PATTERNS.USER_CHANGE_ROLE)
  async changeUserRole(@Payload() payload: {data: ChangeRoleDto}) {
    try {
      console.log('payload: ', payload);

      const result = await this.usecases.changeUserRole(payload.data);

      return IResponse.success('Role changed successfully', result);
    } catch (error) {
      handleCatch.handleCatch(error);
    }
  }

  //Delete staff members
  @UseGuards(PermissionGuard)
  @CheckPermission('Staff', PermissionActions.DELETE)
  // @Public()
  @MessagePattern(PATTERNS.STAFF_DELETE)
  async deleteStaff(@Payload() payload: { id: string }) {
    try {
      const result = await this.usecases.deleteStaff(payload.id);

      return IResponse.success('Staff deleted successfully', result);
    } catch (error) {
      handleCatch.handleCatch(error);
    }
  }

  @UseGuards(PermissionGuard)
  @CheckPermission('Staff', PermissionActions.READ)
  // @Public()
  @MessagePattern(PATTERNS.STAFF_FIND_BY_ID)
  async findStaffById(@Payload() payload: { id: string }) {
    try {
      const result = await this.usecases.findStaffById(payload.id);

      return IResponse.success('User fetched successfully', result);
    } catch (error) {
      handleCatch.handleCatch(error);
    }
  }

  @UseGuards(PermissionGuard)
  @CheckPermission('Staff', PermissionActions.UPDATE)
  // @Public()
  @MessagePattern(PATTERNS.STAFF_UPDATE)
  async updateStaff(@Payload() payload: { id: string; data: UpdateStaffDto }) {
    try {
      const result = await this.usecases.updateStaff(payload.id, payload.data);
      return IResponse.success('User updated successfully', result);
    } catch (error) {
      handleCatch.handleCatch(error);
    }
  }

  @UseGuards(PermissionGuard)
  @CheckPermission('Staff', PermissionActions.READ)
  // @Public()
  @MessagePattern(PATTERNS.STAFF_FIND_BY_BRANCH)
  async findStaffByBranch(
    @Payload()
    payload: {
      query: ListQueryDto;
      branchId: string;
      headers: { authorization: string };
    },
  ) {
    try {
      console.log('INSIDE CONTROLLER FOR QUERY : ', payload.query);
      console.log('INSIDE CONTROLLER FOR BRANCH : ', payload.branchId);
      console.log('INSIDE CONTROLLER FOR AUTH : ', payload.headers);

      const result = await this.usecases.findStaffByBranch(
        payload.query,
        payload.branchId,
      );

      return IResponse.success(
        'Users fetched successfully',
        result.Staffs,
        result.pagination,
      );
    } catch (error) {
      handleCatch.handleCatch(error);
    }
  }

  @UseGuards(PermissionGuard)
  @CheckPermission('Staff', PermissionActions.CREATE)
  // @Public()
  @MessagePattern(PATTERNS.STAFF_ASSIGN_BRANCH)
  async assignStaffToBranch(@Payload() payload: {data: any}) {
    try {
      const { staffIds, branchId } = payload.data;
      console.log('payload: ', payload);
      console.log('staffIds: ', staffIds);
      const result = await this.usecases.assignStaffToBranch(
        staffIds,
        branchId,
      );
      return IResponse.success('Staffs assigned successfully', result);
    } catch (error) {
      handleCatch.handleCatch(error);
    }
  }
}
