import { Injectable } from '@nestjs/common';
import { BranchRepository } from './branch.repository';
import { Branch } from '@prisma/client';
import {
  BranchCreateDto,
  BranchUpdateDto,
  BranchResponseDto,
} from './branch.entity';
import { BranchUseCases } from './branch.useCase';
import { IPagination } from 'src/common/types';

@Injectable()
export class BranchUseCaseImpl implements BranchUseCases {
  constructor(private readonly branchRepository: BranchRepository) {}
  revokeManager(branchId: string, managerId: string): Promise<string> {
    return this.branchRepository.revokeManager(branchId,managerId);
  }
  assignManager(branchId: string, managerId: string): Promise<Branch> {
    return this.branchRepository.assignManager(branchId,managerId);
  }

  async createBranch(data: BranchCreateDto): Promise<Branch> {
    return this.branchRepository.createBranch(data);
  }

  async findAllBranch(
    page: number,
    pageSize: number,
    search?: string,
  ): Promise<{
    branches: BranchResponseDto[];
    pagination: IPagination;
  }> {
    return this.branchRepository.findAllBranch(
      page,
      pageSize,
      search,
    );
  }
  async findBranchById(id: string): Promise<Branch> {
    return this.branchRepository.findBranchById(id);
  }

  async updateBranch(
    id: string,
    data: Partial<BranchUpdateDto>,
  ): Promise<Branch> {
    return this.branchRepository.updateBranch(id, data);
  }

  async deleteBranch(id: string): Promise<Branch> {
    return this.branchRepository.deleteBranch(id);
  }
}
