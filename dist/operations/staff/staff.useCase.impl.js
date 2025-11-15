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
const redis_service_1 = require("../..//redis/redis.service");
const cloudinary_uploader_service_1 = require("../../common/cloudinary/cloudinary-uploader.service");
const ocr_service_1 = require("../../common/ocr/ocr.service");
let StaffUseCasesImpl = class StaffUseCasesImpl {
    constructor(staffRepo, logger, redis, cloudinaryUploader, ocrService) {
        this.staffRepo = staffRepo;
        this.logger = logger;
        this.redis = redis;
        this.cloudinaryUploader = cloudinaryUploader;
        this.ocrService = ocrService;
        this.logger.setContext('OperationsService', 'RoleUseCaseImpl');
    }
    async createStaff(data, createdBy) {
        try {
            this.logger.log(`🧑‍💻 Creating new staff: ${data.email || data.phone}`);
            const [existingEmail, existingPhone, role, branch] = await Promise.all([
                this.staffRepo.findByEmail(data.email),
                this.staffRepo.findByPhone(data.phone),
                data.role ? this.staffRepo.findRoleById(data.role) : null,
                data.branchId ? this.staffRepo.findBranchById(data.branchId) : null,
            ]);
            if (existingEmail)
                throw new microservices_1.RpcException(`Email already exists: ${data.email}`);
            if (existingPhone)
                throw new microservices_1.RpcException(`Phone already exists: ${data.phone}`);
            if (!role)
                throw new microservices_1.RpcException(`Invalid role ID: ${data.role}`);
            if (data.branchId && !branch)
                throw new microservices_1.RpcException(`Invalid branch ID: ${data.branchId}`);
            const valid = password_validator_1.PasswordValidator.validate(data.password);
            if (!valid.isValid)
                throw new microservices_1.RpcException(valid.message);
            const hashedPassword = await bcrypt.hash(data.password, 12);
            const isStaff = true;
            let customId = null;
            if (isStaff || role.name.toUpperCase() === 'DRIVER') {
                customId = await this.generateCustomId(role.name);
            }
            const prismaData = {
                name: data.name,
                email: data.email,
                phone: data.phone,
                password: hashedPassword,
                isStaff: true,
                isActive: true,
                emergencyContactName: data.emergencyContactName,
                emergencyContactPhone: data.emergencyContactPhone,
                customId,
                createdBy,
                role: { connect: { id: role.id } },
                branch: data.branchId ? { connect: { id: branch.id } } : undefined,
            };
            const staff = await this.staffRepo.createStaff(prismaData);
            this.staffRepo
                .createNotificationPreferences(staff.id)
                .catch((err) => this.logger.error(`Failed to create notification prefs for staff ${staff.customId}`, err));
            this.logger.log(`✅ Staff created successfully: ${staff.customId}`);
            return staff;
        }
        catch (error) {
            this.logger.error(`🚨 Error creating staff: ${error.message}`);
            throw new microservices_1.RpcException(error.message || 'Failed to create staff');
        }
    }
    async generateCustomId(roleName) {
        const prefix = 'LN';
        const roleAbbr = roleName.slice(0, 2).toUpperCase();
        const redisKey = `staff:counter:${roleAbbr}`;
        let nextNumber = await this.redis.getClient().incr(redisKey);
        if (nextNumber === 1) {
            const lastCustomId = await this.staffRepo.getLastCustomId(prefix, roleAbbr);
            if (lastCustomId) {
                const lastNum = parseInt(lastCustomId.split('-')[2], 10);
                nextNumber = lastNum + 1;
                await this.redis.getClient().set(redisKey, String(nextNumber));
            }
        }
        return `${prefix}-${roleAbbr}-${String(nextNumber).padStart(5, '0')}`;
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
    async deactivateStaff(id, userId) {
        try {
            this.logger.log(`🗑️ Deactivating staff with id: ${id} and initiated by user ${userId}`);
            const staff = await this.staffRepo.findStaffById(userId);
            if (!staff)
                throw new microservices_1.RpcException(`Staff with id ${userId} not found`);
            return await this.staffRepo.deactivateStaff(id, userId);
        }
        catch (error) {
            this.logger.error(`🚨 Error deactivating staff: ${error.message}`, error.stack);
            throw new microservices_1.RpcException(error.message || 'Failed to deactivate staff');
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
    async createDriver(data, userId) {
        this.logger.log(`Creating driver for Email ${data.email} and initiated by ${userId}`);
        if (!data.vehicleId || !data.roleId) {
            throw new microservices_1.RpcException({
                statusCode: 400,
                message: 'Vehicle ID and Role ID are required.',
            });
        }
        const [vehicle, role, user] = await Promise.all([
            this.staffRepo.findVehicleById(data.vehicleId),
            this.staffRepo.findRoleById(data.roleId),
            this.staffRepo.findStaffByEmailAndPhone(data.email, data.phone),
        ]);
        if (!role)
            throw new microservices_1.RpcException(`Role not found: ${data.roleId}`);
        if (user.existingEmailStaff)
            throw new microservices_1.RpcException('Email already exists');
        if (user.existingStaffPhone)
            throw new microservices_1.RpcException('Phone already exists');
        let uploadedFront = null;
        let uploadedBack = null;
        let frontBuffer = null;
        let backBuffer = null;
        if (data.licenseFront) {
            if (data.licenseFront.type === 'Buffer' &&
                Array.isArray(data.licenseFront.data)) {
                frontBuffer = Buffer.from(data.licenseFront.data);
            }
            else if (Buffer.isBuffer(data.licenseFront)) {
                frontBuffer = data.licenseFront;
            }
        }
        if (data.licenseBack) {
            if (data.licenseBack.type === 'Buffer' &&
                Array.isArray(data.licenseBack.data)) {
                backBuffer = Buffer.from(data.licenseBack.data);
            }
            else if (Buffer.isBuffer(data.licenseBack)) {
                backBuffer = data.licenseBack;
            }
        }
        if (data.licenseFront) {
            uploadedFront = await this.cloudinaryUploader.uploadFile(frontBuffer, `drivers/${data.email}/license/front`);
        }
        console.log('Uploaded front image ::: ', uploadedFront);
        if (data.licenseBack) {
            uploadedBack = await this.cloudinaryUploader.uploadFile(backBuffer, `drivers/${data.email}/license/back`);
        }
        console.log('Uploaded back image ::: ', uploadedBack);
        data.licenseFrontUrl = uploadedFront?.secure_url || null;
        data.licenseBackUrl = uploadedBack?.secure_url || null;
        console.log(`Data request body for front ${data.licenseFront} and for back ${data.licenseBack}`);
        let ocrFront = null;
        let ocrBack = null;
        if (uploadedFront?.url) {
            ocrFront = await this.ocrService.extractFromImage(uploadedFront.url);
        }
        console.log(`Processed image for front :: `, ocrFront);
        if (uploadedBack?.url) {
            ocrBack = await this.ocrService.extractFromImage(uploadedBack.url);
        }
        console.log(`Processed image for back ::: `, ocrBack);
        const ocr = { ...ocrBack, ...ocrFront };
        console.log(`OCR big one :: `, ocr);
        data.licenseNumber ||= ocr.licenseNumber;
        data.expiryDate ||= ocr.expiryDate;
        data.issueDate ||= ocr.issueDate;
        data.phone ||= ocr.phone;
        data.emergencyContactName ||= ocr.emergencyContactName;
        data.emergencyContactPhone ||= ocr.emergencyContactPhone;
        const customId = await this.generateCustomId(role.name);
        const hashedPassword = await bcrypt.hash('default', 12);
        const userData = {
            name: data.name,
            email: data.email,
            phone: data.phone ?? null,
            password: hashedPassword,
            isStaff: true,
            isActive: true,
            customId,
            branchId: data.type === 'INTERNAL' ? data.branchId : null,
            roleId: data.roleId,
            emergencyContactName: data.emergencyContactName,
            emergencyContactPhone: data.emergencyContactPhone,
        };
        const result = await this.staffRepo.createDriver(userData, data, userId);
        this.logger.log(`Driver created successfully: ${customId}`);
        return {
            success: true,
            message: 'Driver created successfully',
            data: result,
        };
    }
    async findDriver(query) {
        this.logger.log(`Finding drivers with query: ${JSON.stringify(query)}`);
        try {
            const drivers = await this.staffRepo.findDriver(query);
            this.logger.verbose(`Found ${drivers.pagination.total} drivers`);
            return drivers;
        }
        catch (error) {
            this.logger.error(`Find driver failed: ${error.message}`, error.stack);
            throw new microservices_1.RpcException(error.message);
        }
    }
};
exports.StaffUseCasesImpl = StaffUseCasesImpl;
exports.StaffUseCasesImpl = StaffUseCasesImpl = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [staff_repository_1.StaffRepository,
        app_logger_service_1.AppLogger,
        redis_service_1.RedisService,
        cloudinary_uploader_service_1.CloudinaryUploaderService,
        ocr_service_1.CommonOCRService])
], StaffUseCasesImpl);
//# sourceMappingURL=staff.useCase.impl.js.map