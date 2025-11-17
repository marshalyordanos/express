// import { Worker } from 'bullmq';
// import { Injectable } from '@nestjs/common';
// import { OrderUseCasesImpl } from '../order.usecase.impl';

// @Injectable()
// export class DriverAssignmentWorker {
//   constructor(private readonly orderService: OrderUseCasesImpl) {
//     new Worker(
//       'driver-assignment-queue',
//       async (job) => {
//         const { orderId } = job.data;

//         if (job.name === 'assign-internal') {
//           const result = await this.orderService.assignInternalDrivers(orderId);

//           if (!result.success) {
//             // fallback
//             await job.queue.add(
//               'assign-external',
//               { orderId },
//               { attempts: 3, backoff: 12000 },
//             );
//           }
//         }

//         if (job.name === 'assign-external') {
//           await this.orderService.assignExternalDrivers(orderId);
//         }
//       },
//       {
//         connection: {
//           host: process.env.REDIS_HOST,
//           port: parseInt(process.env.REDIS_PORT),
//         },
//       },
//     );
//   }
// }
