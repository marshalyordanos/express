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
exports.RoleRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const prisma_query_feature_1 = require("../../common/query/prisma-query-feature");
let RoleRepository = class RoleRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createRole(data) {
        return this.prisma.role.create({ data });
    }
    async findRoleByName(name) {
        return this.prisma.role.findUnique({ where: { name } });
    }
    async findRolById(id) {
        return this.prisma.role.findUnique({ where: { id } });
    }
    async findAllRoles(payload) {
        const feature = new prisma_query_feature_1.PrismaQueryFeature({
            search: payload.search,
            filter: payload.filter,
            sort: payload.sort,
            page: payload.page,
            pageSize: payload.pageSize,
            searchableFields: ['name', 'description',],
        });
        const query = feature.getQuery();
        console.log('quest1: ', query);
        const results = await Promise.all([
            this.prisma.role.findMany({
                ...query,
                where: query.where || {},
                select: {
                    id: true,
                    name: true,
                    description: true,
                    createdAt: true,
                    updatedAt: true,
                },
            }),
            this.prisma.role.count({ where: query.where || {} }),
        ]);
        const roles = results[0] || [];
        const total = results[1] || 0;
        return {
            roles,
            pagination: feature.getPagination(total),
        };
    }
    async deleteByName(name) {
        return await this.prisma.role.delete({ where: { name } });
    }
    async deleteById(id) {
        return await this.prisma.role.delete({ where: { id } });
    }
    async updateRole(id, data) {
        console.log("id and data", id, data);
        return this.prisma.role.update({ where: { id }, data });
    }
};
exports.RoleRepository = RoleRepository;
exports.RoleRepository = RoleRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RoleRepository);
//# sourceMappingURL=role.repository.js.map