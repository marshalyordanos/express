import { StaffUsecase } from './staff.useCase';
import { ChangeRoleDto, RegisterStaffDto, UpdateStaffDto } from './staff.entity';
import { Prisma, User } from '@prisma/client';
import { StaffRepository } from './staff.repository';
import { ListQueryDto } from '../../common/query/query.dto';
import { AppLogger } from '../../common/app-logger.service';
export declare class StaffUseCasesImpl implements StaffUsecase {
    private readonly staffRepo;
    private readonly logger;
    constructor(staffRepo: StaffRepository, logger: AppLogger);
    createStaff(data: RegisterStaffDto, userId: string): Promise<User>;
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
    assignStaffToBranch(staffIds: string[], branchId: string): Promise<Prisma.BatchPayload>;
}
