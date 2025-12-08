// notification.module.ts
import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { EmailService } from './email.service';
import { EventsGateway } from './events.gateway';
import { PrismaService } from '../prisma/prisma.service'; // your Prisma service
import { AppLogger } from '../common/app-logger.service';
// import { RedisService } from '../redis/redis.service';
import { ConfigModule } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { NotificationRepository } from './notification.repository';
import { RedisModule } from '../redis/redis.module';
import { PushNotificationService } from './push.service';

@Module({
  imports: [
    RedisModule,
    ConfigModule.forRoot({
      isGlobal: true, // prevents needing to re-import everywhere
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'yourSecret', // 🔑 make sure this is set
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [
    NotificationService,
    EmailService,
    // RedisService,
    AppLogger,
    EventsGateway,
    PrismaService,
    NotificationRepository,
    EmailService,
    EventsGateway,
    PushNotificationService,
  ],
  exports: [NotificationService],
})
export class NotificationModule {}
