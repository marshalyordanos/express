import { IResponse } from '../../common/types';
import { RoleUseCaseImpl } from './role.useCase.impl';
import { RoleCreateDto, RoleUpdateDto } from './role.entity';
import { ListQueryDto } from '../../common/query/query.dto';
export declare class RoleMessageController {
    private readonly usecases;
    constructor(usecases: RoleUseCaseImpl);
    createRole(payload: {
        data: RoleCreateDto;
    }): Promise<IResponse<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        description: string | null;
    }>>;
    findRole(payload: {
        id: string;
    }): Promise<IResponse<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        description: string | null;
    }>>;
    getAllRoles(payload: {
        query: ListQueryDto;
        headers: {
            authorization: string;
        };
    }): Promise<IResponse<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
    }[]>>;
    getAllRolesFree(payload: {
        query: ListQueryDto;
    }): Promise<IResponse<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
    }[]>>;
    deleteRole(payload: {
        id: string;
    }): Promise<IResponse<string>>;
    updateRole(payload: {
        id: string;
        data: RoleUpdateDto;
    }): Promise<IResponse<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        description: string | null;
    }>>;
}
