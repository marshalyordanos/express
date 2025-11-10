import { IResponse } from '../../common/types';
import { AssignStaffToBranchDto, ChangeRoleDto, UpdateStaffDto } from './staff.entity';
import { StaffUseCasesImpl } from './staff.useCase.impl';
import { RegisterStaffDto } from './staff.entity';
import { ListQueryDto } from '../../common/query/query.dto';
export declare class StaffMessageController {
    private readonly usecases;
    constructor(usecases: StaffUseCasesImpl);
    createStaff(payload: {
        user: any;
        data: RegisterStaffDto;
    }): Promise<IResponse<{
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
    }>>;
    findStaffByRole(payload: {
        query: ListQueryDto;
        role: string;
        headers: {
            authorization: string;
        };
    }): Promise<IResponse<{
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
    }[]>>;
    findStaff(payload: {
        query: ListQueryDto;
    }): Promise<IResponse<{
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
    }[]>>;
    changeUserRole(payload: {
        data: ChangeRoleDto;
    }): Promise<IResponse<Partial<{
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
    }>>>;
    deleteStaff(payload: {
        id: string;
    }): Promise<IResponse<string>>;
    findStaffById(payload: {
        id: string;
    }): Promise<IResponse<Partial<{
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
    }>>>;
    updateStaff(payload: {
        id: string;
        data: UpdateStaffDto;
    }): Promise<IResponse<Partial<{
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
    }>>>;
    findStaffByBranch(payload: {
        query: ListQueryDto;
        branchId: string;
        headers: {
            authorization: string;
        };
    }): Promise<IResponse<{
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
    }[]>>;
    assignStaffToBranch(payload: {
        data: AssignStaffToBranchDto;
    }): Promise<IResponse<import(".prisma/client").Prisma.BatchPayload>>;
}
