"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccessControlRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let AccessControlRepository = class AccessControlRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findRoleById(id) {
        return this.prisma.role.findUnique({
            where: { id },
            include: { rolePermissions: { include: { permission: true } } },
        });
    }
    async findAllRoles(page, pageSize, search) {
        const skip = (page - 1) * pageSize;
        const where = {};
        if (search) {
            where.OR = [{ name: { contains: search, mode: 'insensitive' } }];
        }
        const [roles, total] = await Promise.all([
            this.prisma.role.findMany({
                skip,
                take: pageSize,
                where,
                include: { rolePermissions: { include: { permission: true } } },
            }),
            this.prisma.role.count({ where }),
        ]);
        return {
            roles,
            pagination: {
                total,
                page,
                pageSize,
                totalPages: Math.ceil(total / pageSize),
            },
        };
    }
    async createRole(data) {
        return this.prisma.role.create({
            data: {
                name: data.name,
                description: data.description,
            },
        });
    }
    async updateRole(id, data) {
        console.log("id and data", id, data);
        return this.prisma.role.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description,
            },
        });
    }
    async deleteRole(id) {
        return this.prisma.role.delete({ where: { id } });
    }
    async findPermissionById(id) {
        return this.prisma.permission.findUnique({ where: { id } });
    }
    async findRolePermission(roleId, permissionId) {
        return this.prisma.rolePermission.findFirst({
            where: { roleId, permissionId },
        });
    }
    async findAllPermissions(page, pageSize, search) {
        const skip = (page - 1) * pageSize;
        const where = {};
        if (search) {
            where.OR = [{ resource: { contains: search, mode: 'insensitive' } }];
        }
        const [permissions, total] = await Promise.all([
            this.prisma.permission.findMany({
                skip,
                take: pageSize,
                where,
            }),
            this.prisma.permission.count({ where }),
        ]);
        return {
            permissions,
            pagination: {
                total,
                page,
                pageSize,
                totalPages: Math.ceil(total / pageSize),
            },
        };
    }
    async createPermission(data) {
        return this.prisma.permission.create({
            data: {
                resource: data.resource,
                description: data.description,
            },
        });
    }
    async updatePermission(id, data) {
        return this.prisma.permission.update({
            where: { id },
            data: {
                resource: data.resource,
                description: data.description,
            },
        });
    }
    async deletePermission(id) {
        return this.prisma.permission.delete({ where: { id } });
    }
    async assignPermissionsToRole(data) {
        return this.prisma.role.update({
            where: { id: data.roleId },
            data: {
                rolePermissions: {
                    createMany: {
                        data: data.permissions.map((p) => ({
                            permissionId: p.permissionId,
                            createAction: p.createAction ?? false,
                            readAction: p.readAction ?? false,
                            updateAction: p.updateAction ?? false,
                            deleteAction: p.deleteAction ?? false,
                            scope: p.scopes || [],
                        })),
                        skipDuplicates: true,
                    },
                },
            },
            include: { rolePermissions: { include: { permission: true } } },
        });
    }
    async updatePermissionFromRole(roleId, data) {
        await this.prisma.rolePermission.updateMany({
            where: { roleId, permissionId: data.permissionId },
            data: {
                createAction: data.createAction ?? false,
                readAction: data.readAction ?? false,
                updateAction: data.updateAction ?? false,
                deleteAction: data.deleteAction ?? false,
                scope: data.scopes || [],
            },
        });
        return this.prisma.role.findUnique({
            where: { id: roleId },
            include: { rolePermissions: { include: { permission: true } } },
        });
    }
    async removePermissionFromRole(roleId, permissionId) {
        await this.prisma.rolePermission.deleteMany({
            where: { roleId, permissionId },
        });
        return this.prisma.role.findUnique({
            where: { id: roleId },
            include: { rolePermissions: { include: { permission: true } } },
        });
    }
    async assignRoleToUser(userId, roleId) {
        return this.prisma.user.update({
            where: { id: userId },
            data: { roleId },
        });
    }
    async findUserById(id) {
        return this.prisma.user.findUnique({ where: { id } });
    }
};
exports.AccessControlRepository = AccessControlRepository;
exports.AccessControlRepository = AccessControlRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AccessControlRepository);
//# sourceMappingURL=access_control.repository.js.map