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
exports.StaffRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const prisma_query_feature_1 = require("../../common/query/prisma-query-feature");
let StaffRepository = class StaffRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async changeUserRole(userId, role) {
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                role: { connect: { id: role.id } },
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                emailVerified: true,
                role: {
                    select: { id: true, name: true },
                },
                createdBy: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }
    async deactivateStaff(id, userId) {
        return this.prisma.user.update({
            where: { id },
            data: {
                isActive: false,
            },
            select: {
                id: true,
                name: true,
                email: true,
            },
        });
    }
    async getLastCustomId(prefix, roleAbbr) {
        const lastUser = await this.prisma.user.findFirst({
            where: { customId: { startsWith: `${prefix}-${roleAbbr}-` } },
            orderBy: { createdAt: 'desc' },
            select: { customId: true },
        });
        return lastUser?.customId || null;
    }
    async createNotificationPreferences(id) {
        return this.prisma.userNotificationPreferences.create({
            data: {
                user: { connect: { id } },
                email: true,
                inApp: true,
                push: false,
            },
        });
    }
    async findStaffByEmailAndPhone(email, phone) {
        const [existingEmailStaff, existingStaffPhone] = await Promise.all([
            this.prisma.user.findUnique({ where: { email } }),
            this.prisma.user.findUnique({ where: { phone } }),
        ]);
        return { existingEmailStaff, existingStaffPhone };
    }
    async findRoleById(roleId) {
        return this.prisma.role.findUnique({
            where: { id: roleId },
        });
    }
    async findByEmail(email) {
        return this.prisma.user.findUnique({ where: { email } });
    }
    async createStaff(data) {
        return this.prisma.user.create({
            data,
            select: {
                id: true,
                customId: true,
                name: true,
                email: true,
                phone: true,
                emailVerified: true,
                isStaff: true,
                isActive: true,
                role: {
                    select: { id: true, name: true },
                },
                emergencyContactName: true,
                emergencyContactPhone: true,
            },
        });
    }
    async findByPhone(phone) {
        return this.prisma.user.findUnique({
            where: { phone },
        });
    }
    async findRoleByName(roleName) {
        return this.prisma.role.findUnique({
            where: { name: roleName },
            select: { id: true },
        });
    }
    async findBranchById(branchId) {
        return this.prisma.branch.findUnique({
            where: { id: branchId },
            select: { id: true, name: true },
        });
    }
    async findStaffByRole(roleId, payload) {
        const feature = new prisma_query_feature_1.PrismaQueryFeature({
            search: payload.search,
            filter: payload.filter,
            sort: payload.sort,
            page: payload.page,
            pageSize: payload.pageSize,
            searchableFields: ['name', 'email', 'phone'],
        });
        const query = feature.getQuery();
        const where = {
            ...query.where,
            roleId,
        };
        const results = await Promise.all([
            this.prisma.user.findMany({
                ...query,
                where,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    emailVerified: true,
                    role: {
                        select: { id: true, name: true },
                    },
                    branch: {
                        select: { id: true, name: true },
                    },
                    createdBy: true,
                    createdAt: true,
                    updatedAt: true,
                },
            }),
            this.prisma.user.count({
                where: {
                    ...query.where,
                    ...where,
                },
            }),
        ]);
        const Staffs = results[0] || [];
        const total = results[1] || 0;
        return {
            Staffs,
            pagination: feature.getPagination(total),
        };
    }
    async findUserByEmail(email) {
        return this.prisma.user.findUnique({
            where: { email },
            include: { role: true, branch: true },
        });
    }
    async deleteStaff(id) {
        return await this.prisma.user.delete({ where: { id } });
    }
    async findStaffById(id) {
        return await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                emailVerified: true,
                role: {
                    select: { id: true, name: true },
                },
                branch: {
                    select: { id: true, name: true },
                },
                createdBy: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }
    async findAllStaff(payload) {
        const feature = new prisma_query_feature_1.PrismaQueryFeature({
            search: payload.search,
            filter: payload.filter,
            sort: payload.sort,
            page: payload.page,
            pageSize: payload.pageSize,
            searchableFields: ['name', 'email', 'phone'],
        });
        const query = feature.getQuery();
        console.log('Query to be queried : ', query);
        const [Staffs, total] = await Promise.all([
            this.prisma.user.findMany({
                ...query,
                where: {
                    ...query.where,
                    isStaff: true,
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    emailVerified: true,
                    role: {
                        select: { id: true, name: true },
                    },
                    branch: {
                        select: { id: true, name: true },
                    },
                    createdBy: true,
                    createdAt: true,
                    updatedAt: true,
                },
            }),
            this.prisma.user.count({
                where: {
                    ...query.where,
                    isStaff: true,
                },
            }),
        ]);
        return {
            Staffs,
            pagination: feature.getPagination(total),
        };
    }
    async updateStaff(id, data) {
        return await this.prisma.user.update({
            where: { id },
            data,
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                emailVerified: true,
                createdAt: true,
                updatedAt: true,
                createdBy: true,
            },
        });
    }
    async findStaffByBranch(payload, branchId) {
        const feature = new prisma_query_feature_1.PrismaQueryFeature({
            search: payload.search,
            filter: payload.filter,
            sort: payload.sort,
            page: payload.page,
            pageSize: payload.pageSize,
            searchableFields: ['name', 'email', 'phone'],
        });
        const query = feature.getQuery();
        console.log('query: ', query);
        const where = {
            ...query.where,
            branchId,
        };
        const results = await Promise.all([
            this.prisma.user.findMany({
                ...query,
                where,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    emailVerified: true,
                    role: {
                        select: { id: true, name: true },
                    },
                    branch: {
                        select: { id: true, name: true },
                    },
                    createdBy: true,
                    createdAt: true,
                    updatedAt: true,
                },
            }),
            this.prisma.user.count({ where }),
        ]);
        const Staffs = results[0] || [];
        const total = results[1] || 0;
        return {
            Staffs,
            pagination: feature.getPagination(total),
        };
    }
    async assignStaffToBranch(staffIds, branchId) {
        return await this.prisma.user.updateMany({
            where: { id: { in: staffIds } },
            data: { branchId },
        });
    }
    async findVehicleById(vehicleId) {
        return await this.prisma.vehicle.findUnique({
            where: { id: vehicleId },
        });
    }
    async createDriver(userData, driverData, userId) {
        return this.prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: userData,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    roleId: true,
                    customId: true,
                },
            });
            const driver = await tx.driver.create({
                data: {
                    userId: user.id,
                    vehicleId: driverData.vehicleId ?? null,
                    status: driverData.status,
                    type: driverData.type,
                    licenseNumber: driverData.licenseNumber,
                    licenseExpiry: driverData.licenseExpiry,
                    currentLat: parseFloat(driverData.currentLat) ?? null,
                    currentLon: parseFloat(driverData.currentLong) ?? null,
                    createdBy: userId || 'system',
                },
                select: {
                    id: true,
                    vehicleId: true,
                    status: true,
                    type: true,
                    licenseNumber: true,
                    licenseExpiry: true,
                },
            });
            if (driverData.currentLat && driverData.currentLong) {
                await tx.driverLocationLog.create({
                    data: {
                        driverId: driver.id,
                        latitude: parseFloat(driverData.currentLat),
                        longitude: parseFloat(driverData.currentLong),
                        speed: 0,
                        heading: 0,
                    },
                });
            }
            await tx.vehicle.update({
                where: { id: driverData.vehicleId },
                data: { driverId: driver.id },
            });
            return { user, driver };
        });
    }
    async findDriver(payload) {
        const where = {
            AND: [],
        };
        if (payload.search) {
            where.AND.push({
                OR: [
                    { user: { name: { contains: payload.search, mode: 'insensitive' } } },
                    {
                        user: { email: { contains: payload.search, mode: 'insensitive' } },
                    },
                    {
                        user: { phone: { contains: payload.search, mode: 'insensitive' } },
                    },
                    {
                        vehicles: {
                            some: {
                                plateNumber: { contains: payload.search, mode: 'insensitive' },
                            },
                        },
                    },
                    {
                        vehicles: {
                            some: {
                                model: { contains: payload.search, mode: 'insensitive' },
                            },
                        },
                    },
                ],
            });
        }
        let filters = {};
        if (typeof payload.filter === 'string') {
            try {
                filters = JSON.parse(payload.filter);
            }
            catch {
                filters = {};
            }
        }
        else if (typeof payload.filter === 'object' && payload.filter !== null) {
            filters = payload.filter;
        }
        if (filters.status) {
            where.AND.push({ status: filters.status });
        }
        if (filters.type) {
            where.AND.push({ type: filters.type });
        }
        if (filters.vehicleStatus) {
            where.AND.push({
                vehicles: { some: { status: filters.vehicleStatus } },
            });
        }
        if (filters.userId) {
            where.AND.push({ userId: filters.userId });
        }
        if (filters.vehicleId) {
            where.AND.push({
                vehicles: { some: { id: filters.vehicleId } },
            });
        }
        const feature = new prisma_query_feature_1.PrismaQueryFeature({
            search: payload.search,
            filter: payload.filter,
            sort: payload.sort,
            page: payload.page,
            pageSize: payload.pageSize,
            searchableFields: [
                'user.name',
                'user.email',
                'user.phone',
                'vehicles.plateNumber',
                'vehicles.model',
            ],
        });
        const query = {
            ...feature.getQuery(),
            where,
            include: {
                user: {
                    select: { id: true, name: true, email: true, phone: true },
                },
                vehicles: {
                    select: { id: true, plateNumber: true, model: true, status: true },
                },
            },
        };
        const [drivers, total] = await this.prisma.$transaction([
            this.prisma.driver.findMany(query),
            this.prisma.driver.count({ where }),
        ]);
        return {
            drivers,
            pagination: feature.getPagination(total),
        };
    }
};
exports.StaffRepository = StaffRepository;
exports.StaffRepository = StaffRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StaffRepository);
//# sourceMappingURL=staff.repository.js.map