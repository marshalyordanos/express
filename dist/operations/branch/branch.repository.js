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
            searchableFields: ['name', 'description', 'location'],
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
                    createdAt: true,
                    updatedAt: true,
                    manager: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phone: true,
                        },
                    },
                    orders: {
                        select: {
                            id: true,
                            trackingCode: true,
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
                            city: true,
                            country: true,
                            state: true,
                        },
                    },
                },
            }),
            this.prisma.branch.count({
                where: query.where || {},
            }),
        ]);
        const branches = results[0] || [];
        const total = results[1] || 0;
        const enhancedBranches = [];
        for (const branch of branches) {
            const branchId = branch.id;
            const totalOrders = await this.prisma.order.count({
                where: { branchId },
            });
            const activeOrders = await this.prisma.order.count({
                where: {
                    branchId,
                    status: {
                        notIn: ['DELIVERED', 'FAILED', 'CANCELED'],
                    },
                },
            });
            const exceptionOrders = await this.prisma.order.count({
                where: {
                    branchId,
                    status: 'EXCEPTION',
                },
            });
            const interbranchActive = await this.prisma.order.count({
                where: {
                    status: { notIn: ['DELIVERED', 'FAILED', 'CANCELED'] },
                    branchId: branchId,
                    deliveryAddress: {
                        branchId: { not: branchId },
                    },
                },
            });
            const staffCount = branch.staff.length;
            const revenueResult = await this.prisma.priceCalculationLog.aggregate({
                _sum: { finalPrice: true },
                where: { order: { branchId } },
            });
            const revenue = revenueResult._sum.finalPrice || 0;
            enhancedBranches.push({
                ...branch,
                analytics: {
                    totalOrders,
                    activeOrders,
                    exceptionOrders,
                    interbranchActive,
                    staffCount,
                    revenue,
                },
            });
        }
        return {
            branches: enhancedBranches,
            pagination: feature.getPagination(total),
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
};
exports.BranchRepository = BranchRepository;
exports.BranchRepository = BranchRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BranchRepository);
//# sourceMappingURL=branch.repository.js.map