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
exports.UserRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const microservices_1 = require("@nestjs/microservices");
const prisma_query_feature_1 = require("../../common/query/prisma-query-feature");
let UserRepository = class UserRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findRoleById(roleId) {
        return this.prisma.role.findUnique({ where: { id: roleId } });
    }
    async findUserById(id) {
        return this.prisma.user.findUnique({ where: { id } });
    }
    async findAddressById(id) {
        return this.prisma.address.findUnique({ where: { id } });
    }
    async findAll(payload) {
        console.log('quest1: ', payload);
        const feature = new prisma_query_feature_1.PrismaQueryFeature({
            search: payload.search,
            filter: payload.filter,
            sort: payload.sort,
            page: payload.page,
            pageSize: payload.pageSize,
            searchableFields: ['name', 'email', 'phone'],
        });
        const query = feature.getQuery();
        console.log('quest1: ', query);
        const results = await Promise.all([
            this.prisma.user.findMany({
                ...query,
                where: query.where || {},
                select: {
                    name: true,
                    email: true,
                    phone: true,
                    isStaff: true,
                    isSuperAdmin: true,
                    createdAt: true,
                    branch: true,
                    addresses: true,
                    customerType: true,
                    role: true,
                    corporateInfo: true,
                    preferences: true,
                },
            }),
            this.prisma.user.count({ where: query.where || {} }),
        ]);
        const models = results[0] || [];
        const total = results[1] || 0;
        return {
            models,
            pagination: feature.getPagination(total),
        };
    }
    async getAllCustomer(payload, roleId) {
        if (/roleId:[^,]*/.test(payload.filter)) {
            payload.filter = payload.filter.replace(/roleId:[^,]*/, `roleId:${roleId}`);
        }
        else {
            payload.filter = payload.filter
                ? payload.filter + `,roleId:${roleId}`
                : `roleId:${roleId}`;
        }
        console.log('quest1: ', payload);
        const feature = new prisma_query_feature_1.PrismaQueryFeature({
            search: payload.search,
            filter: payload.filter,
            sort: payload.sort,
            page: payload.page,
            pageSize: payload.pageSize,
            searchableFields: ['name', 'email', 'phone'],
        });
        const query = feature.getQuery();
        console.log('quest1: ', query);
        const results = await Promise.all([
            this.prisma.user.findMany({
                ...query,
                where: query.where || {},
                select: {
                    name: true,
                    email: true,
                    phone: true,
                    isStaff: true,
                    isSuperAdmin: true,
                    createdAt: true,
                    branch: true,
                    addresses: true,
                    customerType: true,
                    role: true,
                    corporateInfo: true,
                    preferences: true,
                },
            }),
            this.prisma.user.count({ where: query.where || {} }),
        ]);
        const models = results[0] || [];
        const total = results[1] || 0;
        return {
            models,
            pagination: feature.getPagination(total),
        };
    }
    async updateUser(id, data) {
        return this.prisma.user.update({ where: { id }, data });
    }
    async deleteUser(id) {
        return this.prisma.user.delete({ where: { id: id } });
    }
    async findUserByEmail(email) {
        return this.prisma.user.findUnique({ where: { email } });
    }
    async addAddress(data) {
        const { userId, ...addressData } = data;
        return this.prisma.address.create({
            data: {
                ...addressData,
                user: { connect: { id: userId } },
            },
        });
    }
    async listAddresses(userId) {
        return this.prisma.address.findMany({ where: { userId } });
    }
    async updateAddress(id, data) {
        return this.prisma.address.update({ where: { id }, data });
    }
    async deleteAddress(id) {
        return this.prisma.address.delete({ where: { id } });
    }
    async updatePreferences(userId, data) {
        return this.prisma.userPreferences.upsert({
            where: { userId },
            create: { userId, ...data },
            update: { ...data },
        });
    }
    async updateCorporateInfo(userId, data) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { corporateInfo: true },
        });
        if (!user) {
            throw new microservices_1.RpcException('User not found');
        }
        if (user.customerType != 'CORPORATE') {
            throw new microservices_1.RpcException('This user is not a corporate customer');
        }
        const updatedCorporate = await this.prisma.corporateInfo.update({
            where: { userId: userId },
            data: {
                companyName: data.companyName ?? undefined,
                taxId: data.taxId ?? undefined,
                contactPerson: data.contactPerson ?? undefined,
                contactPhone: data.contactPhone ?? undefined,
                contactEmail: data.contactEmail ?? undefined,
                industryType: data.industryType ?? undefined,
                website: data.website ?? undefined,
                address: data.address ?? undefined,
                notes: data.notes ?? undefined,
            },
        });
        return updatedCorporate;
    }
    async getCustomerOrders(payload, id) {
        if (/customerId:[^,]*/.test(payload.filter)) {
            payload.filter = payload.filter.replace(/customerId:[^,]*/, `customerId:${id}`);
        }
        else {
            payload.filter = payload.filter
                ? payload.filter + `,customerId:${id}`
                : `customerId:${id}`;
        }
        const feature = new prisma_query_feature_1.PrismaQueryFeature({
            search: payload.search,
            filter: payload.filter,
            sort: payload.sort,
            page: payload.page,
            pageSize: payload.pageSize,
            searchableFields: [],
        });
        const query = feature.getQuery();
        const results = await Promise.all([
            this.prisma.order.findMany({
                ...query,
                where: query.where || {},
            }),
            this.prisma.order.count({ where: query.where || {} }),
        ]);
        const models = results[0] || [];
        const total = results[1] || 0;
        return {
            models,
            pagination: feature.getPagination(total),
        };
    }
    async findRoleByName(name) {
        return this.prisma.role.findUnique({ where: { name: name } });
    }
    async listCategories(payload) {
        const feature = new prisma_query_feature_1.PrismaQueryFeature({
            search: payload.search,
            filter: payload.filter,
            sort: payload.sort,
            page: payload.page,
            pageSize: payload.pageSize,
            searchableFields: ['name', 'description'],
        });
        const query = feature.getQuery();
        const results = await Promise.all([
            this.prisma.customerCategory.findMany({
                ...query,
                where: query.where || {},
                include: {
                    discountRules: true,
                    pricingRules: true,
                    tariffs: true,
                    users: true,
                },
            }),
            this.prisma.customerCategory.count({ where: query.where || {} }),
        ]);
        const models = results[0] || [];
        const total = results[1] || 0;
        return {
            models,
            pagination: feature.getPagination(total),
        };
    }
    async deleteCategory(id) {
        return this.prisma.customerCategory.delete({ where: { id } });
    }
    async findCategory(id) {
        return this.prisma.customerCategory.findUnique({ where: { id } });
    }
    async updateCategory(id, data) {
        return this.prisma.customerCategory.update({ where: { id }, data });
    }
    async createCategory(data) {
        return this.prisma.customerCategory.create({ data });
    }
    async assignCustomersToCategory(customerIds, customerCategoryId) {
        return this.prisma.$transaction(async (tx) => {
            const updates = customerIds.map((customerId) => tx.user.update({
                where: { id: customerId },
                data: { customerCategoryId },
            }));
            return Promise.all(updates);
        });
    }
    async removeCustomersFromCategory(customerIds) {
        return this.prisma.$transaction(async (tx) => {
            const updates = customerIds.map((customerId) => tx.user.update({
                where: { id: customerId },
                data: { customerCategoryId: null },
            }));
            return Promise.all(updates);
        });
    }
    async updateUserNotificationPreferences(userId, data) {
        return this.prisma.userNotificationPreferences.update({
            where: { userId },
            data: {
                userId,
                email: data.email,
                inApp: data.inApp,
                push: data.push,
            },
        });
    }
    async getUserNotificationPreferences(userId) {
        return this.prisma.userNotificationPreferences.findUnique({
            where: { userId },
        });
    }
    async createUserNotificationPreferences(userId) {
        return this.prisma.userNotificationPreferences.create({
            data: {
                email: true,
                inApp: true,
                push: false,
                user: { connect: { id: userId } },
            },
        });
    }
    async createDriver(data, userId) {
        return this.prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    name: data.name,
                    email: data.email,
                    phone: data.phone ?? null,
                    password: '',
                    isStaff: data.type === 'INTERNAL',
                    isActive: true,
                    roleId: data.roleId,
                    emergencyContactName: data.emergencyContactName,
                    emergencyContactPhone: data.emergencyContactPhone,
                    createdBy: userId || 'system',
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    roleId: true,
                },
            });
            const driver = await tx.driver.create({
                data: {
                    userId: user.id,
                    vehicleId: data.vehicleId,
                    status: data.status,
                    type: data.type,
                    licenseNumber: data.licenseNumber,
                    licenseExpiry: data.licenseExpiry,
                    currentLat: data.currentLat ?? null,
                    currentLon: data.currentLong ?? null,
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
            if (data.currentLat && data.currentLong) {
                await tx.driverLocationLog.create({
                    data: {
                        driverId: driver.id,
                        latitude: data.currentLat,
                        longitude: data.currentLong,
                        speed: 0,
                        heading: 0,
                    },
                });
            }
            await tx.vehicle.update({
                where: { id: data.vehicleId },
                data: { driverId: driver.id },
            });
            return { user, driver };
        });
    }
    async findVehicleById(vehicleId) {
        return await this.prisma.vehicle.findUnique({
            where: { id: vehicleId },
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
exports.UserRepository = UserRepository;
exports.UserRepository = UserRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UserRepository);
//# sourceMappingURL=user.repository.js.map