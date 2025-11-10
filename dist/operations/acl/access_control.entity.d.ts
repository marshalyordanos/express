export declare class PermissionDto {
    resource: string;
    description?: string;
}
export declare class RoleDto {
    name: string;
    description?: string;
    permissions: PermissionDto[];
}
export declare class PermissionActionDto {
    permissionId: string;
    createAction?: boolean;
    readAction?: boolean;
    updateAction?: boolean;
    deleteAction?: boolean;
    scopes?: string[];
}
export declare class ChangeRolePermissionDto {
    roleId: string;
    permissions?: PermissionActionDto[];
}
export declare class RemovePermissionDto {
    permissionId: string;
}
export declare class AssignUserRoleDto {
    userId: string;
    roleId: string;
}
