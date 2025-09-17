import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { StaffUsecase } from './staff.useCase';
import {
  ChangeRoleDto,
  RegisterStaffDto,
  UpdateStaffDto,
} from './staff.entity';
import { Prisma, User } from '@prisma/client';
import { StaffRepository } from './staff.repository';
import { IPagination } from 'src/common/types';

@Injectable()
export class StaffUseCasesImpl implements StaffUsecase {
  constructor(private readonly staffRepo: StaffRepository) {}

  async createStaff(data: RegisterStaffDto): Promise<User> {
    if (data.role) {
      const roleName = data.role;
      const role = await this.staffRepo.findRoleByName(roleName);

      if (!role) {
        throw new RpcException(`Invalid role: ${roleName}`);
      }
      data.role = role.id;
    }

    // Pass DTO and roleId to repository
    return this.staffRepo.createStaff(data);
  }

  async findStaffByRole(data: any): Promise<{
    users: Partial<User>[];
    pagination: IPagination;
  }> {
    const { page = 1, pageSize = 10, role } = data;

    return this.staffRepo.findStaffByRole(data);
  }
  async findAllStaff(
    data: any,
  ): Promise<{ users: Partial<User>[]; pagination: IPagination }> {
    return this.staffRepo.findAllStaff(data);
  }

  async changeUserRole(data: ChangeRoleDto): Promise<User> {
    return this.staffRepo.changeUserRole(data);
  }

  async deleteStaff(id: string): Promise<string> {
    return this.staffRepo.deleteStaff(id);
  }
  async findStaffById(id: string): Promise<User> {
    return this.staffRepo.findStaffById(id);
  }
  async updateStaff(id: string, data: UpdateStaffDto): Promise<User> {
    return this.staffRepo.updateStaff(id, data);
  }

  async findStaffByBranch(
    data: any,
  ): Promise<{ staffs: Partial<User>[]; pagination: IPagination }> {
    return this.staffRepo.findStaffByBranch(data);
  }

  async assignStaffToBranch(
    staffIds: string[],
    branchId: string,
  ): Promise<Prisma.BatchPayload> {
    return this.staffRepo.assignStaffToBranch(staffIds, branchId);
  }
}
