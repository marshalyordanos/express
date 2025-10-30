import { Injectable, Logger } from '@nestjs/common';
import { AccessControlUsecase } from './access_control.usecase';
import { AccessControlRepository } from './access_control.repository';
import { IPagination } from '../../common/types';
import { Role, Permission, User } from '@prisma/client';
import {
  PermissionDto,
  RoleDto,
  ChangeRolePermissionDto,
  PermissionActionDto,
} from './access_control.entity';
import { RpcException } from '@nestjs/microservices';
import { AppLogger } from '../../common/app-logger.service';

@Injectable()
export class AccessControlUsecaseImpl implements AccessControlUsecase {
  constructor(
    private readonly repo: AccessControlRepository,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext('OperationsService', 'AccessControlUsecaseImpl');
  }

  // ---------- ROLES ----------
  async getRole(id: string): Promise<Role | null> {
    try {
      this.logger.log(`Fetching role with ID: ${id}`);
      const role = await this.repo.findRoleById(id);
      if (!role) {
        this.logger.warn(`Role not found: ${id}`);
        return null;
      }
      this.logger.log(`Role found: ${role.name} (${role.id})`);
      return role;
    } catch (error) {
      this.logger.error(`Error fetching role with ID ${id}:`, error);
      throw new RpcException('Failed to fetch role');
    }
  }

  async getAllRoles(
    page: number,
    pageSize: number,
    search?: string,
  ): Promise<{ roles: Partial<RoleDto>[]; pagination: IPagination }> {
    try {
      this.logger.log(
        `Fetching all roles - Page: ${page}, PageSize: ${pageSize}, Search: ${search || 'N/A'}`,
      );
      const result = await this.repo.findAllRoles(page, pageSize, search);
      this.logger.log(`Fetched ${result.roles.length} roles`);
      return result;
    } catch (error) {
      this.logger.error('Error fetching roles:', error);
      throw new RpcException('Failed to fetch roles');
    }
  }

  async createRole(data: Partial<RoleDto>): Promise<Role> {
    try {
      this.logger.log('Creating new role with data:', data as string);
      const role = await this.repo.createRole(data);
      this.logger.log(`Role created successfully: ${role.name} (${role.id})`);
      return role;
    } catch (error) {
      this.logger.error('Error creating role:', error);
      throw new RpcException('Failed to create role');
    }
  }

  async updateRole(id: string, data: Partial<RoleDto>): Promise<Role> {
    try {
      this.logger.log(`Updating role ID: ${id} with data:`, data as string);
      const role = await this.repo.findRoleById(id);
      if (!role) {
        this.logger.warn(`Role not found: ${id}`);
        throw new RpcException('Role not found');
      }
      const updated = await this.repo.updateRole(id, data);
      this.logger.log(
        `Role updated successfully: ${updated.name} (${updated.id})`,
      );
      return updated;
    } catch (error) {
      this.logger.error(`Error updating role ID ${id}:`, error);
      throw new RpcException('Failed to update role');
    }
  }

  async deleteRole(id: string): Promise<Role> {
    try {
      this.logger.log(`Deleting role ID: ${id}`);
      const role = await this.repo.findRoleById(id);
      if (!role) {
        this.logger.warn(`Role not found: ${id}`);
        throw new RpcException('Role not found');
      }
      const deleted = await this.repo.deleteRole(id);
      this.logger.log(
        `Role deleted successfully: ${deleted.name} (${deleted.id})`,
      );
      return deleted;
    } catch (error) {
      this.logger.error(`Error deleting role ID ${id}:`, error);
      throw new RpcException('Failed to delete role');
    }
  }

  // ---------- PERMISSIONS ----------
  async getPermission(id: string): Promise<Permission | null> {
    try {
      this.logger.log(`Fetching permission with ID: ${id}`);
      const permission = await this.repo.findPermissionById(id);
      if (!permission) {
        this.logger.warn(`Permission not found: ${id}`);
        return null;
      }
      this.logger.log(`Found permission: ${permission.resource}`);
      return permission;
    } catch (error) {
      this.logger.error(`Error fetching permission ${id}:`, error);
      throw new RpcException('Failed to fetch permission');
    }
  }

  async getAllPermissions(
    page: number,
    pageSize: number,
    search?: string,
  ): Promise<{
    permissions: Partial<PermissionDto>[];
    pagination: IPagination;
  }> {
    try {
      this.logger.log(
        `Fetching all permissions - Page: ${page}, PageSize: ${pageSize}, Search: ${search || 'N/A'}`,
      );
      const result = await this.repo.findAllPermissions(page, pageSize, search);
      this.logger.log(`Retrieved ${result.permissions.length} permissions`);
      return result;
    } catch (error) {
      this.logger.error('Error fetching permissions:', error);
      throw new RpcException('Failed to fetch permissions');
    }
  }

  async createPermission(data: Partial<PermissionDto>): Promise<Permission> {
    try {
      this.logger.log('Creating permission with data:', data as string);
      const created = await this.repo.createPermission(data);
      this.logger.log(
        `Created permission: ${created.resource} (${created.id})`,
      );
      return created;
    } catch (error) {
      this.logger.error('Error creating permission:', error);
      throw new RpcException('Failed to create permission');
    }
  }

  async updatePermission(
    id: string,
    data: Partial<PermissionDto>,
  ): Promise<Permission> {
    try {
      this.logger.log(`Updating permission ID: ${id}`);
      const existing = await this.repo.findPermissionById(id);
      if (!existing) {
        this.logger.warn(`Permission not found: ${id}`);
        throw new RpcException('Permission not found');
      }
      const updated = await this.repo.updatePermission(id, data);
      this.logger.log(
        `Updated permission: ${updated.resource} (${updated.id})`,
      );
      return updated;
    } catch (error) {
      this.logger.error(`Error updating permission ${id}:`, error);
      throw new RpcException('Failed to update permission');
    }
  }

  async deletePermission(id: string): Promise<Permission> {
    try {
      this.logger.log(`Deleting permission ID: ${id}`);
      const existing = await this.repo.findPermissionById(id);
      if (!existing) {
        this.logger.warn(`Permission not found: ${id}`);
        throw new RpcException('Permission not found');
      }
      const deleted = await this.repo.deletePermission(id);
      this.logger.log(
        `Deleted permission: ${deleted.resource} (${deleted.id})`,
      );
      return deleted;
    } catch (error) {
      this.logger.error(`Error deleting permission ${id}:`, error);
      throw new RpcException('Failed to delete permission');
    }
  }
  // ---------- ROLE ↔ PERMISSION ----------
  async assignPermissionsToRole(data: ChangeRolePermissionDto): Promise<Role> {
    try {
      this.logger.log(`Assigning permissions to role: ${data.roleId}`);

      if (!data.permissions || data.permissions.length === 0) {
        this.logger.warn(`No permissions provided`);
        throw new RpcException({
          code: 400,
          message: "Permissions don't exist!",
        });
      }

      const result = await this.repo.assignPermissionsToRole(data);
      this.logger.log(
        `Assigned ${data.permissions.length} permission(s) to role ${data.roleId}`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Error assigning permissions to role ${data.roleId}:`,
        error,
      );
      throw new RpcException({
        code: error.code || 500,
        message: error.message || 'Failed to assign permissions to role',
      });
    }
  }

  async updatedPermissionFromRole(
    roleId: string,
    data: PermissionActionDto,
  ): Promise<Role> {
    try {
      this.logger.log(
        `Updating permission ${data.permissionId} for role ${roleId}`,
      );

      const perm = await this.repo.findRolePermission(
        roleId,
        data.permissionId,
      );
      if (!perm) {
        this.logger.warn(
          `RolePermission not found: Role ${roleId}, Permission ${data.permissionId}`,
        );
        throw new RpcException({
          code: 400,
          message: "RolePermission doesn't exist",
        });
      }

      const updated = await this.repo.updatePermissionFromRole(roleId, data);
      this.logger.log(
        `Updated permission ${data.permissionId} for role ${roleId}`,
      );
      return updated;
    } catch (error) {
      this.logger.error(`Error updating permission for role ${roleId}:`, error);
      throw new RpcException({
        code: error.code || 500,
        message: error.message || 'Failed to update permission from role',
      });
    }
  }

  async removePermissionFromRole(
    roleId: string,
    permissionId: string,
  ): Promise<Role> {
    try {
      this.logger.log(
        `Removing permission ${permissionId} from role ${roleId}`,
      );

      const perm = await this.repo.findRolePermission(roleId, permissionId);
      if (!perm) {
        this.logger.warn(
          `RolePermission not found: Role ${roleId}, Permission ${permissionId}`,
        );
        throw new RpcException({
          code: 400,
          message: "RolePermission doesn't exist",
        });
      }

      const removed = await this.repo.removePermissionFromRole(
        roleId,
        permissionId,
      );
      this.logger.log(`Removed permission ${permissionId} from role ${roleId}`);
      return removed;
    } catch (error) {
      this.logger.error(
        `Error removing permission from role ${roleId}:`,
        error,
      );
      throw new RpcException({
        code: error.code || 500,
        message: error.message || 'Failed to remove permission from role',
      });
    }
  }

  async assignRoleToUser(userId: string, roleId: string): Promise<User> {
    try {
      this.logger.log(`Assigning role ${roleId} to user ${userId}`);

      const role = await this.repo.findRoleById(roleId);
      if (!role) {
        this.logger.warn(`Role not found: ${roleId}`);
        throw new RpcException({
          code: 400,
          message: "Role doesn't exist",
        });
      }

      const user = await this.repo.findUserById(userId);
      if (!user) {
        this.logger.warn(`User not found: ${userId}`);
        throw new RpcException({
          code: 400,
          message: "User doesn't exist",
        });
      }

      const assigned = await this.repo.assignRoleToUser(userId, roleId);
      this.logger.log(`Assigned role ${roleId} to user ${userId}`);
      return assigned;
    } catch (error) {
      this.logger.error(
        `Error assigning role ${roleId} to user ${userId}:`,
        error,
      );
      throw new RpcException({
        code: error.code || 500,
        message: error.message || 'Failed to assign role to user',
      });
    }
  }
}
