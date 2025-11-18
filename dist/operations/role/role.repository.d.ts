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
    deleteByName(name: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        description: string | null;
    }>;
    deleteById(id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        description: string | null;
    }>;
    updateRole(id: string, data: RoleUpdateDto): Promise<Role>;
}
