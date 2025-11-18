import { PrismaService } from '../../prisma/prisma.service';
import { BranchCreateDto, BranchUpdateDto } from './branch.entity';
import { Branch } from '@prisma/client';
import { ListQueryDto } from '../../common/query/query.dto';
export declare class BranchRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findBranchAndBranchManager(managerId: string, branchId: string): Promise<[{
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
    }, {
        manager: {
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
        };
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        location: string;
        managerId: string | null;
    }]>;
    findManagedBranch(branchId: string, userId: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        location: string;
        managerId: string | null;
    }>;
    revokeManager(branchId: string, managerId: string): Promise<void>;
    assignManager(branchId: string, managerId: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        location: string;
        managerId: string | null;
    }>;
    deleteBranch(id: string): import(".prisma/client").Prisma.Prisma__BranchClient<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        location: string;
        managerId: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    updateBranch(id: string, data: Partial<BranchUpdateDto>): Promise<{
        address: {
            id: string;
            label: string;
            city: string;
            state: string;
            country: string;
        };
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        location: string;
        managerId: string | null;
    }>;
    findAllBranch(payload: ListQueryDto): Promise<{
        branches: {
            id: string;
            name: string;
            location: string;
            manager: {
                name: string;
                id: string;
            };
            totalOrders: number;
            activeOrders: number;
            interbranchActive: number;
            staffCount: number;
            revenue: number;
            efficiency: number;
            status: string;
        }[];
        pagination: {
            total: number;
            page: number;
            pageSize: number;
            totalPages: number;
        };
    }>;
    createBranch(data: BranchCreateDto, address: any, userId: string): Promise<Branch>;
    findBranchById(id: string): Promise<Partial<Branch> | null>;
    findAllBranchFree(payload: ListQueryDto): Promise<{
        branches: {
            name: string;
            id: string;
            location: string;
        }[];
        pagination: {
            total: number;
            page: number;
            pageSize: number;
            totalPages: number;
        };
    }>;
}
