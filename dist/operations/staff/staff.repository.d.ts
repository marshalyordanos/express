import { User, Prisma, Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateStaffDto } from './staff.entity';
import { ListQueryDto } from '../../common/query/query.dto';
export declare class StaffRepository {
    private prisma;
    constructor(prisma: PrismaService);
    changeUserRole(userId: string, role: Role): Promise<Partial<User>>;
    deactivateStaff(id: string, userId: string): Promise<{
        name: string;
        email: string;
        id: string;
    }>;
    getLastCustomId(prefix: string, roleAbbr: string): Promise<string>;
    createNotificationPreferences(id: string): Promise<{
        email: boolean;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        inApp: boolean;
        push: boolean;
        userId: string;
    }>;
    findStaffByEmailAndPhone(email: string, phone: string): Promise<{
        existingEmailStaff: any;
        existingStaffPhone: any;
    }>;
    findRoleById(roleId: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        description: string | null;
    }>;
    findByEmail(email: string): Promise<{
        name: string;
        email: string;
        password: string;
        branchId: string | null;
        customerType: import(".prisma/client").$Enums.CustomerType | null;
        phone: string | null;
        id: string;
        customId: string | null;
        createdAt: Date;
        updatedAt: Date;
        emailVerified: boolean;
        roleId: string | null;
        isStaff: boolean;
        isSuperAdmin: boolean;
        emergencyContactName: string | null;
        emergencyContactPhone: string | null;
        isActive: boolean;
        customerCategoryId: string | null;
        createdBy: string | null;
    }>;
    createStaff(data: any): Promise<{
        name: string;
        email: string;
        role: {
            name: string;
            id: string;
        };
        phone: string;
        id: string;
        customId: string;
        emailVerified: boolean;
        isStaff: boolean;
        emergencyContactName: string;
        emergencyContactPhone: string;
        isActive: boolean;
    }>;
    findByPhone(phone: string): Promise<{
        name: string;
        email: string;
        password: string;
        branchId: string | null;
        customerType: import(".prisma/client").$Enums.CustomerType | null;
        phone: string | null;
        id: string;
        customId: string | null;
        createdAt: Date;
        updatedAt: Date;
        emailVerified: boolean;
        roleId: string | null;
        isStaff: boolean;
        isSuperAdmin: boolean;
        emergencyContactName: string | null;
        emergencyContactPhone: string | null;
        isActive: boolean;
        customerCategoryId: string | null;
        createdBy: string | null;
    }>;
    findRoleByName(roleName: string): Promise<{
        id: string;
    }>;
    findBranchById(branchId: string): Promise<{
        name: string;
        id: string;
    }>;
    findStaffByRole(roleId: string, payload: ListQueryDto): Promise<{
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
    findUserByEmail(email: string): Promise<User | null>;
    deleteStaff(id: string): Promise<{
        name: string;
        email: string;
        password: string;
        branchId: string | null;
        customerType: import(".prisma/client").$Enums.CustomerType | null;
        phone: string | null;
        id: string;
        customId: string | null;
        createdAt: Date;
        updatedAt: Date;
        emailVerified: boolean;
        roleId: string | null;
        isStaff: boolean;
        isSuperAdmin: boolean;
        emergencyContactName: string | null;
        emergencyContactPhone: string | null;
        isActive: boolean;
        customerCategoryId: string | null;
        createdBy: string | null;
    }>;
    findStaffById(id: string): Promise<{
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
    }>;
    findAllStaff(payload: ListQueryDto): Promise<{
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
    updateStaff(id: string, data: UpdateStaffDto): Promise<{
        name: string;
        email: string;
        phone: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        emailVerified: boolean;
        createdBy: string;
    }>;
    findStaffByBranch(payload: ListQueryDto, branchId: string): Promise<{
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
    assignStaffToBranch(staffIds: string[], branchId: string): Promise<Prisma.BatchPayload>;
    findVehicleById(vehicleId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        type: string;
        driverId: string | null;
        status: import(".prisma/client").$Enums.VehicleStatus;
        plateNumber: string;
        model: string | null;
        maxLoad: number | null;
    }>;
    createDriver(userData: any, driverData: any, userId: string): Promise<{
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
    }>;
    findDriver(payload: ListQueryDto): Promise<{
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
