import { StaffUsecase } from './staff.useCase';
import { ChangeRoleDto, RegisterStaffDto, UpdateStaffDto } from './staff.entity';
import { Prisma, User } from '@prisma/client';
import { StaffRepository } from './staff.repository';
import { ListQueryDto } from '../../common/query/query.dto';
import { AppLogger } from '../../common/app-logger.service';
import { RedisService } from '../..//redis/redis.service';
import { CloudinaryUploaderService } from '../../common/cloudinary/cloudinary-uploader.service';
export declare class StaffUseCasesImpl implements StaffUsecase {
    private readonly staffRepo;
    private readonly logger;
    private readonly redis;
    private readonly cloudinaryUploader;
    constructor(staffRepo: StaffRepository, logger: AppLogger, redis: RedisService, cloudinaryUploader: CloudinaryUploaderService);
    createStaff(data: RegisterStaffDto, createdBy: string): Promise<any>;
    private generateCustomId;
    findStaffByRole(query: ListQueryDto, role: string): Promise<{
        Staffs: {
            name: string;
            email: string;
            role: {
                name: string;
                id: string;
            };
            phone: string;
            id: string;
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
            email: string;
            role: {
                name: string;
                id: string;
            };
            phone: string;
            id: string;
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
            email: string;
            role: {
                name: string;
                id: string;
            };
            phone: string;
            id: string;
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
        email: string;
        id: string;
    }>;
    assignStaffToBranch(staffIds: string[], branchId: string): Promise<Prisma.BatchPayload>;
    createDriver(data: any, userId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            user: {
                name: string;
                email: string;
                phone: string;
                id: string;
                customId: string;
                roleId: string;
            };
            driver: {
                id: string;
                type: import(".prisma/client").$Enums.DriverType;
                status: import(".prisma/client").$Enums.DriverStatus;
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
                email: string;
                phone: string;
                id: string;
            };
            vehicles: {
                id: string;
                status: import(".prisma/client").$Enums.VehicleStatus;
                plateNumber: string;
                model: string;
            }[];
        } & {
            id: string;
            updatedAt: Date | null;
            createdBy: string | null;
            userId: string;
            type: import(".prisma/client").$Enums.DriverType;
            status: import(".prisma/client").$Enums.DriverStatus;
            vehicleId: string | null;
            currentLat: number | null;
            availablityStatus: import(".prisma/client").$Enums.DriverAvailabilityStatus;
            licenseNumber: string | null;
            licenseExpiry: Date | null;
            licenseIssue: Date | null;
            frontImageUrl: string | null;
            backImageUrl: string | null;
            verifiedByOCR: boolean;
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
