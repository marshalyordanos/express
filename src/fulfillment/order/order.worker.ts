import { Injectable, OnModuleInit } from '@nestjs/common';
import { RedisSubscriber } from '../../redis/redis.subscriber';
import { OrderUseCasesImpl } from './order.usecase.impl';
import { RedisPublisher } from '../../redis/redis.publisher';
import { NotificationPublisher } from '../../common/notification-publisher';

@Injectable()
export class OrderWorker implements OnModuleInit {
  constructor(
    private subscriber: RedisSubscriber,
    private publisher: RedisPublisher,
    private ordersService: OrderUseCasesImpl,
    private notificationPublisher: NotificationPublisher,
  ) {}
  async onModuleInit() {
    await this.subscriber.subscribe(
      'order_created',
      async (event) => await this.onOrderCreated(event),
    );
  }

  private async onOrderCreated(event: any) {
    const orderId = event.orderId;
    const result =
      await this.ordersService.calculateDistancePriceBackground(orderId);

    this.notificationPublisher.publish('order.price.calculated', {
      orderId,
      userId: result.customerId,
      payload: { finalPrice: result.price },
    });
  }

  async handleOrderCreated(event: any) {
    const { orderId, payload, timestamp } = event;

    // ⭐⭐⭐ PLACE YOUR BACKGROUND LOGIC HERE ⭐⭐⭐

    // Example tasks:
    await this.sendNotification(orderId, payload);
    await this.assignDriver(orderId, payload);
    await this.writeAuditLog(event);
  }

  private async sendNotification(orderId: number, payload: any) {
    console.log('📨 Sending notification for order', orderId);
    // send SMS, email, push, etc.
  }

  private async assignDriver(orderId: number, payload: any) {
    console.log('👷 Assigning driver automatically...');
    // driver matching logic goes here
  }

  private async writeAuditLog(event: any) {
    console.log('📝 Writing audit log...', event);
    // write to DB, or another microservice
  }
}
