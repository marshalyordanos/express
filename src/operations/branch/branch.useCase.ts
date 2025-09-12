import { IPagination } from 'src/common/types';
import {
  BranchCreateDto,
  BranchUpdateDto,
  BranchResponseDto,
} from './branch.entity';
import { Branch } from '@prisma/client';

export interface BranchUseCases {
  createBranch(data: BranchCreateDto): Promise<Branch>;
   findAllBranch(
    page: number,
    pageSize: number,
    search?: string,
  ): Promise<{
    branches: BranchResponseDto[];
    pagination: IPagination;
  }>;
  findBranchById(id: string): Promise<Branch>;
  updateBranch(id: string, data: Partial<BranchUpdateDto>): Promise<Branch>;
  deleteBranch(id: string): Promise<Branch>;
  assignManager(branchId: string, managerId: string): Promise<Branch>;
  revokeManager(branchId: string, managerId: string): Promise<string>;
}
