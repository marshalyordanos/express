export declare class RoleCreateDto {
    name: string;
    description?: string;
}
export declare class RoleResponseDto {
    id: string;
    name: string;
    description: string;
}
export declare class RoleUpdateDto {
    name: string;
    description: string;
}
export declare enum Role {
    BRANCH_MANAGER = "BRANCH_MANAGER",
    DISPATCH_OFFICER = "DISPATCH_OFFICER",
    DRIVER = "DRIVER",
    CUSTOMER = "CUSTOMER",
    CUSTOMER_SERVICE = "CUSTOMER_SERVICE"
}
