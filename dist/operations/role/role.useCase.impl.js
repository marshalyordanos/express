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
exports.RoleUseCaseImpl = void 0;
const common_1 = require("@nestjs/common");
const role_repository_1 = require("./role.repository");
const microservices_1 = require("@nestjs/microservices");
const app_logger_service_1 = require("../../common/app-logger.service");
let RoleUseCaseImpl = class RoleUseCaseImpl {
    constructor(roleRepo, logger) {
        this.roleRepo = roleRepo;
        this.logger = logger;
        this.logger.setContext('OperationsService', 'RoleUseCaseImpl');
    }
    async createRole(data) {
        try {
            this.logger.log(`Attempting to create role with data: ${JSON.stringify(data)}`);
            const result = await this.roleRepo.createRole(data);
            this.logger.log(`Role created successfully with ID: ${result.id}, Name: ${result.name}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Error creating role: ${error.message}`, error.stack);
            throw new microservices_1.RpcException(error.message || 'Failed to create role');
        }
    }
    async findRole(id) {
        try {
            this.logger.log(`Finding role with ID: ${id}`);
            const role = await this.roleRepo.findRolById(id);
            if (!role) {
                this.logger.warn(`Role not found with ID: ${id}`);
                throw new microservices_1.RpcException(`Role with ID ${id} not found`);
            }
            this.logger.log(`Role retrieved successfully: ${role.name} (ID: ${id})`);
            return role;
        }
        catch (error) {
            this.logger.error(`Error finding role with ID: ${id} and error : ${error.message}`, error.stack);
            throw new microservices_1.RpcException(error.message || 'Failed to find role');
        }
    }
    async findAllRoles(query) {
        try {
            this.logger.log(`Retrieving all roles with query: ${JSON.stringify(query)}`);
            const roles = await this.roleRepo.findAllRoles(query);
            this.logger.log(`Fetched ${roles.pagination.total || 0} roles successfully`);
            return roles;
        }
        catch (error) {
            this.logger.error(`Error retrieving all roles : ${error.message}`, error.stack);
            throw new microservices_1.RpcException(error.message || 'Failed to retrieve roles');
        }
    }
    async deleteRole(id) {
        try {
            this.logger.log(`Attempting to delete role with ID: ${id}`);
            const role = await this.roleRepo.findRolById(id);
            if (!role) {
                this.logger.warn(`Cannot delete — role not found: ${id}`);
                throw new microservices_1.RpcException(`Role ${id} not found`);
            }
            await this.roleRepo.deleteById(id);
            this.logger.log(`Role deleted successfully with ID: ${id}`);
            return `Role deleted successfully with id: ${id}`;
        }
        catch (error) {
            this.logger.error(`Error deleting role with ID: ${id} and error : ${error.message}`, error.stack);
            throw new microservices_1.RpcException(error.message || 'Failed to delete role');
        }
    }
    async updateRole(id, data) {
        try {
            this.logger.log(`Attempting to update role with ID: ${id}, data: ${JSON.stringify(data)}`);
            const existingRole = await this.roleRepo.findRolById(id);
            if (!existingRole) {
                this.logger.warn(`Cannot update — role not found: ${id}`);
                throw new microservices_1.RpcException(`Role with ID ${id} not found`);
            }
            const updatedRole = await this.roleRepo.updateRole(id, data);
            this.logger.log(`Role updated successfully with ID: ${id}`);
            return updatedRole;
        }
        catch (error) {
            this.logger.error(`Error updating role with ID: ${id} and error : ${error.message}`, error.stack);
            throw new microservices_1.RpcException(error.message || 'Failed to update role');
        }
    }
};
exports.RoleUseCaseImpl = RoleUseCaseImpl;
exports.RoleUseCaseImpl = RoleUseCaseImpl = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [role_repository_1.RoleRepository,
        app_logger_service_1.AppLogger])
], RoleUseCaseImpl);
//# sourceMappingURL=role.useCase.impl.js.map