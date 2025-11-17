import { PrismaService } from '../../prisma/prisma.service';
import { Role, Permission, RolePermission, User } from '@prisma/client';
import { IPagination } from 'src/common/types';
import { PermissionDto, RoleDto, ChangeRolePermissionDto, PermissionActionDto } from './access_control.entity';
import { ListQueryDto } from '../../common/query/query.dto';
export declare class AccessControlRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findRoleById(id: string): Promise<Role | null>;
    findAllRole(payload: ListQueryDto): Promise<{
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
    findAllRoles(page: number, pageSize: number, search?: string): Promise<{
        roles: Partial<RoleDto>[];
        pagination: IPagination;
    }>;
    createRole(data: Partial<RoleDto>): Promise<Role>;
    updateRole(id: string, data: Partial<RoleDto>): Promise<Role>;
    deleteRole(id: string): Promise<Role>;
    findPermissionById(id: string): Promise<Permission | null>;
    findRolePermission(roleId: string, permissionId: string): Promise<RolePermission | null>;
    findAllPermissions(page: number, pageSize: number, search?: string): Promise<{
        permissions: Partial<PermissionDto>[];
        pagination: IPagination;
    }>;
    createPermission(data: Partial<PermissionDto>): Promise<Permission>;
    updatePermission(id: string, data: Partial<PermissionDto>): Promise<Permission>;
    deletePermission(id: string): Promise<Permission>;
    assignPermissionsToRole(data: ChangeRolePermissionDto): Promise<Role>;
    updatePermissionFromRole(roleId: string, data: PermissionActionDto): Promise<Role>;
    removePermissionFromRole(roleId: string, permissionId: string): Promise<Role>;
    assignRoleToUser(userId: string, roleId: string): Promise<User>;
    findUserById(id: string): Promise<User | null>;
}
