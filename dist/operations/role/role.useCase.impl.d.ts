import { Role } from '@prisma/client';
import { RoleCreateDto, RoleUpdateDto } from './role.entity';
import { RoleUseCases } from './role.useCase';
import { RoleRepository } from './role.repository';
import { ListQueryDto } from '../../common/query/query.dto';
import { AppLogger } from '../../common/app-logger.service';
export declare class RoleUseCaseImpl implements RoleUseCases {
    private readonly roleRepo;
    private readonly logger;
    constructor(roleRepo: RoleRepository, logger: AppLogger);
    createRole(data: RoleCreateDto): Promise<Role>;
    findRole(id: string): Promise<Role>;
    findAllRoles(query: ListQueryDto): Promise<{
        roles: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string;
        }[];
        pagination: {
            total: number;
            page: number;
            pageSize: number;
            totalPages: number;
        };
    }>;
    deleteRole(id: string): Promise<string>;
    updateRole(id: string, data: RoleUpdateDto): Promise<Role>;
}
