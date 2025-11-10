export declare class RegisterStaffDto {
    name: string;
    email: string;
    password: string;
    role?: string;
    branchId?: string;
    phone?: string;
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
