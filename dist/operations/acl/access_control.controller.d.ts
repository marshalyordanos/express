import { AccessControlUsecaseImpl } from './access_control.usecase.impl';
import { PermissionDto, RoleDto, ChangeRolePermissionDto, PermissionActionDto, AssignUserRoleDto } from './access_control.entity';
import { IResponse } from '../../common/types';
export declare class AccessControlMessageController {
    private readonly usecases;
    constructor(usecases: AccessControlUsecaseImpl);
    findRoleById(payload: {
        id: string;
    }): Promise<IResponse<{
        name: string;
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
    }>>;
    findAllRoles(payload: any): Promise<IResponse<Partial<RoleDto>[]>>;
    createRole(payload: {
        data: Partial<RoleDto>;
    }): Promise<IResponse<{
        name: string;
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
    }>>;
    updateRole(payload: {
        id: string;
        data: Partial<RoleDto>;
    }): Promise<IResponse<{
        name: string;
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
    }>>;
    deleteRole(payload: {
        id: string;
    }): Promise<IResponse<{
        name: string;
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
    }>>;
    findPermissionById(payload: {
        id: string;
    }): Promise<IResponse<{
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        resource: string;
    }>>;
    findAllPermissions(payload: any): Promise<IResponse<Partial<PermissionDto>[]>>;
    createPermission(payload: {
        data: PermissionDto;
    }): Promise<IResponse<{
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        resource: string;
    }>>;
    updatePermission(payload: {
        id: string;
        data: Partial<PermissionDto>;
    }): Promise<IResponse<{
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        resource: string;
    }>>;
    deletePermission(payload: {
        id: string;
    }): Promise<IResponse<{
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        resource: string;
    }>>;
    assignPermissionsToRole(payload: {
        data: ChangeRolePermissionDto;
    }): Promise<IResponse<{
        name: string;
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
    }>>;
    updatePermissionFromRole(payload: {
        roleId: string;
        data: PermissionActionDto;
    }): Promise<IResponse<{
        name: string;
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
    }>>;
    removePermissionFromRole(payload: {
        roleId: string;
        permissionId: string;
    }): Promise<IResponse<{
        name: string;
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
    }>>;
    assignUserRole(payload: {
        data: AssignUserRoleDto;
    }): Promise<IResponse<{
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
    }>>;
}
