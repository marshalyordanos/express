import { StaffUsecase } from './staff.useCase';
import { ChangeRoleDto, RegisterStaffDto, UpdateStaffDto } from './staff.entity';
import { Prisma, User } from '@prisma/client';
import { StaffRepository } from './staff.repository';
import { ListQueryDto } from '../../common/query/query.dto';
import { AppLogger } from '../../common/app-logger.service';
import { RedisService } from '../..//redis/redis.service';
import { CloudinaryUploaderService } from '../../common/cloudinary/cloudinary-uploader.service';
import { CommonOCRService } from '../../common/ocr/ocr.service';
export declare class StaffUseCasesImpl implements StaffUsecase {
    private readonly staffRepo;
    private readonly logger;
    private readonly redis;
    private readonly cloudinaryUploader;
    private readonly ocrService;
    constructor(staffRepo: StaffRepository, logger: AppLogger, redis: RedisService, cloudinaryUploader: CloudinaryUploaderService, ocrService: CommonOCRService);
    createStaff(data: RegisterStaffDto, createdBy: string): Promise<any>;
    private generateCustomId;
    findStaffByRole(query: ListQueryDto, role: string): Promise<{
        Staffs: {
            name: string;
            role: {
                name: string;
                id: string;
            };
            id: string;
            email: string;
            phone: string;
            createdAt: Date;
            updatedAt: Date;
            emailVerified: boolean;
            createdBy: string;
            branch: {
                name: string;
                id: string;
            };
        }[];
        pagination: {
            total: number;
            page: number;
            pageSize: number;
            totalPages: number;
        };
    }>;
    findAllStaff(query: ListQueryDto): Promise<{
        Staffs: {
            name: string;
            role: {
                name: string;
                id: string;
            };
            id: string;
            email: string;
            phone: string;
            createdAt: Date;
            updatedAt: Date;
            emailVerified: boolean;
            createdBy: string;
            branch: {
                name: string;
                id: string;
            };
        }[];
        pagination: {
            total: number;
            page: number;
            pageSize: number;
            totalPages: number;
        };
    }>;
    changeUserRole(data: ChangeRoleDto): Promise<Partial<User>>;
    deleteStaff(id: string): Promise<string>;
    findStaffById(id: string): Promise<Partial<User>>;
    updateStaff(id: string, data: UpdateStaffDto): Promise<Partial<User>>;
    findStaffByBranch(query: ListQueryDto, branchId: string): Promise<{
        Staffs: {
            name: string;
            role: {
                name: string;
                id: string;
            };
            id: string;
            email: string;
            phone: string;
            createdAt: Date;
            updatedAt: Date;
            emailVerified: boolean;
            createdBy: string;
            branch: {
                name: string;
                id: string;
            };
        }[];
        pagination: {
            total: number;
            page: number;
            pageSize: number;
            totalPages: number;
        };
    }>;
    deactivateStaff(id: string, userId: string): Promise<{
        name: string;
        id: string;
        email: string;
    }>;
    assignStaffToBranch(staffIds: string[], branchId: string): Promise<Prisma.BatchPayload>;
    createDriver(data: any, userId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            user: {
                name: string;
                id: string;
                customId: string;
                email: string;
                phone: string;
                roleId: string;
            };
            driver: {
                type: import(".prisma/client").$Enums.DriverType;
                status: import(".prisma/client").$Enums.DriverStatus;
                id: string;
                vehicleId: string;
                licenseNumber: string;
                licenseExpiry: Date;
            };
        };
    }>;
    findDriver(query: ListQueryDto): Promise<{
        drivers: ({
            user: {
                name: string;
                id: string;
                email: string;
                phone: string;
            };
            vehicles: {
                status: import(".prisma/client").$Enums.VehicleStatus;
                id: string;
                model: string;
                plateNumber: string;
            }[];
        } & {
            type: import(".prisma/client").$Enums.DriverType;
            status: import(".prisma/client").$Enums.DriverStatus;
            id: string;
            updatedAt: Date | null;
            createdBy: string | null;
            userId: string;
            vehicleId: string | null;
            availablityStatus: import(".prisma/client").$Enums.DriverAvailabilityStatus;
            licenseNumber: string | null;
            licenseExpiry: Date | null;
            licenseIssue: Date | null;
            frontImageUrl: string | null;
            backImageUrl: string | null;
            verifiedByOCR: boolean;
            currentLat: number | null;
            currentLon: number | null;
        })[];
        pagination: {
            total: number;
            page: number;
            pageSize: number;
            totalPages: number;
        };
    }>;
}
