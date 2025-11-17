import { ClientProxy } from '@nestjs/microservices';
import { BranchCreateDto, BranchUpdateDto } from '../operations/branch/branch.entity';
import { ListQueryDto } from '../common/query/query.dto';
export declare class BranchGatewayController {
    private readonly branchClient;
    constructor(branchClient: ClientProxy);
    createBranch(data: BranchCreateDto, req: any): Promise<import("rxjs").Observable<any>>;
    findAllBranches(req: any, query: ListQueryDto): Promise<import("rxjs").Observable<any>>;
    updateBranch(id: string, dto: BranchUpdateDto, req: any): Promise<import("rxjs").Observable<any>>;
    deleteBranch(id: string, req: any): Promise<import("rxjs").Observable<any>>;
    assignManager(data: {
        branchId: string;
        managerId: string;
    }, req: any): Promise<import("rxjs").Observable<any>>;
    revokeManager(data: {
        branchId: string;
        managerId: string;
    }, req: any): Promise<import("rxjs").Observable<any>>;
    findAllBranchFree(req: any, query: ListQueryDto): Promise<import("rxjs").Observable<any>>;
    findBranchById(id: string, req: any): Promise<import("rxjs").Observable<any>>;
}
