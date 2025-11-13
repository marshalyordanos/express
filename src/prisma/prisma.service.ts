// import { Injectable } from '@nestjs/common';
// import { PrismaClient } from '@prisma/client';
// import { ConfigService } from '@nestjs/config';
// @Injectable()
// export class PrismaService extends PrismaClient {
//   constructor(config: ConfigService) {
//     super({
//       datasources: {
//         db: {
//           url: config.get<string>('DATABASE_URL'),
//         },
//       },
//     });
//   }
// }
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private readonly config: ConfigService) {
    const databaseUrl = config.get<string>('DATABASE_URL');

    if (!databaseUrl) {
      throw new Error('DATABASE_URL is missing in .env');
    }

    const redactedUrl = databaseUrl.replace(/:(.*?)@/, ':[REDACTED]@');
    console.log('DATABASE_URL (redacted):', redactedUrl);

    super({
      datasources: { db: { url: databaseUrl } },
      errorFormat: 'pretty',
    });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('✅ Prisma connected to Supabase (pooled connection)');

  //   // Capture this instance for access inside the extension
  //   const prisma = this;

  //   // Extend the Prisma client
  //   const extended = this.$extends({
  //     query: {
  //       user: {
  //         async create({ args, query }) {
  //           const data = args.data;
  //           console.log('Data inside prisma ::: ', data);

  //           // Extract role ID safely
  //           const roleId =
  //             data.roleId ||
  //             (data.role && data.role.connect && data.role.connect.id);

  //           const isStaff = data.isStaff ?? false;

  //           let roleName: string | null = null;
  //           if (roleId) {
  //             const role = await prisma.role.findUnique({
  //               where: { id: roleId },
  //               select: { name: true },
  //             });
  //             console.log('Role inside prisma :: ', role);

  //             roleName = role?.name?.toUpperCase() ?? null;
  //           }

  //           // Only for staff or external drivers
  //           if ((isStaff || roleName === 'DRIVER') && roleName !== 'CUSTOMER') {
  //             const prefix = 'LN';
  //             const roleAbbr = roleName
  //               ? roleName.slice(0, 2).toUpperCase()
  //               : 'XX';

  //             const lastUser = await prisma.user.findFirst({
  //               where: { customId: { startsWith: `${prefix}-${roleAbbr}-` } },
  //               orderBy: { createdAt: 'desc' },
  //               select: { customId: true },
  //             });

  //             let nextNumber = 1;
  //             if (lastUser?.customId) {
  //               const num = parseInt(lastUser.customId.split('-')[2], 10);
  //               if (!isNaN(num)) nextNumber = num + 1;
  //             }

  //             data.customId = `${prefix}-${roleAbbr}-${String(nextNumber).padStart(5, '0')}`;
  //           }

  //           return query(args);
  //         },
  //       },
  //     },
  //   });

  //   // Merge back into this instance
  //   Object.assign(this, extended);
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('🔌 Prisma disconnected from Supabase');
  }
}
