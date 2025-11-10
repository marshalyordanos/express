"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaffUseCasesImpl = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const staff_repository_1 = require("./staff.repository");
const bcrypt = require("bcrypt");
const app_logger_service_1 = require("../../common/app-logger.service");
const password_validator_1 = require("../../common/password-validator");
let StaffUseCasesImpl = class StaffUseCasesImpl {
    constructor(staffRepo, logger) {
        this.staffRepo = staffRepo;
        this.logger = logger;
        this.logger.setContext('OperationsService', 'RoleUseCaseImpl');
    }
    async createStaff(data, userId) {
        try {
            this.logger.log(`🧑‍💻 Creating new staff user: ${data.email || data.phone}`);
            const { existingEmailStaff, existingStaffPhone } = await this.staffRepo.findStaffByEmailAndPhone(data.email, data.phone);
            if (existingEmailStaff) {
                this.logger.warn(`❌ Duplicate entry for staff Email : ${data.email}`);
                throw new microservices_1.RpcException({
                    message: `A staff with this email (${data.email}) already exists.`,
                    statusCode: 400,
                });
            }
            if (existingStaffPhone) {
                this.logger.warn(`❌ Duplicate entry for staff Phone number: ${data.phone}`);
                throw new microservices_1.RpcException({
                    message: `A staff with this phone number (${data.phone}) already exists.`,
                    statusCode: 400,
                });
            }
            if (data.role) {
                const role = await this.staffRepo.findRoleById(data.role);
                if (!role) {
                    this.logger.warn(`❌ Invalid role: ${data.role}`);
                    throw new microservices_1.RpcException(`Invalid role: ${data.role}`);
                }
                data.role = role.id;
            }
            if (data.branchId) {
                const branch = await this.staffRepo.findBranchById(data.branchId);
                if (!branch) {
                    this.logger.warn(`❌ Invalid branch ID: ${data.branchId}`);
                    throw new microservices_1.RpcException(`Branch not found with id: ${data.branchId}`);
                }
                data.branchId = branch.id;
            }
            const valid = password_validator_1.PasswordValidator.validate(data.password);
            if (!valid.isValid) {
                this.logger.warn(`⚠️ Weak password attempt by user email/phone: ${data.email}, ${data.phone}`);
                throw new microservices_1.RpcException({
                    statusCode: 400,
                    message: valid.message,
                });
            }
            const hashedPassword = await bcrypt.hash(data.password, 12);
            data.password = hashedPassword;
            const staff = await this.staffRepo.createStaff(data, userId);
            this.logger.log(`✅ Staff created successfully with ID: ${staff.id}`);
            delete staff.password;
            await this.staffRepo.createNotificationPreferences(staff.id);
            this.logger.log(`✅ Notification preferences created successfully for staff with ID: ${staff.id}`);
            return staff;
        }
        catch (error) {
            this.logger.error(`🚨 Error creating staff: ${error.message}`, error.stack);
            throw new microservices_1.RpcException(error.message || 'Failed to create staff');
        }
    }
    async findStaffByRole(query, role) {
        try {
            this.logger.log(`🔍 Fetching staff for role: ${role}`);
            const roleData = await this.staffRepo.findRoleById(role);
            if (!roleData) {
                this.logger.warn(`❌ Invalid role: ${role}`);
                throw new microservices_1.RpcException(`Invalid role: ${role}`);
            }
            const result = await this.staffRepo.findStaffByRole(roleData.id, query);
            this.logger.log(`✅ Found ${result.pagination.total} staff under role: ${role}`);
            return result;
        }
        catch (error) {
            this.logger.error(`🚨 Error fetching staff by role: ${error.message}`, error.stack);
            throw new microservices_1.RpcException(error.message || 'Failed to fetch staff by role');
        }
    }
    async findAllStaff(query) {
        try {
            this.logger.log(`📋 Fetching all staff with filters: ${JSON.stringify(query)}`);
            return await this.staffRepo.findAllStaff(query);
        }
        catch (error) {
            this.logger.error(`🚨 Error fetching all staff: ${error.message}`, error.stack);
            throw new microservices_1.RpcException(error.message || 'Failed to fetch all staff');
        }
    }
    async changeUserRole(data) {
        try {
            this.logger.log(`🔄 Changing role for userId: ${data.userId}`);
            const user = await this.staffRepo.findStaffById(data.userId);
            if (!user)
                throw new microservices_1.RpcException(`User with id ${data.userId} not found`);
            const role = await this.staffRepo.findRoleById(data.role);
            if (!role)
                throw new microservices_1.RpcException(`Role ${data.role} not found`);
            const updatedUser = await this.staffRepo.changeUserRole(user.id, role);
            this.logger.log(`✅ Role updated successfully for user ${user.id}`);
            return updatedUser;
        }
        catch (error) {
            this.logger.error(`🚨 Error changing role: ${error.message}`, error.stack);
            throw new microservices_1.RpcException(error.message || 'Failed to change user role');
        }
    }
    async deleteStaff(id) {
        try {
            this.logger.log(`🗑️ Attempting to delete staff with id: ${id}`);
            const staff = await this.staffRepo.findStaffById(id);
            if (!staff)
                throw new microservices_1.RpcException(`User with id ${id} not found`);
            await this.staffRepo.deleteStaff(id);
            this.logger.log(`✅ Staff deleted successfully: ${id}`);
            return `User deleted successfully with id: ${id}`;
        }
        catch (error) {
            this.logger.error(`🚨 Error deleting staff: ${error.message}`, error.stack);
            throw new microservices_1.RpcException(error.message || 'Failed to delete staff');
        }
    }
    async findStaffById(id) {
        try {
            this.logger.log(`🗑️ Fetching staff with id: ${id}`);
            const staff = await this.staffRepo.findStaffById(id);
            if (!staff)
                throw (new microservices_1.RpcException('User not found') &&
                    this.logger.warn(`🗑️ Staff not founf with id: ${id}`));
            this.logger.log(`🗑️ Fetched staff successfuly with id: ${id}`);
            return staff;
        }
        catch (error) {
            this.logger.error(`🚨 Error finding staff by ID: ${error.message}`, error.stack);
            throw new microservices_1.RpcException(error.message || 'Failed to find staff by ID');
        }
    }
    async updateStaff(id, data) {
        try {
            this.logger.log(`✏️ Updating staff with id: ${id}`);
            return await this.staffRepo.updateStaff(id, data);
        }
        catch (error) {
            this.logger.error(`🚨 Error updating staff: ${error.message}`, error.stack);
            throw new microservices_1.RpcException(error.message || 'Failed to update staff');
        }
    }
    async findStaffByBranch(query, branchId) {
        try {
            this.logger.log(`🏢 Fetching staff for branchId: ${branchId}`);
            return await this.staffRepo.findStaffByBranch(query, branchId);
        }
        catch (error) {
            this.logger.error(`🚨 Error fetching staff by branch: ${error.message}`, error.stack);
            throw new microservices_1.RpcException(error.message || 'Failed to fetch staff by branch');
        }
    }
    async assignStaffToBranch(staffIds, branchId) {
        try {
            this.logger.log(`👥 Assigning ${staffIds.length} staff to branchId: ${branchId}`);
            return await this.staffRepo.assignStaffToBranch(staffIds, branchId);
        }
        catch (error) {
            this.logger.error(`🚨 Error assigning staff to branch: ${error.message}`, error.stack);
            throw new microservices_1.RpcException(error.message || 'Failed to assign staff to branch');
        }
    }
};
exports.StaffUseCasesImpl = StaffUseCasesImpl;
exports.StaffUseCasesImpl = StaffUseCasesImpl = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [staff_repository_1.StaffRepository,
        app_logger_service_1.AppLogger])
], StaffUseCasesImpl);
//# sourceMappingURL=staff.useCase.impl.js.map