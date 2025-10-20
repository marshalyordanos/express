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
import { LoggerModule } from 'nestjs-pino';
import { PermissionBootstrapper } from './Permission.Bootstrapper';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { MapGatewayController } from './maps.gateway.controller';
import { RedisService } from '../redis/redis.service';
import { WebSocketModule } from '../websocket/socket.module';
// import { DriverLocationService } from '../fulfillment/maps/driver-location.service';
import { FulfillmentModule } from '../fulfillment/fulfillment.module';


@Module({
  imports: [
    forwardRef(() => FulfillmentModule), 
    WebSocketModule,
    MicroserviceClientsModule,
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
        transport:
          process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  translateTime: 'yyyy-mm-dd HH:MM:ss',
                  ignore: 'pid,hostname',
                },
              }
            : undefined,
      },
    }),
  ],
  providers: [PermissionBootstrapper, PrismaService, RedisService],
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
  ],
})
export class GatewayModule {}
