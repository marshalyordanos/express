import { DriverStatus, DriverType } from '@prisma/client';
export declare class RegisterStaffDto {
    name: string;
    email: string;
    password: string;
    role?: string;
    branchId?: string;
    phone?: string;
    emergencyContactPhone: string;
    emergencyContactName: string;
}
export declare class UpdateStaffDto {
    name: string;
    email: string;
    branchId?: string;
    phone?: string;
}
export declare class ChangeRoleDto {
    role: string;
    userId: string;
}
export declare class AssignStaffToBranchDto {
    staffIds: string[];
    branchId: string;
}
export declare class CreateDriver {
    name: string;
    email: string;
    password: string;
    roleId?: string;
    branchId?: string;
    phone?: string;
    licenseNumber: string;
    licenseExpiry: string;
    emergencyContactPhone: string;
    emergencyContactName: string;
    vehicleId: string;
    status: DriverStatus;
    type: DriverType;
    currentLat: number;
    currentLong: number;
}
