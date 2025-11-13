import { IResponse } from '../../common/types';
import { BranchCreateDto, BranchUpdateDto } from './branch.entity';
import { BranchUseCaseImpl } from './branch.useCase.impl';
import { ListQueryDto } from '../../common/query/query.dto';
export declare class BranchMessageController {
    private readonly usecases;
    constructor(usecases: BranchUseCaseImpl);
    createBranch(payload: {
        data: BranchCreateDto;
        user: any;
    }): Promise<IResponse<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        location: string;
        managerId: string | null;
    }>>;
    findBranchById(data: {
        id: string;
    }): Promise<IResponse<Partial<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        location: string;
        managerId: string | null;
    }>>>;
    updateBranch(payload: {
        id: string;
        data: Partial<BranchUpdateDto>;
    }): Promise<IResponse<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        location: string;
        managerId: string | null;
    }>>;
    deleteBranch(data: {
        id: string;
    }): Promise<IResponse<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        location: string;
        managerId: string | null;
    }>>;
    assignManager(payload: {
        branchId: string;
        managerId: string;
    }): Promise<IResponse<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        location: string;
        managerId: string | null;
    }>>;
    revokeManager(payload: {
        branchId: string;
        managerId: string;
    }): Promise<IResponse<string>>;
    findAllBranches(payload: {
        query: ListQueryDto;
    }): Promise<IResponse<{
        id: string;
        name: string;
        location: string;
        manager: {
            name: string;
            id: string;
        };
        totalOrders: number;
        activeOrders: number;
        interbranchActive: number;
        staffCount: number;
        revenue: number;
        efficiency: number;
        status: string;
    }[]>>;
}
