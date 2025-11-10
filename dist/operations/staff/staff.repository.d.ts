import { User, Prisma, Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UserDto } from '../user/user.entity';
import { UpdateStaffDto } from './staff.entity';
import { ListQueryDto } from '../../common/query/query.dto';
export declare class StaffRepository {
    private prisma;
    constructor(prisma: PrismaService);
    changeUserRole(userId: string, role: Role): Promise<Partial<User>>;
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
    createStaff(data: UserDto, userId: string): Promise<User>;
    findRoleByName(roleName: string): Promise<{
        name: string;
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
    }>;
    findBranchById(branchId: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        location: string;
        managerId: string | null;
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
        email: string;
        phone: string | null;
        branchId: string | null;
        createdAt: Date;
        updatedAt: Date;
        emailVerified: boolean;
        roleId: string | null;
        isStaff: boolean;
        isSuperAdmin: boolean;
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
}
