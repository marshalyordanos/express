import { Inject, Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class OrderQueue {
  constructor(
    @Inject('ORDER_QUEUE')
    private readonly queue: Queue,
  ) {}

    // Generic add method
  async add(jobName: string, payload: any, options: any = {}) {
    console.log(`Order queue and job name :: ${jobName} and payload :: ${payload} and options :: ${options}`);
    
    return this.queue.add(jobName, payload, {
      removeOnComplete: true,
      attempts: 4,
      ...options,
    });
  }

  async enqueueDistancePrice(orderId: string, payload: any) {
    console.log(`Creating queue for order ${orderId} and payload :: ${payload}`);
    
    await this.queue.add(
      'distance-price',
      { orderId, ...payload },
      {
        attempts: 5,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: true,
      },
    );
  }

  async enqueueSegmentCreation(orderId: string) {
    await this.queue.add(
      'segment-create',
      { orderId },
      {
        attempts: 3,
        backoff: 10000,
        removeOnComplete: true,
      },
    );
  }
}
