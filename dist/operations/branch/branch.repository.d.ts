import { PrismaService } from '../../prisma/prisma.service';
import { BranchCreateDto, BranchUpdateDto } from './branch.entity';
import { Branch } from '@prisma/client';
import { ListQueryDto } from '../../common/query/query.dto';
export declare class BranchRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findBranchAndBranchManager(managerId: string, branchId: string): Promise<[{
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
    }, {
        manager: {
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
            label: string;
            id: string;
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
        branches: any[];
        pagination: {
            total: number;
            page: number;
            pageSize: number;
            totalPages: number;
        };
    }>;
    createBranch(data: BranchCreateDto, address: any, userId: string): Promise<Branch>;
    findBranchById(id: string): Promise<Partial<Branch> | null>;
}
