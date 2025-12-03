import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { StaffUsecase } from './staff.useCase';
import {
  ChangeRoleDto,
  CreateDriver,
  RegisterStaffDto,
  UpdateStaffDto,
} from './staff.entity';
import { Prisma, User } from '@prisma/client';
import { StaffRepository } from './staff.repository';
import * as bcrypt from 'bcrypt';
import { ListQueryDto } from '../../common/query/query.dto';
import { AppLogger } from '../../common/app-logger.service';
import { PasswordValidator } from '../../common/password-validator';
import { RedisService } from '../..//redis/redis.service';
import { CloudinaryUploaderService } from '../../common/cloudinary/cloudinary-uploader.service';
// import { CommonOCRService } from '../../common/ocr/ocr.service';

@Injectable()
export class StaffUseCasesImpl implements StaffUsecase {
  constructor(
    private readonly staffRepo: StaffRepository,
    private readonly logger: AppLogger,
    private readonly redis: RedisService,
    private readonly cloudinaryUploader: CloudinaryUploaderService,
    // private readonly ocrService: CommonOCRService,
  ) {
    this.logger.setContext('OperationsService', 'RoleUseCaseImpl');
  }

  // ✅ CREATE STAFF WITH SECURITY + LOGGER
  // async createStaff(data: RegisterStaffDto, userId: string): Promise<any> {
  //   try {
  //     this.logger.log(
  //       `🧑‍💻 Creating new staff user: ${data.email || data.phone}`,
  //     );

  //     const { existingEmailStaff, existingStaffPhone } =
  //       await this.staffRepo.findStaffByEmailAndPhone(data.email, data.phone);

  //     if (existingEmailStaff) {
  //       this.logger.warn(`❌ Duplicate entry for staff Email : ${data.email}`);
  //       throw new RpcException({
  //         message: `A staff with this email (${data.email}) already exists.`,
  //         statusCode: 400,
  //       });
  //     }

  //     if (existingStaffPhone) {
  //       this.logger.warn(
  //         `❌ Duplicate entry for staff Phone number: ${data.phone}`,
  //       );
  //       throw new RpcException({
  //         message: `A staff with this phone number (${data.phone}) already exists.`,
  //         statusCode: 400,
  //       });
  //     }

  //     // Validate Role
  //     if (data.role) {
  //       const role = await this.staffRepo.findRoleById(data.role);
  //       if (!role) {
  //         this.logger.warn(`❌ Invalid role: ${data.role}`);
  //         throw new RpcException(`Invalid role: ${data.role}`);
  //       }
  //       data.role = role.id;
  //     }

  //     // Validate Branch
  //     if (data.branchId) {
  //       const branch = await this.staffRepo.findBranchById(data.branchId);
  //       if (!branch) {
  //         this.logger.warn(`❌ Invalid branch ID: ${data.branchId}`);
  //         throw new RpcException(`Branch not found with id: ${data.branchId}`);
  //       }
  //       data.branchId = branch.id;
  //     }

  //     // ✅ Validate new password strength
  //     const valid = PasswordValidator.validate(data.password);
  //     if (!valid.isValid) {
  //       this.logger.warn(
  //         `⚠️ Weak password attempt by user email/phone: ${data.email}, ${data.phone}`,
  //       );
  //       throw new RpcException({
  //         statusCode: 400,
  //         message: valid.message,
  //       });
  //     }
  //     // Hash password securely
  //     const hashedPassword = await bcrypt.hash(data.password, 12);
  //     data.password = hashedPassword;

  //     const staff = await this.staffRepo.createStaff(data, userId);

  //     this.logger.log(`✅ Staff created successfully with ID: ${staff.id}`);
  //     // delete staff.password;
  //     await this.staffRepo.createNotificationPreferences(staff.id);
  //     this.logger.log(
  //       `✅ Notification preferences created successfully for staff with ID: ${staff.id}`,
  //     );
  //     return staff;
  //   } catch (error) {
  //     this.logger.error(
  //       `🚨 Error creating staff: ${error.message}`,
  //       error.stack,
  //     );
  //     throw new RpcException(error.message || 'Failed to create staff');
  //   }
  // }

  /** 🔹 Create staff with full validation + custom ID generation */
  async createStaff(data: RegisterStaffDto, createdBy: string): Promise<any> {
    try {
      this.logger.log(`🧑‍💻 Creating new staff: ${data.email || data.phone}`);

      // 🔹 Parallel checks for duplicates + role + branch
      const [existingEmail, existingPhone, role, branch] = await Promise.all([
        this.staffRepo.findByEmail(data.email),
        this.staffRepo.findByPhone(data.phone),
        data.role ? this.staffRepo.findRoleById(data.role) : null,
        data.branchId ? this.staffRepo.findBranchById(data.branchId) : null,
      ]);

      if (existingEmail)
        throw new RpcException(`Email already exists: ${data.email}`);
      if (existingPhone)
        throw new RpcException(`Phone already exists: ${data.phone}`);
      if (!role) throw new RpcException(`Invalid role ID: ${data.role}`);
      if (data.branchId && !branch)
        throw new RpcException(`Invalid branch ID: ${data.branchId}`);

      // 🔹 Validate password
      const valid = PasswordValidator.validate(data.password);
      if (!valid.isValid) throw new RpcException(valid.message);

      // 🔹 Hash password
      const hashedPassword = await bcrypt.hash(data.password, 12);

      // 🔹 Generate customId if staff or external driver
      const isStaff = true;
      let customId: string | null = null;
      if (isStaff || role.name.toUpperCase() === 'DRIVER') {
        customId = await this.generateCustomId(role.name);
      }

      // 🔹 Prepare data for repository
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

      // 🔹 Create staff in DB
      const staff = await this.staffRepo.createStaff(prismaData);

      // 🔹 Fire-and-forget notification prefs
      this.staffRepo
        .createNotificationPreferences(staff.id)
        .catch((err) =>
          this.logger.error(
            `Failed to create notification prefs for staff ${staff.customId}`,
            err,
          ),
        );

      this.logger.log(`✅ Staff created successfully: ${staff.customId}`);
      return staff;
    } catch (error) {
      this.logger.error(`🚨 Error creating staff: ${error.message}`);
      throw new RpcException(error.message || 'Failed to create staff');
    }
  }

  /** 🔹 Generate custom ID using Redis counter with DB fallback */
  private async generateCustomId(roleName: string): Promise<string> {
    const prefix = 'LN';
    const roleAbbr = roleName.slice(0, 2).toUpperCase();
    const redisKey = `staff:counter:${roleAbbr}`;

    // 🔹 Increment Redis counter atomically
    let nextNumber = await this.redis.getClient().incr(redisKey);

    // 🔹 Fallback if Redis counter is 1, sync from DB
    if (nextNumber === 1) {
      const lastCustomId = await this.staffRepo.getLastCustomId(
        prefix,
        roleAbbr,
      );
      if (lastCustomId) {
        const lastNum = parseInt(lastCustomId.split('-')[2], 10);
        nextNumber = lastNum + 1;
        await this.redis.getClient().set(redisKey, String(nextNumber));
      }
    }

    return `${prefix}-${roleAbbr}-${String(nextNumber).padStart(5, '0')}`;
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
      return await this.staffRepo.findAllStaff(query);
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
      if (!staff)
        throw (
          new RpcException('User not found') &&
          this.logger.warn(`🗑️ Staff not founf with id: ${id}`)
        );

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
  // ✅ DEACTIVATE STAFF
  async deactivateStaff(id: string, userId: string) {
    try {
      this.logger.log(
        `🗑️ Deactivating staff with id: ${id} and initiated by user ${userId}`,
      );
      const staff = await this.staffRepo.findStaffById(userId);
      if (!staff) throw new RpcException(`Staff with id ${userId} not found`);
      return await this.staffRepo.deactivateStaff(id, userId);
    } catch (error) {
      this.logger.error(
        `🚨 Error deactivating staff: ${error.message}`,
        error.stack,
      );
      throw new RpcException(error.message || 'Failed to deactivate staff');
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

  //  async createDriver(data: CreateDriver, userId: string) {
  //     this.logger.log(
  //       `Creating driver for Email ${data.email} with vehicle ${data.vehicleId}, requested by user: ${userId}`,
  //     );

  //     try {
  //       // Validate input first
  //       if (!data.vehicleId || !data.roleId) {
  //         throw new RpcException({
  //           statusCode: 400,
  //           message: 'Vehicle ID and Role ID are required to create a driver.',
  //         });
  //       }

  //       // ✅ Run both lookups in parallel (faster)
  //       const [vehicle, role] = await Promise.all([
  //         this.staffRepo.findVehicleById(data.vehicleId),
  //         this.staffRepo.findRoleById(data.roleId),
  //       ]);

  //       if (!vehicle) {
  //         this.logger.warn(`Vehicle not found: ${data.vehicleId}`);
  //         throw new RpcException({
  //           statusCode: 404,
  //           message: `Vehicle with ID ${data.vehicleId} not found.`,
  //         });
  //       }

  //       if (!role) {
  //         this.logger.warn(`Role not found: ${data.roleId}`);
  //         throw new RpcException({
  //           statusCode: 404,
  //           message: `Role with ID ${data.roleId} not found.`,
  //         });
  //       }

  //       // ✅ Create user + driver + log + vehicle update in single transaction
  //       const { user, driver } = await this.staffRepo.createDriver(data, userId);

  //       this.logger.log(`Driver created successfully for ${data.email}`);

  //       // ✅ Merge response for efficiency & convenience
  //       return {
  //         success: true,
  //         message: 'Driver created successfully',
  //         data: {
  //           ...user,
  //           driver: {
  //             ...driver,
  //             vehicleId: data.vehicleId,
  //             roleId: data.roleId,
  //           },
  //         },
  //       };
  //     } catch (error) {
  //       this.logger.error(
  //         `Failed to create driver: ${error.message}`,
  //         error.stack,
  //       );
  //       throw error instanceof RpcException
  //         ? error
  //         : new RpcException({ message: error.message, statusCode: 500 });
  //     }
  //   }

  /** 🔹 Create driver with customId + fast performance */
  // async createDriver(data: any, userId: string) {
  //   this.logger.log(
  //     `Creating driver for Email ${data.email} and initiated by user: ${userId}`,
  //   );

  //   if (!data.vehicleId || !data.roleId) {
  //     throw new RpcException({
  //       statusCode: 400,
  //       message: 'Vehicle ID and Role ID are required.',
  //     });
  //   }

  //   // ✅ Parallel DB lookups
  //   const [vehicle, role, user] = await Promise.all([
  //     this.staffRepo.findVehicleById(data.vehicleId),
  //     this.staffRepo.findRoleById(data.roleId),
  //     this.staffRepo.findStaffByEmailAndPhone(data.email, data.phone),
  //   ]);

  //   if (!vehicle)
  //     throw new RpcException(`Vehicle not found: ${data.vehicleId}`);
  //   if (!role) throw new RpcException(`Role not found: ${data.roleId}`);
  //   if (user.existingEmailStaff)
  //     throw new RpcException('User already exists with this email.');
  //   if (user.existingStaffPhone)
  //     throw new RpcException('User already exists with this phone number.');

  //   // ✅ Generate custom ID if staff/driver
  //   const customId = await this.generateCustomId(role.name);
  //   const hashedPassword = await bcrypt.hash('default', 12);

  //   // ✅ Prepare user data
  //   const userData = {
  //     name: data.name,
  //     email: data.email,
  //     phone: data.phone ?? null,
  //     password: hashedPassword, // placeholder
  //     isStaff: true,
  //     isActive: true,
  //     customId,
  //     branchId: data.type === 'INTERNAL' ? data.branchId : null,
  //     roleId: data.roleId,
  //     emergencyContactName: data.emergencyContactName,
  //     emergencyContactPhone: data.emergencyContactPhone,
  //   };

  //   // ✅ Create driver and user in single transaction
  //   const result = await this.staffRepo.createDriver(userData, data, userId);

  //   this.logger.log(`Driver created successfully: ${customId}`);
  //   return {
  //     success: true,
  //     message: 'Driver created successfully',
  //     data: result,
  //   };
  // }

  async createDriver(data: any, userId: string) {
    this.logger.log(
      `Creating driver for Email ${data.email} and initiated by ${userId}`,
    );

    /* commented */
    // if (!data.vehicleId || !data.roleId) {
    //   throw new RpcException({
    //     statusCode: 400,
    //     message: 'Vehicle ID and Role ID are required.',
    //   });
    // }
    if (!data.role) {
      throw new RpcException({
        statusCode: 400,
        message: 'Role ID are required.',
      });
    }

    // 🔎 DB validation
    const [role, user] = await Promise.all([
      // this.staffRepo.findVehicleById(data.vehicleId),
      this.staffRepo.findRoleById(data.role),
      this.staffRepo.findStaffByEmailAndPhone(data.email, data.phone),
    ]);

    // if (!vehicle)
    //   throw new RpcException(`Vehicle not found: ${data.vehicleId}`);
    if (!role) throw new RpcException(`Role not found: ${data.roleId}`);
    if (user.existingEmailStaff) throw new RpcException('Email already exists');
    if (user.existingStaffPhone) throw new RpcException('Phone already exists');

    // -------------------------------------------------------------------
    // 1. 🔥 Upload images to Cloudinary
    // -------------------------------------------------------------------
    let uploadedFront = null;
    let uploadedBack = null;

    let frontBuffer: Buffer | null = null;
    let backBuffer: Buffer | null = null;

    if (data.licenseFront) {
      // Convert plain object to Buffer
      if (
        data.licenseFront.type === 'Buffer' &&
        Array.isArray(data.licenseFront.data)
      ) {
        frontBuffer = Buffer.from(data.licenseFront.data);
      } else if (Buffer.isBuffer(data.licenseFront)) {
        frontBuffer = data.licenseFront;
      }
    }

    if (data.licenseBack) {
      if (
        data.licenseBack.type === 'Buffer' &&
        Array.isArray(data.licenseBack.data)
      ) {
        backBuffer = Buffer.from(data.licenseBack.data);
      } else if (Buffer.isBuffer(data.licenseBack)) {
        backBuffer = data.licenseBack;
      }
    }

    if (data.licenseFront) {
      uploadedFront = await this.cloudinaryUploader.uploadFile(
        frontBuffer,
        `drivers/${data.email}/license/front`,
      );
    }
    console.log('Uploaded front image ::: ', uploadedFront);

    if (data.licenseBack) {
      uploadedBack = await this.cloudinaryUploader.uploadFile(
        backBuffer,
        `drivers/${data.email}/license/back`,
      );
    }
    console.log('Uploaded back image ::: ', uploadedBack);

    data.licenseFrontUrl = uploadedFront?.url || null;
    data.licenseBackUrl = uploadedBack?.url || null;

    console.log('Driver image after saved to cloudinary ::: Data:', data);

    // -------------------------------------------------------------------
    // 2. 🔥 OCR Extraction
    // -------------------------------------------------------------------
    // let ocrFront = null;
    // let ocrBack = null;

    // if (uploadedFront?.url) {
    //   ocrFront = await this.ocrService.extractFromImage(
    //     uploadedFront.url
    //   );
    // }

    // console.log(`Processed image for front :: `, ocrFront);

    // if (uploadedBack?.url) {
    //   ocrBack = await this.ocrService.extractFromImage(uploadedBack.url);
    // }

    // console.log(`Processed image for back ::: `, ocrBack);

    // // Merge best extracted values
    // const ocr = { ...ocrBack, ...ocrFront }; // front wins if both exist
    // console.log(`OCR big one :: `, ocr);

    // data.licenseNumber ||= ocr.licenseNumber;
    // data.expiryDate ||= ocr.expiryDate;
    // data.issueDate ||= ocr.issueDate;
    // data.phone ||= ocr.phone;

    // data.emergencyContactName ||= ocr.emergencyContactName;
    // data.emergencyContactPhone ||= ocr.emergencyContactPhone;

    // -------------------------------------------------------------------
    // 3. Continue your existing user creation logic
    // -------------------------------------------------------------------
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
      // branchId: data.type === 'INTERNAL' ? data.branchId : null,
      roleId: data.role,
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

  // Find Driver
  async findDriver(query: ListQueryDto) {
    this.logger.log(`Finding drivers with query: ${JSON.stringify(query)}`);

    try {
      console.log('=======================================11111');

      const drivers = await this.staffRepo.findDriver(query);
      console.log('=======================================11111', drivers);

      this.logger.verbose(`Found ${drivers.pagination.total} drivers`);
      return drivers;
    } catch (error) {
      console.log('=======================================');
      console.log(error);
      this.logger.error(`Find driver failed: ${error.message}`, error.stack);
      throw new RpcException(error.message);
    }
  }
}
