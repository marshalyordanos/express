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
        id: string;
        email: string;
    }>;
    getLastCustomId(prefix: string, roleAbbr: string): Promise<string>;
    createNotificationPreferences(id: string): Promise<{
        push: boolean;
        id: string;
        email: boolean;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        inApp: boolean;
    }>;
    findStaffByEmailAndPhone(email: string, phone: string): Promise<{
        existingEmailStaff: any;
        existingStaffPhone: any;
    }>;
    findRoleById(roleId: string): Promise<{
        name: string;
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
    }>;
    findByEmail(email: string): Promise<{
        password: string;
        name: string;
        id: string;
        customId: string | null;
        email: string;
        phone: string | null;
        branchId: string | null;
        createdAt: Date;
        updatedAt: Date;
        emailVerified: boolean;
        roleId: string | null;
        isStaff: boolean;
        isSuperAdmin: boolean;
        emergencyContactName: string | null;
        emergencyContactPhone: string | null;
        isActive: boolean;
        customerType: import(".prisma/client").$Enums.CustomerType | null;
        customerCategoryId: string | null;
        createdBy: string | null;
    }>;
    createStaff(data: any): Promise<{
        name: string;
        role: {
            name: string;
            id: string;
        };
        id: string;
        customId: string;
        email: string;
        phone: string;
        emailVerified: boolean;
        isStaff: boolean;
        emergencyContactName: string;
        emergencyContactPhone: string;
        isActive: boolean;
    }>;
    findByPhone(phone: string): Promise<{
        password: string;
        name: string;
        id: string;
        customId: string | null;
        email: string;
        phone: string | null;
        branchId: string | null;
        createdAt: Date;
        updatedAt: Date;
        emailVerified: boolean;
        roleId: string | null;
        isStaff: boolean;
        isSuperAdmin: boolean;
        emergencyContactName: string | null;
        emergencyContactPhone: string | null;
        isActive: boolean;
        customerType: import(".prisma/client").$Enums.CustomerType | null;
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
    findUserByEmail(email: string): Promise<User | null>;
    deleteStaff(id: string): Promise<{
        password: string;
        name: string;
        id: string;
        customId: string | null;
        email: string;
        phone: string | null;
        branchId: string | null;
        createdAt: Date;
        updatedAt: Date;
        emailVerified: boolean;
        roleId: string | null;
        isStaff: boolean;
        isSuperAdmin: boolean;
        emergencyContactName: string | null;
        emergencyContactPhone: string | null;
        isActive: boolean;
        customerType: import(".prisma/client").$Enums.CustomerType | null;
        customerCategoryId: string | null;
        createdBy: string | null;
    }>;
    findStaffById(id: string): Promise<{
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
    }>;
    findAllStaff(payload: ListQueryDto): Promise<{
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
    updateStaff(id: string, data: UpdateStaffDto): Promise<{
        name: string;
        id: string;
        email: string;
        phone: string;
        createdAt: Date;
        updatedAt: Date;
        emailVerified: boolean;
        createdBy: string;
    }>;
    findStaffByBranch(payload: ListQueryDto, branchId: string): Promise<{
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
    assignStaffToBranch(staffIds: string[], branchId: string): Promise<Prisma.BatchPayload>;
    findVehicleById(vehicleId: string): Promise<{
        type: string;
        status: import(".prisma/client").$Enums.VehicleStatus;
        id: string;
        model: string | null;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        plateNumber: string;
        driverId: string | null;
    }>;
    createDriver(userData: any, driverData: any, userId: string): Promise<{
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
    }>;
    findDriver(payload: ListQueryDto): Promise<{
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
            licenseNumber: string | null;
            licenseExpiry: Date | null;
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
