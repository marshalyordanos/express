import { Injectable, OnModuleInit } from '@nestjs/common';
import { RedisSubscriber } from '../../redis/redis.subscriber';
import { MapsUseCasesImpl } from './maps.usecase.impl';
import { RedisPublisher } from '../../redis/redis.publisher';
import { NotificationPublisher } from '../../common/notification-publisher';

@Injectable()
export class MapWorker implements OnModuleInit {
  constructor(
    private subscriber: RedisSubscriber,
    private publisher: RedisPublisher,
    private mapUseCase: MapsUseCasesImpl,
    private notificationPublisher: NotificationPublisher,
  ) {}

  async onModuleInit() {
    // await this.subscriber.subscribe(
    //   'pickup_driver_assigned',
    //   async (event) => await this.onDriverAssigned(event),
    // );
  }
  

  private async onDriverAssigned(event: any) {
    console.log("ON THE EVENT ::: ", event);
    
    // Expecting event.orders to be an array of orderIds, and driverId
    const { orderIds, driverId } = event;

    console.log("Updating for route segement order ::: ", orderIds);
    console.log("Updating for route segement  driver::: ", driverId);

    if (!Array.isArray(orderIds) || !driverId) {
      console.warn('[OrderWorker] Invalid event payload', event);
      return;
    }

    // Update route segments for all orders assigned to this driver
    await this.mapUseCase.updateDriverRouteSegments(
      orderIds,
      driverId,
    );

  }
}
