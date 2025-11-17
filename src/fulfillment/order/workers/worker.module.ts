import { forwardRef, Module } from '@nestjs/common';
import { OrderWorker } from '../workers/order.worker';
// import { DriverAssignmentWorker } from './driver-assignment.worker';
import { PrismaService } from '../../../prisma/prisma.service';
import { QueueModule } from '../queue/queue.module';
import { OrderUseCasesImpl } from '../order.usecase.impl';
import { OrderRepository } from '../order.repository';
import { MapsModule } from '../../../fulfillment/maps/map.module';
import { FulfillmentModule } from '../../../fulfillment/fulfillment.module';
import { AppLogger } from '../../../common/app-logger.service';
import { NotificationPublisher } from '../../../common/notification-publisher';

@Module({
  imports: [QueueModule,MapsModule,forwardRef(() => FulfillmentModule)],
  providers: [
    PrismaService,
    OrderRepository,
    OrderUseCasesImpl,
    OrderWorker,
    AppLogger,
    NotificationPublisher,
    // DriverAssignmentWorker,
  ],
  exports: [OrderWorker],
})
export class WorkerModule {}
