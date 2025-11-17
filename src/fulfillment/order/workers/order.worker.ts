import { Worker } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { OrderUseCasesImpl } from '../order.usecase.impl';

@Injectable()
export class OrderWorker {
  constructor(private readonly orderService: OrderUseCasesImpl) {
    new Worker(
      'order-queue', // same queue as OrderQueue
      async (job) => {
        switch (job.name) {
          case 'distance-price':
            // do NOT enqueue another job
            await this.orderService.calculateDistancePriceBackground(
              job.data.orderId,
            );
            break;

          case 'segment-create':
            await this.orderService.generateSegments(job.data.orderId);
            break;

          default:
            console.log('Unknown Job:', job.name);
        }
      },
      {
        connection: {
          host: process.env.REDIS_HOST,
          port: parseInt(process.env.REDIS_PORT),
          password: process.env.REDIS_PASSWORD,
        },
      },
    );
  }
}
