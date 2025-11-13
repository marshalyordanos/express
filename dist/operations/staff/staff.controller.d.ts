import { IResponse } from '../../common/types';
import { AssignStaffToBranchDto, ChangeRoleDto, CreateDriver, UpdateStaffDto } from './staff.entity';
import { StaffUseCasesImpl } from './staff.useCase.impl';
import { RegisterStaffDto } from './staff.entity';
import { ListQueryDto } from '../../common/query/query.dto';
export declare class StaffMessageController {
    private readonly usecases;
    constructor(usecases: StaffUseCasesImpl);
    createStaff(payload: {
        user: any;
        data: RegisterStaffDto;
    }): Promise<IResponse<any>>;
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
    }>>>;
    updateStaff(payload: {
        id: string;
        data: UpdateStaffDto;
    }): Promise<IResponse<Partial<{
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
    createDriver(payload: {
        data: CreateDriver;
        user: any;
    }): Promise<IResponse<{
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
    }>>;
    findDriver(payload: {
        query: ListQueryDto;
    }): Promise<IResponse<{
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
    }>>;
}
