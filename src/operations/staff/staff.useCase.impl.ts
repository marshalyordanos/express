import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { StaffUsecase } from './staff.useCase';
import {
  ChangeRoleDto,
  RegisterStaffDto,
  UpdateStaffDto,
} from './staff.entity';
import { Prisma, User } from '@prisma/client';
import { StaffRepository } from './staff.repository';
import * as bcrypt from 'bcrypt';
import { ListQueryDto } from '../../common/query/query.dto';
import { AppLogger } from '../../common/app-logger.service';
import { PasswordValidator } from '../../common/password-validator';

@Injectable()
export class StaffUseCasesImpl implements StaffUsecase {
  constructor(
    private readonly staffRepo: StaffRepository,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext('OperationsService', 'RoleUseCaseImpl');
  }

  // ✅ CREATE STAFF WITH SECURITY + LOGGER
  async createStaff(data: RegisterStaffDto, userId: string): Promise<User> {
    try {
      this.logger.log(
        `🧑‍💻 Creating new staff user: ${data.email || data.phone}`,
      );

      const { existingEmailStaff, existingStaffPhone } =
        await this.staffRepo.findStaffByEmailAndPhone(data.email, data.phone);

      if (existingEmailStaff) {
        this.logger.warn(`❌ Duplicate entry for staff Email : ${data.email}`);
        throw new RpcException({
          message: `A staff with this email (${data.email}) already exists.`,
          statusCode: 400,
        });
      }

      if (existingStaffPhone) {
        this.logger.warn(
          `❌ Duplicate entry for staff Phone number: ${data.phone}`,
        );
        throw new RpcException({
          message: `A staff with this phone number (${data.phone}) already exists.`,
          statusCode: 400,
        });
      }

      // Validate Role
      if (data.role) {
        const role = await this.staffRepo.findRoleById(data.role);
        if (!role) {
          this.logger.warn(`❌ Invalid role: ${data.role}`);
          throw new RpcException(`Invalid role: ${data.role}`);
        }
        data.role = role.id;
      }

      // Validate Branch
      if (data.branchId) {
        const branch = await this.staffRepo.findBranchById(data.branchId);
        if (!branch) {
          this.logger.warn(`❌ Invalid branch ID: ${data.branchId}`);
          throw new RpcException(`Branch not found with id: ${data.branchId}`);
        }
        data.branchId = branch.id;
      }

      // ✅ Validate new password strength
      const valid = PasswordValidator.validate(data.password);
      if (!valid.isValid) {
        this.logger.warn(
          `⚠️ Weak password attempt by user email/phone: ${data.email}, ${data.phone}`,
        );
        throw new RpcException({
          statusCode: 400,
          message: valid.message,
        });
      }
      // Hash password securely
      const hashedPassword = await bcrypt.hash(data.password, 12);
      data.password = hashedPassword;

      const staff = await this.staffRepo.createStaff(data, userId);

      this.logger.log(`✅ Staff created successfully with ID: ${staff.id}`);
      delete staff.password;

      return staff;
    } catch (error) {
      this.logger.error(
        `🚨 Error creating staff: ${error.message}`,
        error.stack,
      );
      throw new RpcException(error.message || 'Failed to create staff');
    }
  }

  // ✅ FIND STAFF BY ROLE
  async findStaffByRole(query: ListQueryDto, role: string) {
    try {
      this.logger.log(`🔍 Fetching staff for role: ${role}`);

      const roleData = await this.staffRepo.findRoleById(role);
      if (!roleData) {
        this.logger.warn(`❌ Invalid role: ${role}`);
        throw new RpcException(`Invalid role: ${role}`);
      }

      const result = await this.staffRepo.findStaffByRole(roleData.id, query);
      this.logger.log(
        `✅ Found ${result.pagination.total} staff under role: ${role}`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `🚨 Error fetching staff by role: ${error.message}`,
        error.stack,
      );
      throw new RpcException(error.message || 'Failed to fetch staff by role');
    }
  }

  // ✅ FIND ALL STAFF
  async findAllStaff(query: ListQueryDto) {
    try {
      this.logger.log(
        `📋 Fetching all staff with filters: ${JSON.stringify(query)}`,
      );
      return  await this.staffRepo.findAllStaff(query);;
    } catch (error) {
      this.logger.error(
        `🚨 Error fetching all staff: ${error.message}`,
        error.stack,
      );
      throw new RpcException(error.message || 'Failed to fetch all staff');
    }
  }

  // ✅ CHANGE USER ROLE
  async changeUserRole(data: ChangeRoleDto): Promise<Partial<User>> {
    try {
      this.logger.log(`🔄 Changing role for userId: ${data.userId}`);

      const user = await this.staffRepo.findStaffById(data.userId);
      if (!user)
        throw new RpcException(`User with id ${data.userId} not found`);

      const role = await this.staffRepo.findRoleById(data.role);
      if (!role) throw new RpcException(`Role ${data.role} not found`);

      const updatedUser = await this.staffRepo.changeUserRole(user.id, role);
      this.logger.log(`✅ Role updated successfully for user ${user.id}`);
      return updatedUser;
    } catch (error) {
      this.logger.error(
        `🚨 Error changing role: ${error.message}`,
        error.stack,
      );
      throw new RpcException(error.message || 'Failed to change user role');
    }
  }

  // ✅ DELETE STAFF
  async deleteStaff(id: string): Promise<string> {
    try {
      this.logger.log(`🗑️ Attempting to delete staff with id: ${id}`);

      const staff = await this.staffRepo.findStaffById(id);
      if (!staff) throw new RpcException(`User with id ${id} not found`);

      await this.staffRepo.deleteStaff(id);

      this.logger.log(`✅ Staff deleted successfully: ${id}`);
      return `User deleted successfully with id: ${id}`;
    } catch (error) {
      this.logger.error(
        `🚨 Error deleting staff: ${error.message}`,
        error.stack,
      );
      throw new RpcException(error.message || 'Failed to delete staff');
    }
  }

  // ✅ FIND STAFF BY ID
  async findStaffById(id: string): Promise<Partial<User>> {
    try {
      this.logger.log(`🗑️ Fetching staff with id: ${id}`);
      const staff = await this.staffRepo.findStaffById(id);
      if (!staff) throw new RpcException('User not found') && this.logger.warn(`🗑️ Staff not founf with id: ${id}`);;

      this.logger.log(`🗑️ Fetched staff successfuly with id: ${id}`);
      return staff;
    } catch (error) {
      this.logger.error(
        `🚨 Error finding staff by ID: ${error.message}`,
        error.stack,
      );
      throw new RpcException(error.message || 'Failed to find staff by ID');
    }
  }

  // ✅ UPDATE STAFF
  async updateStaff(id: string, data: UpdateStaffDto): Promise<Partial<User>> {
    try {
      this.logger.log(`✏️ Updating staff with id: ${id}`);
      return await this.staffRepo.updateStaff(id, data);
    } catch (error) {
      this.logger.error(
        `🚨 Error updating staff: ${error.message}`,
        error.stack,
      );
      throw new RpcException(error.message || 'Failed to update staff');
    }
  }

  // ✅ FIND STAFF BY BRANCH
  async findStaffByBranch(query: ListQueryDto, branchId: string) {
    try {
      this.logger.log(`🏢 Fetching staff for branchId: ${branchId}`);
      return await this.staffRepo.findStaffByBranch(query, branchId);
    } catch (error) {
      this.logger.error(
        `🚨 Error fetching staff by branch: ${error.message}`,
        error.stack,
      );
      throw new RpcException(
        error.message || 'Failed to fetch staff by branch',
      );
    }
  }

  // ✅ ASSIGN STAFF TO BRANCH
  async assignStaffToBranch(staffIds: string[], branchId: string) {
    try {
      this.logger.log(
        `👥 Assigning ${staffIds.length} staff to branchId: ${branchId}`,
      );
      return await this.staffRepo.assignStaffToBranch(staffIds, branchId);
    } catch (error) {
      this.logger.error(
        `🚨 Error assigning staff to branch: ${error.message}`,
        error.stack,
      );
      throw new RpcException(
        error.message || 'Failed to assign staff to branch',
      );
    }
  }
}
