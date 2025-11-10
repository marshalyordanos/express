import { BranchRepository } from './branch.repository';
import { Branch } from '@prisma/client';
import { BranchCreateDto, BranchUpdateDto } from './branch.entity';
import { BranchUseCases } from './branch.useCase';
import { ListQueryDto } from '../../common/query/query.dto';
import { AppLogger } from '../../common/app-logger.service';
import { MapsService } from '../../fulfillment/maps/maps.service';
export declare class BranchUseCaseImpl implements BranchUseCases {
    private readonly branchRepository;
    private readonly logger;
    private readonly mapService;
    constructor(branchRepository: BranchRepository, logger: AppLogger, mapService: MapsService);
    revokeManager(branchId: string, managerId: string): Promise<string>;
    assignManager(branchId: string, managerId: string): Promise<Branch>;
    createBranch(data: BranchCreateDto, userId: string): Promise<Branch>;
    findAllBranch(query: ListQueryDto): Promise<{
        branches: any[];
        pagination: {
            total: number;
            page: number;
            pageSize: number;
            totalPages: number;
        };
    }>;
    findBranchById(id: string): Promise<Partial<Branch>>;
    updateBranch(id: string, data: Partial<BranchUpdateDto>): Promise<Branch>;
    deleteBranch(id: string): Promise<Branch>;
}
