import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class PrismaService extends PrismaClient {
  constructor(config: ConfigService) {
    super({
      datasources: {
        db: {
          url: config.get<string>('DATABASE_URL'),
        },
      },
    });
  }
}


// import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
// import { PrismaClient } from '@prisma/client';
// import { ConfigService } from '@nestjs/config';

// @Injectable()
// export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
//   constructor(config: ConfigService) {
//     const databaseUrl = config.get<string>('DATABASE_URL');
    
//     if (!databaseUrl) {
//       throw new Error('DATABASE_URL is missing in .env');
//     }

//     // Log URL with password redacted for security
//     const redactedUrl = databaseUrl.replace(/:(.*?)@/, ':[REDACTED]@');
//     console.log('DATABASE_URL (redacted):', redactedUrl);

//     super({
//       datasources: {
//         db: {
//           url: databaseUrl,
//         },
//       },
//     });
//   }

//   async onModuleInit() {
//     try {
//       await this.$connect();
//       console.log('✅ Prisma connected to Supabase (pooled connection)');
//     } catch (error) {
//       console.error('❌ Prisma connection failed:', error.message);
//       throw error;
//     }
//   }

//   async onModuleDestroy() {
//     await this.$disconnect();
//     console.log('🔌 Prisma disconnected from Supabase');
//   }
// }