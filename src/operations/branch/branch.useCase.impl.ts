import { Injectable } from '@nestjs/common';
import { BranchRepository } from './branch.repository';
import { Branch } from '@prisma/client';
import {
  BranchCreateDto,
  BranchUpdateDto,
  BranchResponseDto,
} from './branch.entity';
import { BranchUseCases } from './branch.useCase';
import { IPagination } from '../../common/types';
import { RpcException } from '@nestjs/microservices';
import { ListQueryDto } from '../../common/query/query.dto';

@Injectable()
export class BranchUseCaseImpl implements BranchUseCases {
  constructor(private readonly branchRepository: BranchRepository) {}
  async revokeManager(branchId: string, managerId: string): Promise<string> {
    const [user, branch] =
      await this.branchRepository.findBranchAndBranchManager(
        managerId,
        branchId,
      );
    // Validate user and branch existence
    if (!user || !branch) {
      throw new RpcException('User or Branch not found');
    }

    if (branch.managerId !== managerId) {
      throw new RpcException('User is not a manager of this branch');
    }
    await this.branchRepository.revokeManager(branchId, managerId);

    return 'Manager revoked successfully';
  }
  async assignManager(branchId: string, managerId: string): Promise<Branch> {
    const [user, branch] =
      await this.branchRepository.findBranchAndBranchManager(
        managerId,
        branchId,
      );
    // Validate user and branch existence
    if (!user || !branch) {
      throw new RpcException('User or Branch not found');
    }

    //  Checking if branch already has a manager
    if (branch.managerId) {
      throw new RpcException('Branch already has a manager');
    }

    const existingManagedBranch = await this.branchRepository.findManagedBranch(
      branchId,
      managerId,
    );
    if (existingManagedBranch) {
      throw new RpcException('User is already a manager of another branch');
    }

    return await this.branchRepository.assignManager(branchId, managerId);
  }

  async createBranch(data: BranchCreateDto): Promise<Branch> {
    return this.branchRepository.createBranch(data);
  }

  async findAllBranch(query: ListQueryDto) {
    return await this.branchRepository.findAllBranch(query);
  }
  async findBranchById(id: string): Promise<Branch> {
    return this.branchRepository.findBranchById(id);
  }

  async updateBranch(
    id: string,
    data: Partial<BranchUpdateDto>,
  ): Promise<Branch> {
    console.log("Updating.....222 : ", data);
    
    return this.branchRepository.updateBranch(id, data);
  }

  async deleteBranch(id: string): Promise<Branch> {
    return this.branchRepository.deleteBranch(id);
  }
}
