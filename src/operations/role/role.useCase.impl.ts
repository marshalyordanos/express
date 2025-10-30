import { Injectable, Logger } from '@nestjs/common';
import { Role } from '@prisma/client';
import { RoleCreateDto, RoleUpdateDto } from './role.entity';
import { RoleUseCases } from './role.useCase';
import { RoleRepository } from './role.repository';
import { RpcException } from '@nestjs/microservices';
import { ListQueryDto } from '../../common/query/query.dto';
import { AppLogger } from '../../common/app-logger.service';

@Injectable()
export class RoleUseCaseImpl implements RoleUseCases {
  constructor(
    private readonly roleRepo: RoleRepository,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext('OperationsService', 'RoleUseCaseImpl');
  }

  async createRole(data: RoleCreateDto): Promise<Role> {
    try {
      this.logger.log(
        `Attempting to create role with data: ${JSON.stringify(data)}`,
      );

      const result = await this.roleRepo.createRole(data);

      this.logger.log(
        `Role created successfully with ID: ${result.id}, Name: ${result.name}`,
      );
      return result;
    } catch (error) {
      this.logger.error(`Error creating role: ${error.message}`, error.stack);
      throw new RpcException(error.message || 'Failed to create role');
    }
  }

  async findRole(id: string): Promise<Role> {
    try {
      this.logger.log(`Finding role with ID: ${id}`);

      const role = await this.roleRepo.findRolById(id);

      if (!role) {
        this.logger.warn(`Role not found with ID: ${id}`);
        throw new RpcException(`Role with ID ${id} not found`);
      }

      this.logger.log(`Role retrieved successfully: ${role.name} (ID: ${id})`);
      return role;
    } catch (error) {
      this.logger.error(
        `Error finding role with ID: ${id} and error : ${error.message}`,
        error.stack,
      );
      throw new RpcException(error.message || 'Failed to find role');
    }
  }

  async findAllRoles(query: ListQueryDto) {
    try {
      this.logger.log(
        `Retrieving all roles with query: ${JSON.stringify(query)}`,
      );

      const roles = await this.roleRepo.findAllRoles(query);

      this.logger.log(
        `Fetched ${roles.pagination.total || 0} roles successfully`,
      );
      return roles;
    } catch (error) {
      this.logger.error(
        `Error retrieving all roles : ${error.message}`,
        error.stack,
      );
      throw new RpcException(error.message || 'Failed to retrieve roles');
    }
  }

  async deleteRole(id: string): Promise<string> {
    try {
      this.logger.log(`Attempting to delete role with ID: ${id}`);

      const role = await this.roleRepo.findRolById(id);

      if (!role) {
        this.logger.warn(`Cannot delete — role not found: ${id}`);
        throw new RpcException(`Role ${id} not found`);
      }

      await this.roleRepo.deleteById(id);

      this.logger.log(`Role deleted successfully with ID: ${id}`);
      return `Role deleted successfully with id: ${id}`;
    } catch (error) {
      this.logger.error(
        `Error deleting role with ID: ${id} and error : ${error.message}`,
        error.stack,
      );
      throw new RpcException(error.message || 'Failed to delete role');
    }
  }

  async updateRole(id: string, data: RoleUpdateDto): Promise<Role> {
    try {
      this.logger.log(
        `Attempting to update role with ID: ${id}, data: ${JSON.stringify(data)}`,
      );

      const existingRole = await this.roleRepo.findRolById(id);
      if (!existingRole) {
        this.logger.warn(`Cannot update — role not found: ${id}`);
        throw new RpcException(`Role with ID ${id} not found`);
      }

      const updatedRole = await this.roleRepo.updateRole(id, data);

      this.logger.log(`Role updated successfully with ID: ${id}`);
      return updatedRole;
    } catch (error) {
      this.logger.error(
        `Error updating role with ID: ${id} and error : ${error.message}`,
        error.stack,
      );
      throw new RpcException(error.message || 'Failed to update role');
    }
  }
}
