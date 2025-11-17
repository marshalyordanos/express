"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccessControlUsecaseImpl = void 0;
const common_1 = require("@nestjs/common");
const access_control_repository_1 = require("./access_control.repository");
const microservices_1 = require("@nestjs/microservices");
const app_logger_service_1 = require("../../common/app-logger.service");
let AccessControlUsecaseImpl = class AccessControlUsecaseImpl {
    constructor(repo, logger) {
        this.repo = repo;
        this.logger = logger;
        this.logger.setContext('OperationsService', 'AccessControlUsecaseImpl');
    }
    async getRole(id) {
        try {
            this.logger.log(`Fetching role with ID: ${id}`);
            const role = await this.repo.findRoleById(id);
            if (!role) {
                this.logger.warn(`Role not found: ${id}`);
                return null;
            }
            this.logger.log(`Role found: ${role.name} (${role.id})`);
            return role;
        }
        catch (error) {
            this.logger.error(`Error fetching role with ID ${id}:`, error);
            throw new microservices_1.RpcException('Failed to fetch role');
        }
    }
    async getAllRoles(page, pageSize, search) {
        try {
            this.logger.log(`Fetching all roles - Page: ${page}, PageSize: ${pageSize}, Search: ${search || 'N/A'}`);
            const result = await this.repo.findAllRoles(page, pageSize, search);
            this.logger.log(`Fetched ${result.roles.length} roles`);
            return result;
        }
        catch (error) {
            this.logger.error('Error fetching roles:', error);
            throw new microservices_1.RpcException('Failed to fetch roles');
        }
    }
    async createRole(data) {
        try {
            this.logger.log('Creating new role with data:', data);
            const role = await this.repo.createRole(data);
            this.logger.log(`Role created successfully: ${role.name} (${role.id})`);
            return role;
        }
        catch (error) {
            this.logger.error('Error creating role:', error);
            throw new microservices_1.RpcException('Failed to create role');
        }
    }
    async updateRole(id, data) {
        try {
            this.logger.log(`Updating role ID: ${id} with data:`, data);
            const role = await this.repo.findRoleById(id);
            if (!role) {
                this.logger.warn(`Role not found: ${id}`);
                throw new microservices_1.RpcException('Role not found');
            }
            const updated = await this.repo.updateRole(id, data);
            this.logger.log(`Role updated successfully: ${updated.name} (${updated.id})`);
            return updated;
        }
        catch (error) {
            this.logger.error(`Error updating role ID ${id}:`, error);
            throw new microservices_1.RpcException('Failed to update role');
        }
    }
    async deleteRole(id) {
        try {
            this.logger.log(`Deleting role ID: ${id}`);
            const role = await this.repo.findRoleById(id);
            if (!role) {
                this.logger.warn(`Role not found: ${id}`);
                throw new microservices_1.RpcException('Role not found');
            }
            const deleted = await this.repo.deleteRole(id);
            this.logger.log(`Role deleted successfully: ${deleted.name} (${deleted.id})`);
            return deleted;
        }
        catch (error) {
            this.logger.error(`Error deleting role ID ${id}:`, error);
            throw new microservices_1.RpcException('Failed to delete role');
        }
    }
    async getPermission(id) {
        try {
            this.logger.log(`Fetching permission with ID: ${id}`);
            const permission = await this.repo.findPermissionById(id);
            if (!permission) {
                this.logger.warn(`Permission not found: ${id}`);
                return null;
            }
            this.logger.log(`Found permission: ${permission.resource}`);
            return permission;
        }
        catch (error) {
            this.logger.error(`Error fetching permission ${id}:`, error);
            throw new microservices_1.RpcException('Failed to fetch permission');
        }
    }
    async getAllPermissions(page, pageSize, search) {
        try {
            this.logger.log(`Fetching all permissions - Page: ${page}, PageSize: ${pageSize}, Search: ${search || 'N/A'}`);
            const result = await this.repo.findAllPermissions(page, pageSize, search);
            this.logger.log(`Retrieved ${result.permissions.length} permissions`);
            return result;
        }
        catch (error) {
            this.logger.error('Error fetching permissions:', error);
            throw new microservices_1.RpcException('Failed to fetch permissions');
        }
    }
    async createPermission(data) {
        try {
            this.logger.log('Creating permission with data:', data);
            const created = await this.repo.createPermission(data);
            this.logger.log(`Created permission: ${created.resource} (${created.id})`);
            return created;
        }
        catch (error) {
            this.logger.error('Error creating permission:', error);
            throw new microservices_1.RpcException('Failed to create permission');
        }
    }
    async updatePermission(id, data) {
        try {
            this.logger.log(`Updating permission ID: ${id}`);
            const existing = await this.repo.findPermissionById(id);
            if (!existing) {
                this.logger.warn(`Permission not found: ${id}`);
                throw new microservices_1.RpcException('Permission not found');
            }
            const updated = await this.repo.updatePermission(id, data);
            this.logger.log(`Updated permission: ${updated.resource} (${updated.id})`);
            return updated;
        }
        catch (error) {
            this.logger.error(`Error updating permission ${id}:`, error);
            throw new microservices_1.RpcException('Failed to update permission');
        }
    }
    async deletePermission(id) {
        try {
            this.logger.log(`Deleting permission ID: ${id}`);
            const existing = await this.repo.findPermissionById(id);
            if (!existing) {
                this.logger.warn(`Permission not found: ${id}`);
                throw new microservices_1.RpcException('Permission not found');
            }
            const deleted = await this.repo.deletePermission(id);
            this.logger.log(`Deleted permission: ${deleted.resource} (${deleted.id})`);
            return deleted;
        }
        catch (error) {
            this.logger.error(`Error deleting permission ${id}:`, error);
            throw new microservices_1.RpcException('Failed to delete permission');
        }
    }
    async assignPermissionsToRole(data) {
        try {
            this.logger.log(`Assigning permissions to role: ${data.roleId}`);
            if (!data.permissions || data.permissions.length === 0) {
                this.logger.warn(`No permissions provided`);
                throw new microservices_1.RpcException({
                    code: 400,
                    message: "Permissions don't exist!",
                });
            }
            const result = await this.repo.assignPermissionsToRole(data);
            this.logger.log(`Assigned ${data.permissions.length} permission(s) to role ${data.roleId}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Error assigning permissions to role ${data.roleId}:`, error);
            throw new microservices_1.RpcException({
                code: error.code || 500,
                message: error.message || 'Failed to assign permissions to role',
            });
        }
    }
    async updatedPermissionFromRole(roleId, data) {
        try {
            this.logger.log(`Updating permission ${data.permissionId} for role ${roleId}`);
            const perm = await this.repo.findRolePermission(roleId, data.permissionId);
            if (!perm) {
                this.logger.warn(`RolePermission not found: Role ${roleId}, Permission ${data.permissionId}`);
                throw new microservices_1.RpcException({
                    code: 400,
                    message: "RolePermission doesn't exist",
                });
            }
            const updated = await this.repo.updatePermissionFromRole(roleId, data);
            this.logger.log(`Updated permission ${data.permissionId} for role ${roleId}`);
            return updated;
        }
        catch (error) {
            this.logger.error(`Error updating permission for role ${roleId}:`, error);
            throw new microservices_1.RpcException({
                code: error.code || 500,
                message: error.message || 'Failed to update permission from role',
            });
        }
    }
    async removePermissionFromRole(roleId, permissionId) {
        try {
            this.logger.log(`Removing permission ${permissionId} from role ${roleId}`);
            const perm = await this.repo.findRolePermission(roleId, permissionId);
            if (!perm) {
                this.logger.warn(`RolePermission not found: Role ${roleId}, Permission ${permissionId}`);
                throw new microservices_1.RpcException({
                    code: 400,
                    message: "RolePermission doesn't exist",
                });
            }
            const removed = await this.repo.removePermissionFromRole(roleId, permissionId);
            this.logger.log(`Removed permission ${permissionId} from role ${roleId}`);
            return removed;
        }
        catch (error) {
            this.logger.error(`Error removing permission from role ${roleId}:`, error);
            throw new microservices_1.RpcException({
                code: error.code || 500,
                message: error.message || 'Failed to remove permission from role',
            });
        }
    }
    async assignRoleToUser(userId, roleId) {
        try {
            this.logger.log(`Assigning role ${roleId} to user ${userId}`);
            const role = await this.repo.findRoleById(roleId);
            if (!role) {
                this.logger.warn(`Role not found: ${roleId}`);
                throw new microservices_1.RpcException({
                    code: 400,
                    message: "Role doesn't exist",
                });
            }
            const user = await this.repo.findUserById(userId);
            if (!user) {
                this.logger.warn(`User not found: ${userId}`);
                throw new microservices_1.RpcException({
                    code: 400,
                    message: "User doesn't exist",
                });
            }
            const assigned = await this.repo.assignRoleToUser(userId, roleId);
            this.logger.log(`Assigned role ${roleId} to user ${userId}`);
            return assigned;
        }
        catch (error) {
            this.logger.error(`Error assigning role ${roleId} to user ${userId}:`, error);
            throw new microservices_1.RpcException({
                code: error.code || 500,
                message: error.message || 'Failed to assign role to user',
            });
        }
    }
    async findAllRoles(query) {
        try {
            this.logger.log(`Retrieving all roles with query: ${JSON.stringify(query)}`);
            const roles = await this.repo.findAllRole(query);
            this.logger.log(`Fetched ${roles.pagination.total || 0} roles successfully`);
            return roles;
        }
        catch (error) {
            this.logger.error(`Error retrieving all roles : ${error.message}`, error.stack);
            throw new microservices_1.RpcException(error.message || 'Failed to retrieve roles');
        }
    }
};
exports.AccessControlUsecaseImpl = AccessControlUsecaseImpl;
exports.AccessControlUsecaseImpl = AccessControlUsecaseImpl = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [access_control_repository_1.AccessControlRepository,
        app_logger_service_1.AppLogger])
], AccessControlUsecaseImpl);
//# sourceMappingURL=access_control.usecase.impl.js.map