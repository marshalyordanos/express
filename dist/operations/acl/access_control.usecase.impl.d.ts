import { AccessControlUsecase } from './access_control.usecase';
import { AccessControlRepository } from './access_control.repository';
import { IPagination } from '../../common/types';
import { Role, Permission, User } from '@prisma/client';
import { PermissionDto, RoleDto, ChangeRolePermissionDto, PermissionActionDto } from './access_control.entity';
import { AppLogger } from '../../common/app-logger.service';
import { ListQueryDto } from 'src/common/query/query.dto';
export declare class AccessControlUsecaseImpl implements AccessControlUsecase {
    private readonly repo;
    private readonly logger;
    constructor(repo: AccessControlRepository, logger: AppLogger);
    getRole(id: string): Promise<Role | null>;
    getAllRoles(page: number, pageSize: number, search?: string): Promise<{
        roles: Partial<RoleDto>[];
        pagination: IPagination;
    }>;
    createRole(data: Partial<RoleDto>): Promise<Role>;
    updateRole(id: string, data: Partial<RoleDto>): Promise<Role>;
    deleteRole(id: string): Promise<Role>;
    getPermission(id: string): Promise<Permission | null>;
    getAllPermissions(page: number, pageSize: number, search?: string): Promise<{
        permissions: Partial<PermissionDto>[];
        pagination: IPagination;
    }>;
    createPermission(data: Partial<PermissionDto>): Promise<Permission>;
    updatePermission(id: string, data: Partial<PermissionDto>): Promise<Permission>;
    deletePermission(id: string): Promise<Permission>;
    assignPermissionsToRole(data: ChangeRolePermissionDto): Promise<Role>;
    updatedPermissionFromRole(roleId: string, data: PermissionActionDto): Promise<Role>;
    removePermissionFromRole(roleId: string, permissionId: string): Promise<Role>;
    assignRoleToUser(userId: string, roleId: string): Promise<User>;
    findAllRoles(query: ListQueryDto): Promise<{
        roles: {
            name: string;
            id: string;
            description: string;
            createdAt: Date;
            updatedAt: Date;
        }[];
        pagination: {
            total: number;
            page: number;
            pageSize: number;
            totalPages: number;
        };
    }>;
}
