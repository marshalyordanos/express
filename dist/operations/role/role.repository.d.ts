import { PrismaService } from '../../prisma/prisma.service';
import { RoleCreateDto, RoleUpdateDto } from './role.entity';
import { Role } from '@prisma/client';
import { ListQueryDto } from '../../common/query/query.dto';
export declare class RoleRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createRole(data: RoleCreateDto): Promise<Role>;
    findRoleByName(name: string): Promise<Role>;
    findRolById(id: string): Promise<Role>;
    findAllRoles(payload: ListQueryDto): Promise<{
        roles: {
            name: string;
            id: string;
            description: string;
            createdAt: Date;
            updatedAt: Date;
        }[];
        pagination: {
            total: number;
            page: number;
            pageSize: number;
            totalPages: number;
        };
    }>;
    deleteByName(name: string): Promise<{
        name: string;
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
    }>;
    deleteById(id: string): Promise<{
        name: string;
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
    }>;
    updateRole(id: string, data: RoleUpdateDto): Promise<Role>;
}
