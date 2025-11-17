import { ClientProxy } from '@nestjs/microservices';
import { PermissionDto, RoleDto, ChangeRolePermissionDto, PermissionActionDto, AssignUserRoleDto, RemovePermissionDto } from '../operations/acl/access_control.entity';
import { ListQueryDto } from '../common/query/query.dto';
export declare class AccessControlGatewayController {
    private readonly accessClient;
    constructor(accessClient: ClientProxy);
    findAllRole(req: any, query: ListQueryDto): Promise<import("rxjs").Observable<any>>;
    findRoleById(req: any, id: string): Promise<import("rxjs").Observable<any>>;
    findAllRoles(req: any, page?: number, pageSize?: number, search?: string): Promise<import("rxjs").Observable<any>>;
    createRole(req: any, dto: Partial<RoleDto>): Promise<import("rxjs").Observable<any>>;
    updateRole(req: any, id: string, dto: Partial<RoleDto>): Promise<import("rxjs").Observable<any>>;
    deleteRole(req: any, id: string): Promise<import("rxjs").Observable<any>>;
    findPermissionById(req: any, id: string): Promise<import("rxjs").Observable<any>>;
    findAllPermissions(req: any, page?: number, pageSize?: number, search?: string): Promise<import("rxjs").Observable<any>>;
    createPermission(req: any, dto: Partial<PermissionDto>): Promise<import("rxjs").Observable<any>>;
    updatePermission(req: any, id: string, dto: Partial<PermissionDto>): Promise<import("rxjs").Observable<any>>;
    deletePermission(req: any, id: string): Promise<import("rxjs").Observable<any>>;
    assignPermissionsToRole(req: any, dto: ChangeRolePermissionDto): Promise<import("rxjs").Observable<any>>;
    removePermissionFromRole(req: any, roleId: string, dto: RemovePermissionDto): Promise<import("rxjs").Observable<any>>;
    updatePermissionFromRole(req: any, roleId: string, data: PermissionActionDto): Promise<import("rxjs").Observable<any>>;
    assignUserRole(req: any, dto: AssignUserRoleDto): Promise<import("rxjs").Observable<any>>;
}
