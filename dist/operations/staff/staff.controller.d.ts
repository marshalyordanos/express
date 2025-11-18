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
    }[]>>;
    findStaff(payload: {
        query: ListQueryDto;
    }): Promise<IResponse<{
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
    }[]>>;
    changeUserRole(payload: {
        data: ChangeRoleDto;
    }): Promise<IResponse<Partial<{
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
    }>>>;
    deleteStaff(payload: {
        id: string;
    }): Promise<IResponse<string>>;
    findStaffById(payload: {
        id: string;
    }): Promise<IResponse<Partial<{
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
    }>>>;
    updateStaff(payload: {
        id: string;
        data: UpdateStaffDto;
    }): Promise<IResponse<Partial<{
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
    }>>>;
    findStaffByBranch(payload: {
        query: ListQueryDto;
        branchId: string;
        headers: {
            authorization: string;
        };
    }): Promise<IResponse<{
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
    }>>;
    findDriver(payload: {
        query: ListQueryDto;
    }): Promise<IResponse<{
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
    }>>;
}
