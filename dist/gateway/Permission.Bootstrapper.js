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
var PermissionBootstrapper_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionBootstrapper = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PermissionBootstrapper = PermissionBootstrapper_1 = class PermissionBootstrapper {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(PermissionBootstrapper_1.name);
        this.defaultPermissions = [
            { resource: 'User', description: 'User management and account operations' },
            { resource: 'Staff', description: 'Staff management and account operations' },
            { resource: 'Role', description: 'Role creation, assignment, and modification' },
            { resource: 'Permission', description: 'Permission management for access control' },
            { resource: 'Dispatch', description: 'Driver assignment, Order dispatch and pickup assignment operations' },
            { resource: 'Order', description: 'Customer order processing and tracking' },
            { resource: 'Branch', description: 'Branch registration and logistics coordination' },
            { resource: 'Price', description: 'Pricing, discount, and tariff structure management' },
            { resource: 'Fleet', description: 'Fleet management, vehicle operations, and analytics' },
            { resource: 'Dashboard-Report', description: 'Branch registration and logistics coordination' },
            { resource: 'Price', description: 'Pricing, discount, and tariff structure management' },
            { resource: 'Fleet', description: 'Fleet management, vehicle operations, and analytics' },
            { resource: 'Auth', description: 'User authentication, authorization, and session management' },
            { resource: 'CustomerCategory', description: 'Used for managing and assigning customers to categories' },
            { resource: 'PermissionRole', description: 'Used to manage and assign permissions to roles and their relation to each other.' },
            { resource: 'CalculatePrice', description: 'Used to calculate the price of an order.' },
            { resource: 'Preference', description: 'Managing user preference for notification, payment and other settings.' },
        ];
    }
    async run() {
        let superAdmin = await this.prisma.role.findUnique({
            where: { name: 'SuperAdmin' },
        });
        if (!superAdmin) {
            this.logger.warn('SuperAdmin role not found. Creating...');
            superAdmin = await this.prisma.role.create({
                data: {
                    name: 'SuperAdmin',
                    description: 'Has full access to all resources and actions.',
                },
            });
        }
        for (const perm of this.defaultPermissions) {
            await this.prisma.permission.upsert({
                where: { resource: perm.resource },
                update: { description: perm.description ?? '' },
                create: perm,
            });
        }
        const allPermissions = await this.prisma.permission.findMany();
        const assignedPermissions = await this.prisma.rolePermission.findMany({
            where: { roleId: superAdmin.id },
            select: { permissionId: true },
        });
        const assignedIds = assignedPermissions.map((p) => p.permissionId);
        const newPermissions = allPermissions.filter((perm) => !assignedIds.includes(perm.id));
        if (newPermissions.length > 0) {
            await this.prisma.rolePermission.createMany({
                data: newPermissions.map((perm) => ({
                    roleId: superAdmin.id,
                    permissionId: perm.id,
                    createAction: true,
                    readAction: true,
                    updateAction: true,
                    deleteAction: true,
                })),
                skipDuplicates: true,
            });
            this.logger.log(`✅ Added ${newPermissions.length} new permissions to SuperAdmin.`);
        }
        else {
            this.logger.log('✅ No new permissions found. Everything is up-to-date.');
        }
        this.logger.log('🎯 Permission bootstrap completed successfully.');
    }
};
exports.PermissionBootstrapper = PermissionBootstrapper;
exports.PermissionBootstrapper = PermissionBootstrapper = PermissionBootstrapper_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PermissionBootstrapper);
//# sourceMappingURL=Permission.Bootstrapper.js.map