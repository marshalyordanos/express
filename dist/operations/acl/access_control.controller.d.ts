import { AccessControlUsecaseImpl } from './access_control.usecase.impl';
import { PermissionDto, RoleDto, ChangeRolePermissionDto, PermissionActionDto, AssignUserRoleDto } from './access_control.entity';
import { IResponse } from '../../common/types';
import { ListQueryDto } from '../../common/query/query.dto';
export declare class AccessControlMessageController {
    private readonly usecases;
    constructor(usecases: AccessControlUsecaseImpl);
    findRoleById(payload: {
        id: string;
    }): Promise<IResponse<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        description: string | null;
    }>>;
    findAllRoles(payload: any): Promise<IResponse<Partial<RoleDto>[]>>;
    createRole(payload: {
        data: Partial<RoleDto>;
    }): Promise<IResponse<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        description: string | null;
    }>>;
    updateRole(payload: {
        id: string;
        data: Partial<RoleDto>;
    }): Promise<IResponse<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        description: string | null;
    }>>;
    deleteRole(payload: {
        id: string;
    }): Promise<IResponse<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        description: string | null;
    }>>;
    getAllRolesFree(payload: {
        query: ListQueryDto;
    }): Promise<IResponse<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
    }[]>>;
    findPermissionById(payload: {
        id: string;
    }): Promise<IResponse<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        description: string | null;
        resource: string;
    }>>;
    findAllPermissions(payload: any): Promise<IResponse<Partial<PermissionDto>[]>>;
    createPermission(payload: {
        data: PermissionDto;
    }): Promise<IResponse<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        description: string | null;
        resource: string;
    }>>;
    updatePermission(payload: {
        id: string;
        data: Partial<PermissionDto>;
    }): Promise<IResponse<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        description: string | null;
        resource: string;
    }>>;
    deletePermission(payload: {
        id: string;
    }): Promise<IResponse<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        description: string | null;
        resource: string;
    }>>;
    assignPermissionsToRole(payload: {
        data: ChangeRolePermissionDto;
    }): Promise<IResponse<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        description: string | null;
    }>>;
    updatePermissionFromRole(payload: {
        roleId: string;
        data: PermissionActionDto;
    }): Promise<IResponse<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        description: string | null;
    }>>;
    removePermissionFromRole(payload: {
        roleId: string;
        permissionId: string;
    }): Promise<IResponse<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        description: string | null;
    }>>;
    assignUserRole(payload: {
        data: AssignUserRoleDto;
    }): Promise<IResponse<{
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
    }>>;
}
