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
exports.BranchRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const prisma_query_feature_1 = require("../../common/query/prisma-query-feature");
let BranchRepository = class BranchRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findBranchAndBranchManager(managerId, branchId) {
        return await Promise.all([
            this.prisma.user.findUnique({ where: { id: managerId } }),
            this.prisma.branch.findUnique({
                where: { id: branchId },
                include: { manager: true },
            }),
        ]);
    }
    async findManagedBranch(branchId, userId) {
        return await this.prisma.branch.findFirst({
            where: {
                managerId: userId,
                id: { not: branchId },
            },
        });
    }
    async revokeManager(branchId, managerId) {
        return await this.prisma.$transaction(async (prisma) => {
            await prisma.branch.update({
                where: { id: branchId },
                data: { managerId: null },
            });
            await prisma.user.update({
                where: { id: managerId },
                data: { branchId: null },
            });
        });
    }
    async assignManager(branchId, managerId) {
        return this.prisma.$transaction(async (prisma) => {
            const updatedBranch = await prisma.branch.update({
                where: { id: branchId },
                data: { managerId },
            });
            await prisma.user.update({
                where: { id: managerId },
                data: { branchId },
            });
            return updatedBranch;
        });
    }
    deleteBranch(id) {
        return this.prisma.branch.delete({ where: { id } });
    }
    async updateBranch(id, data) {
        const { address, managerId, ...branchData } = data;
        return this.prisma.branch.update({
            where: { id },
            data: {
                ...branchData,
                ...(managerId && {
                    manager: { connect: { id: managerId } },
                }),
                ...(address && {
                    address: {
                        upsert: {
                            create: {
                                label: address.label,
                                addressLine: address.addressLine,
                                city: address.city,
                                state: address.state ?? null,
                                country: address.country ?? null,
                                postalCode: address.postalCode ?? null,
                                lat: address.lat,
                                long: address.long,
                                purpose: address.purpose ?? 'BRANCH_LOCATION',
                            },
                            update: {
                                label: address.label ?? undefined,
                                addressLine: address.addressLine ?? undefined,
                                city: address.city ?? undefined,
                                state: address.state ?? undefined,
                                country: address.country ?? undefined,
                                postalCode: address.postalCode ?? undefined,
                                lat: address.lat ?? undefined,
                                long: address.long ?? undefined,
                            },
                        },
                    },
                }),
            },
            include: {
                address: {
                    select: {
                        id: true,
                        label: true,
                        city: true,
                        country: true,
                        state: true,
                    },
                },
            },
        });
    }
    async findAllBranch(payload) {
        const feature = new prisma_query_feature_1.PrismaQueryFeature({
            search: payload.search,
            filter: payload.filter,
            sort: payload.sort,
            page: payload.page,
            pageSize: payload.pageSize,
            searchableFields: ['name', 'location'],
        });
        const query = feature.getQuery();
        const [branches, totalBranches] = await Promise.all([
            this.prisma.branch.findMany({
                ...query,
                where: query.where || {},
                select: {
                    id: true,
                    name: true,
                    location: true,
                    manager: { select: { id: true, name: true } },
                    _count: { select: { staff: true } },
                },
            }),
            this.prisma.branch.count({ where: query.where || {} }),
        ]);
        const branchIds = branches.map((b) => b.id);
        const branchAnalytics = await this.prisma.$queryRaw `
    SELECT 
      o."branchId",
      COUNT(*) AS "totalOrders",
      COUNT(*) FILTER (
        WHERE o."status" NOT IN ('DELIVERED', 'FAILED', 'CANCELED')
      ) AS "activeOrders",
      COUNT(*) FILTER (
        WHERE o."status" NOT IN ('DELIVERED', 'FAILED', 'CANCELED') 
          AND o."branchId" <> da."branchId"
      ) AS "interbranchActive",
      SUM(p."finalPrice") AS "revenue"
    FROM "Order" o
    LEFT JOIN "PriceCalculationLog" p ON p."orderId" = o.id
    LEFT JOIN "Address" da ON da.id = o."deliveryAddressId"
    WHERE o."branchId" = ANY(${branchIds})
    GROUP BY o."branchId"
  `;
        const analyticsMap = {};
        branchAnalytics.forEach((a) => {
            analyticsMap[a.branchId] = {
                totalOrders: Number(a.totalOrders),
                activeOrders: Number(a.activeOrders),
                interbranchActive: Number(a.interbranchActive),
                revenue: Number(a.revenue || 0),
            };
        });
        const enhancedBranches = branches.map((b) => {
            const analytics = analyticsMap[b.id] || {
                totalOrders: 0,
                activeOrders: 0,
                interbranchActive: 0,
                revenue: 0,
            };
            return {
                id: b.id,
                name: b.name,
                location: b.location,
                manager: b.manager,
                totalOrders: analytics.totalOrders,
                activeOrders: analytics.activeOrders,
                interbranchActive: analytics.interbranchActive,
                staffCount: b._count.staff,
                revenue: analytics.revenue,
                efficiency: analytics.totalOrders
                    ? +(analytics.revenue / analytics.totalOrders).toFixed(2)
                    : 0,
                status: analytics.activeOrders > 0 ? 'Active' : 'Inactive',
            };
        });
        return {
            branches: enhancedBranches,
            pagination: feature.getPagination(totalBranches),
        };
    }
    async createBranch(data, address, userId) {
        return this.prisma.branch.create({
            data: {
                name: data.name,
                location: data.location,
                managerId: data.managerId ?? null,
                createdBy: userId,
                ...(data.address && {
                    address: {
                        create: {
                            label: address.label ?? 'branch label unknown',
                            addressLine: address.addressLine ?? 'Unknown',
                            city: address.city ?? 'Unknown',
                            state: address.state ?? null,
                            country: address.country ?? 'Ethiopia',
                            postalCode: address.postalCode ?? null,
                            lat: data.address.lat?.toString() ?? null,
                            long: data.address.long?.toString() ?? null,
                            purpose: address.purpose ?? 'BRANCH_LOCATION',
                            createdBy: userId,
                        },
                    },
                }),
            },
            include: { address: true },
        });
    }
    async findBranchById(id) {
        return this.prisma.branch.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                location: true,
                manager: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
                staff: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
                address: {
                    select: {
                        id: true,
                        label: true,
                        state: true,
                        city: true,
                        country: true,
                    },
                },
                orders: {
                    select: {
                        id: true,
                        trackingCode: true,
                    },
                },
            },
        });
    }
    async findAllBranchFree(payload) {
        const feature = new prisma_query_feature_1.PrismaQueryFeature({
            search: payload.search,
            filter: payload.filter,
            sort: payload.sort,
            page: payload.page,
            pageSize: payload.pageSize,
            searchableFields: ['name', 'location'],
        });
        const query = feature.getQuery();
        const results = await Promise.all([
            this.prisma.branch.findMany({
                ...query,
                where: query.where || {},
                select: {
                    id: true,
                    name: true,
                    location: true,
                },
            }),
            this.prisma.branch.count({ where: query.where || {} }),
        ]);
        const branches = results[0] || [];
        const total = results[1] || 0;
        return {
            branches,
            pagination: feature.getPagination(total),
        };
    }
};
exports.BranchRepository = BranchRepository;
exports.BranchRepository = BranchRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BranchRepository);
//# sourceMappingURL=branch.repository.js.map