import { forwardRef, Module } from '@nestjs/common';
import { AuthGatewayController } from './auth.gateway.controller';
import { UserGatewayController } from './user.gateway.controller';
import { MicroserviceClientsModule } from './clients.module';
import { BranchGatewayController } from './branch.gateway.controller';
import { RoleGatewayController } from './role.gateway.controller';
import { FleetGatewayController } from './fleet.gatway.controller';
import { StaffGatewayController } from './staff.gateway.controller';
import { AccessControlGatewayController } from './access_control.gateway.controller';
import { OrderGatewayController } from './order.gateway.controller';
import { DispatchGatewayController } from './dispatch.gateway.controller';
import { PricingGatewayController } from './pricing.gateway.controller';
import { PermissionBootstrapper } from './Permission.Bootstrapper';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { MapGatewayController } from './maps.gateway.controller';
import { RedisService } from '../redis/redis.service';
import { WebSocketModule } from '../websocket/socket.module';//temporary fix only
import { FulfillmentModule } from '../fulfillment/fulfillment.module';
import { ReportGatewayController } from './report.gateway.controller';
import { AppLogger } from '../common/app-logger.service';
import { SanitizePipe } from '../common/sanitize.pipe';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CloudinaryUploaderService } from '../common/cloudinary/cloudinary-uploader.service';
import { NotificationModule } from '../notification/notification.module'; //temporary fix only
import { RedisModule } from '../redis/redis.module';
import { NotificationGatewayController } from './Notification.gateway.controller';
import { ChatGatewayController } from './chat.gateway.controller';


@Module({
  imports: [
    MulterModule.register({
      storage: memoryStorage(),
      limits: { files: 5, fileSize: 5 * 1024 * 1024 },
    }),
    forwardRef(() => FulfillmentModule),
    WebSocketModule, //temporary fix only
    NotificationModule,
    MicroserviceClientsModule,
    RedisModule,
    ConfigModule.forRoot({ isGlobal: true }),
    // LoggerModule.forRoot({
    //   pinoHttp: {
    //     level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
    //     transport:
    //       process.env.NODE_ENV !== 'production'
    //         ? {
    //             target: 'pino-pretty',
    //             options: {
    //               colorize: true,
    //               translateTime: 'yyyy-mm-dd HH:MM:ss',
    //               ignore: 'pid,hostname',
    //             },
    //           }
    //         : undefined,
    //   },
    // }),
  ],
  providers: [
    PermissionBootstrapper,
    PrismaService,
    // RedisService,
    AppLogger,
    SanitizePipe,
    CloudinaryUploaderService,
  ],
  controllers: [
    AuthGatewayController,
    UserGatewayController,
    BranchGatewayController,
    RoleGatewayController,
    FleetGatewayController,
    StaffGatewayController,
    AccessControlGatewayController,
    OrderGatewayController,
    DispatchGatewayController,
    PricingGatewayController,
    MapGatewayController,
    ReportGatewayController,
    NotificationGatewayController,
    ChatGatewayController
  ],
  exports: [AppLogger, SanitizePipe]
})
export class GatewayModule {}
