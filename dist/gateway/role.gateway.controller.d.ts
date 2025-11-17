import { ClientProxy } from '@nestjs/microservices';
import { RoleCreateDto, RoleUpdateDto } from '../operations/role/role.entity';
import { ListQueryDto } from '../common/query/query.dto';
export declare class RoleGatewayController {
    private readonly roleClient;
    constructor(roleClient: ClientProxy);
    createRole(data: RoleCreateDto, req: any): Promise<import("rxjs").Observable<any>>;
    updateRole(id: string, dto: RoleUpdateDto, req: any): Promise<import("rxjs").Observable<any>>;
    getAllRoles(req: any, query: ListQueryDto): Promise<import("rxjs").Observable<any>>;
    getRole(id: string, req: any): Promise<import("rxjs").Observable<any>>;
    deleteRole(id: string, req: any): Promise<import("rxjs").Observable<any>>;
}
