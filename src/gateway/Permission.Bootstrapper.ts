import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PermissionBootstrapper {
  private readonly logger = new Logger(PermissionBootstrapper.name);

  constructor(private readonly prisma: PrismaService) {}

  private readonly defaultPermissions = [
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
  ];

  async run() {
    // 1️⃣ Ensure SuperAdmin role exists (idempotent)
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

    // 2️⃣ Create new permissions if they don’t exist
    for (const perm of this.defaultPermissions) {
      await this.prisma.permission.upsert({
        where: { resource: perm.resource },
        update: { description: perm.description ?? '' }, // safe to update text only
        create: perm,
      });
    }

    // 3️⃣ Fetch all permissions and SuperAdmin’s assigned ones
    const allPermissions = await this.prisma.permission.findMany();
    const assignedPermissions = await this.prisma.rolePermission.findMany({
      where: { roleId: superAdmin.id },
      select: { permissionId: true },
    });

    const assignedIds = assignedPermissions.map((p) => p.permissionId);

    // 4️⃣ Assign only *new* permissions to SuperAdmin
    const newPermissions = allPermissions.filter(
      (perm) => !assignedIds.includes(perm.id),
    );

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
        skipDuplicates: true, // safety for concurrency
      });

      this.logger.log(
        `✅ Added ${newPermissions.length} new permissions to SuperAdmin.`,
      );
    } else {
      this.logger.log('✅ No new permissions found. Everything is up-to-date.');
    }

    this.logger.log('🎯 Permission bootstrap completed successfully.');
  }
}
