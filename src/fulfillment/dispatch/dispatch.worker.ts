import { Injectable, OnModuleInit } from '@nestjs/common';
import { RedisSubscriber } from '../../redis/redis.subscriber';
import { DispatchUseCasesImpl } from './dispatch.usecase.impl';
import { RedisPublisher } from '../../redis/redis.publisher';
import { NotificationPublisher } from '../../common/notification-publisher';
// import { DispatchWorkerHandler } from './dispatch.worker.handler';

@Injectable()
export class DispatchWorker implements OnModuleInit {
  constructor(
    private subscriber: RedisSubscriber,
    private publisher: RedisPublisher,
    private dispatchUseCase: DispatchUseCasesImpl,
    private notificationPublisher: NotificationPublisher,
    // private handler: DispatchWorkerHandler,
  ) {}

  async onModuleInit() {
    await this.subscriber.subscribe(
      'create_segments',
      async (event) => await this.onCreateRouteSegment(event),
    );
        await this.subscriber.subscribe(
      'pickup_driver_assigned',
      async (event) => await this.onCreateRouteSegment(event),
    );

  }

  private async onCreateRouteSegment(event: any) {
    // Expecting event.orders to be an array of orderIds, and driverId
    const { orderIds, driverId } = event;
    
    if (!Array.isArray(orderIds) || !driverId) {
      console.warn('[OrderWorker] Invalid event payload', event);
      return;
    }

    const orderId = orderIds.map(o => o.orderId);
    // create route segments for all orders assigned to this driver
    // await this.dispatchUseCase.createRouteSegmentAsync(
    //   driverId,
    //   true,
    //   null,
    //   orderId,
    // );

  }
}
