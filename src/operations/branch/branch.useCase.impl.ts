import { Injectable, Logger } from '@nestjs/common';
import { BranchRepository } from './branch.repository';
import { Branch } from '@prisma/client';
import { BranchCreateDto, BranchUpdateDto } from './branch.entity';
import { BranchUseCases } from './branch.useCase';
import { RpcException } from '@nestjs/microservices';
import { ListQueryDto } from '../../common/query/query.dto';
import { AppLogger } from '../../common/app-logger.service';
import { MapsService } from '../../fulfillment/maps/maps.service';

@Injectable()
export class BranchUseCaseImpl implements BranchUseCases {

  constructor(
    private readonly branchRepository: BranchRepository,
    private readonly logger: AppLogger,
    private readonly mapService: MapsService,
  ) {
    this.logger.setContext('OperationsService', 'BranchUseCaseImpl');
  }
  async revokeManager(branchId: string, managerId: string): Promise<string> {
    try {
      this.logger.log(
        `🧩 Attempting to revoke manager ${managerId} from branch ${branchId}`,
      );

      // Security: sanitize input
      if (!branchId || !managerId) {
        throw new RpcException({
          code: 400,
          message: 'Invalid branch or manager ID',
        });
      }

      const [user, branch] =
        await this.branchRepository.findBranchAndBranchManager(
          managerId,
          branchId,
        );

      if (!user || !branch) {
        this.logger.warn(`⚠️ User or Branch not found during revoke`);
        throw new RpcException({
          code: 404,
          message: 'User or Branch not found',
        });
      }

      if (branch.managerId !== managerId) {
        this.logger.warn(
          `⚠️ Attempted revoke: user ${managerId} is not the manager of branch ${branchId}`,
        );
        throw new RpcException({
          code: 403,
          message: 'User is not authorized as manager of this branch',
        });
      }

      await this.branchRepository.revokeManager(branchId, managerId);

      this.logger.log(
        `✅ Manager ${managerId} successfully revoked from branch ${branchId}`,
      );
      return 'Manager revoked successfully';
    } catch (error) {
      this.logger.error(
        `❌ Error revoking manager ${managerId} from branch ${branchId}: ${error.message}`,
      );
      throw new RpcException({
        code: error.code || 500,
        message: 'Failed to revoke manager',
      });
    }
  }

  async assignManager(branchId: string, managerId: string): Promise<Branch> {
    try {
      this.logger.log(
        `🧩 Assigning manager ${managerId} to branch ${branchId}`,
      );

      if (!branchId || !managerId) {
        throw new RpcException({
          code: 400,
          message: 'Invalid branch or manager ID',
        });
      }

      const [user, branch] =
        await this.branchRepository.findBranchAndBranchManager(
          managerId,
          branchId,
        );

      if (!user || !branch) {
        this.logger.warn(`⚠️ Branch or User not found`);
        throw new RpcException({
          code: 404,
          message: 'User or Branch not found',
        });
      }

      // Prevent privilege escalation
      if (branch.managerId) {
        this.logger.warn(`⚠️ Branch ${branchId} already has a manager`);
        throw new RpcException({
          code: 409,
          message: 'Branch already has a manager',
        });
      }

      // Prevent same manager managing multiple branches
      const existingManagedBranch =
        await this.branchRepository.findManagedBranch(branchId, managerId);
      if (existingManagedBranch) {
        this.logger.warn(
          `⚠️ Manager ${managerId} already manages another branch`,
        );
        throw new RpcException({
          code: 409,
          message: 'Manager already assigned to another branch',
        });
      }

      const result = await this.branchRepository.assignManager(
        branchId,
        managerId,
      );
      this.logger.log(`✅ Assigned manager ${managerId} to branch ${branchId}`);
      return result;
    } catch (error) {
      this.logger.error(`❌ Error assigning manager: ${error.message}`);
      throw new RpcException({
        code: error.code || 500,
        message: 'Failed to assign manager',
      });
    }
  }

  async createBranch(data: BranchCreateDto, userId: string): Promise<Branch> {
    try {
      this.logger.log(`🧩 Creating new branch: ${data.name}`);

      const address = await this.mapService.reverseGeocode(
        data.address.lat,
        data.address.long,
      );
      this.logger.log(
        `🧩 Address created for branch with latitude : ${data.address.lat} and longitude ${data.address.long}. and created address response : ${address}`,
      );

      return await this.branchRepository.createBranch(data, address, userId);
    } catch (error) {
      this.logger.error(`❌ Failed to create branch: ${error.message}`);
      throw new RpcException({
        code: error.code || 500,
        message: 'Failed to create branch',
      });
    }
  }

  async findAllBranch(query: ListQueryDto) {
    try {
      this.logger.log(
        `🔍 Fetching all branches with query: ${JSON.stringify(query)}`,
      );
      return await this.branchRepository.findAllBranch(query);
    } catch (error) {
      this.logger.error(`❌ Error fetching branches: ${error.message}`);
      throw new RpcException({
        code: error.code || 500,
        message: 'Failed to fetch branches',
      });
    }
  }

  async findBranchById(id: string): Promise<Partial<Branch>> {
    try {
      this.logger.log(`🔍 Finding branch with ID: ${id}`);

      if (!id) {
        throw new RpcException({ code: 400, message: 'Invalid branch ID' });
      }

      const branch = await this.branchRepository.findBranchById(id);
      if (!branch) {
        this.logger.warn(`⚠️ Branch not found: ${id}`);
        throw new RpcException({ code: 404, message: 'Branch not found' });
      }

      this.logger.log(`✅ Branch ${id} fetched successfully`);
      return branch;
    } catch (error) {
      this.logger.error(`❌ Error finding branch: ${error.message}`);
      throw new RpcException({
        code: error.code || 500,
        message: 'Failed to find branch',
      });
    }
  }

  async updateBranch(
    id: string,
    data: Partial<BranchUpdateDto>,
  ): Promise<Branch> {
    try {
      this.logger.log(
        `🧩 Updating branch ${id} with data: ${JSON.stringify(data)}`,
      );

      if (!id) {
        throw new RpcException({ code: 400, message: 'Invalid branch ID' });
      }

      const updated = await this.branchRepository.updateBranch(id, data);
      this.logger.log(`✅ Branch ${id} updated successfully`);
      return updated;
    } catch (error) {
      this.logger.error(`❌ Error updating branch ${id}: ${error.message}`);
      throw new RpcException({
        code: error.code || 500,
        message: 'Failed to update branch',
      });
    }
  }

  async deleteBranch(id: string): Promise<Branch> {
    try {
      this.logger.log(`🗑️ Deleting branch ${id}`);
      if (!id) {
        throw new RpcException({ code: 400, message: 'Invalid branch ID' });
      }

      const deleted = await this.branchRepository.deleteBranch(id);
      this.logger.log(`✅ Branch ${id} deleted successfully`);
      return deleted;
    } catch (error) {
      this.logger.error(`❌ Error deleting branch ${id}: ${error.message}`);
      throw new RpcException({
        code: error.code || 500,
        message: 'Failed to delete branch',
      });
    }
  }

  async findAllBranchFree(query: ListQueryDto) {
    try {
      this.logger.log(
        `🔍 Fetching all branches with query: ${JSON.stringify(query)}`,
      );
      return await this.branchRepository.findAllBranchFree(query);
    } catch (error) {
      this.logger.error(`❌ Error fetching branches: ${error.message}`);
      throw new RpcException({
        code: error.code || 500,
        message: 'Failed to fetch branches',
      });
    }
  }
}
