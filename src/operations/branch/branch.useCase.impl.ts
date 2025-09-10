import { Injectable } from '@nestjs/common';
import { BranchRepository } from './branch.repository';
import { Branch } from '@prisma/client';
import {
  BranchCreateDto,
  BranchUpdateDto,
  BranchResponseDto,
} from './branch.entity';
import { BranchUseCases } from './branch.useCase';

@Injectable()
export class BranchUseCaseImpl implements BranchUseCases {
  constructor(private readonly branchRepository: BranchRepository) {}

  async createBranch(data: BranchCreateDto): Promise<Branch> {
    return this.branchRepository.createBranch(data);
  }

  async findAllBranch(): Promise<BranchResponseDto[]> {
    return this.branchRepository.findAllBranch();
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
