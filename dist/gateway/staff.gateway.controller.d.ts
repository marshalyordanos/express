import { ClientProxy } from '@nestjs/microservices';
import { AssignStaffToBranchDto, ChangeRoleDto, CreateDriver, RegisterStaffDto, UpdateStaffDto } from '../operations/staff/staff.entity';
import { ListQueryDto } from '../common/query/query.dto';
export declare class StaffGatewayController {
    private readonly staffClient;
    constructor(staffClient: ClientProxy);
    changeUserRole(dto: ChangeRoleDto, req: any): Promise<import("rxjs").Observable<any>>;
    findUserByEmail(email: string, req: any): Promise<import("rxjs").Observable<any>>;
    createStaff(req: any, dto: RegisterStaffDto): Promise<import("rxjs").Observable<any>>;
    findStaff(req: any, query: ListQueryDto): Promise<import("rxjs").Observable<any>>;
    findStaffByRole(req: any, id: string, query: ListQueryDto): Promise<import("rxjs").Observable<any>>;
    deleteStaff(id: string, req: any): Promise<import("rxjs").Observable<any>>;
    updateStaff(id: string, dto: UpdateStaffDto, req: any): Promise<import("rxjs").Observable<any>>;
    findStaffById(id: string, req: any): Promise<import("rxjs").Observable<any>>;
    findStaffByBranch(req: any, branchId: string, query: ListQueryDto): Promise<import("rxjs").Observable<any>>;
    createDriver(data: CreateDriver, req: any): Promise<import("rxjs").Observable<any>>;
    findDriver(query: ListQueryDto, req: any): Promise<import("rxjs").Observable<any>>;
    assignBranch(dto: AssignStaffToBranchDto, req: any): Promise<import("rxjs").Observable<any>>;
}
