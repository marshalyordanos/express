import { BranchCreateDto, BranchUpdateDto,BranchResponseDto } from "./brach.branchDTO";
import { Branch } from "@prisma/client";

export interface BranchUseCases {
    createBranch(data: BranchCreateDto): Promise<Branch>;
    findAllBranch(): Promise<BranchResponseDto[]>;
    findBranchById(id: string): Promise<Branch>;
    updateBranch(id: string, data: Partial<BranchUpdateDto>): Promise<Branch>;
    deleteBranch(id: string): Promise<Branch>;
}