import {
  BranchCreateDto,
  BranchUpdateDto,
} from './branch.entity';
import { Branch } from '@prisma/client';
import { ListQueryDto } from '../../common/query/query.dto';

export interface BranchUseCases {
  createBranch(data: BranchCreateDto, userId: string): Promise<Branch>;
   findAllBranch(query: ListQueryDto): Promise<any>;
  findBranchById(id: string): Promise<Partial<Branch>>;
  updateBranch(id: string, data: Partial<BranchUpdateDto>): Promise<Branch>;
  deleteBranch(id: string): Promise<Branch>;
  assignManager(branchId: string, managerId: string): Promise<Branch>;
  revokeManager(branchId: string, managerId: string): Promise<string>;
}
