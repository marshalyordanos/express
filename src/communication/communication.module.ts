import { Module, Redirect } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationMessageController } from './notification/notification.controller';
import { NotificationUseCasesImpl } from './notification/notification.usecase.impl';
import { NotificationRepository } from './notification/notification.repository';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { RedisModule } from '../redis/redis.module';
import { AppLogger } from '../common/app-logger.service';
import { ChatMessageController } from './chat/chat.controller';
import { ChatRepository } from './chat/chat.repository';
import { ChatUseCaseImpl } from './chat/chat.usecase.impl';
import { CloudinaryUploaderService } from '../common/cloudinary/cloudinary-uploader.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    RedisModule,
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'yourSecret',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [NotificationMessageController, ChatMessageController],
  providers: [
    NotificationUseCasesImpl,
    NotificationRepository,
    PrismaService,
    // RedisService,
    AppLogger,
    ChatRepository,
    CloudinaryUploaderService,
    ChatUseCaseImpl,
  ],
  exports: [NotificationUseCasesImpl, PrismaService, ChatUseCaseImpl],
})
export class CommunicationModule {}
