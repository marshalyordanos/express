import { forwardRef, Module } from '@nestjs/common';
import { OrderMessageController } from './order/order.controller';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { OrderUseCasesImpl } from './order/order.usecase.impl';
import { OrderRepository } from './order/order.repository';
import { PrismaService } from '../prisma/prisma.service';
import { DispatchMessageController } from './dispatch/dispatch.controller';
import { DispatchRepository } from './dispatch/dispatch.repository';
import { DispatchUseCasesImpl } from './dispatch/dispatch.usecase.impl';
import { PricingRepository } from './pricing/pricing.repository';
import { PricingMessageController } from './pricing/pricing.controller';
import { PricingUseCasesImpl } from './pricing/pricing.usecase.impl';
import { MapsService } from './maps/maps.service';
// import { RedisService } from '../redis/redis.service';
import { DriverLocationService } from './maps/driver-location.service';
import { RouteOptimizerService } from './maps/route-optimizer.service';
import { ScheduleModule } from '@nestjs/schedule';
import { WebSocketModule } from '../websocket/socket.module'; // for temporary fix only
import { MapsUseCasesImpl } from './maps/maps.usecase.impl';
import { MapsRepository } from './maps/maps.repository';
import { MapMessageController } from './maps/maps.controller';
import { RouteCacheService } from './maps/navigation.service';
import { AppLogger } from '../common/app-logger.service';
import { NotificationPublisher } from '../common/notification-publisher';
// import { WorkerModule } from './order/workers/worker.module';
// import { QueueModule } from './order/queue/queue.module';
// import { OrderQueue } from './order/queue/order.queue';
// import { OrderWorker } from './order/workers/order.worker';
// import { DriverAssignmentQueue } from './order/queue/driver-assignment.queue';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    RedisModule,
    forwardRef(() => WebSocketModule),// temporary fix only
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'yourSecret',
      signOptions: { expiresIn: '15m' },
    }),
    // WorkerModule,
    // QueueModule,
  ],
  controllers: [
    OrderMessageController,
    DispatchMessageController,
    PricingMessageController,
    MapMessageController,
  ],
  providers: [
    OrderRepository,
    OrderUseCasesImpl,
    PrismaService,
    DispatchRepository,
    DispatchUseCasesImpl,
    PricingRepository,
    PricingUseCasesImpl,
    MapsService,
    // RedisService,
    DriverLocationService,
    RouteOptimizerService,
    RouteCacheService,
    MapsUseCasesImpl,
    MapsRepository,
    AppLogger,
    // OrderQueue,
    // OrderWorker,
    // DriverAssignmentQueue,
    NotificationPublisher,

  ],
  exports: [
    OrderUseCasesImpl,
    MapsService,
    PrismaService,
    DriverLocationService,
    RouteOptimizerService,
    RouteCacheService,
    // RedisService,
    DispatchUseCasesImpl,
    PricingUseCasesImpl,
    MapsUseCasesImpl,
  ],
})
export class FulfillmentModule {}