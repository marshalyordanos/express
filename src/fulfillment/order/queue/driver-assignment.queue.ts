// import { Inject, Injectable } from '@nestjs/common';
// import { Queue } from 'bullmq';

// @Injectable()
// export class DriverAssignmentQueue {
//   constructor(
//     @Inject('DRIVER_ASSIGNMENT_QUEUE')
//     private readonly queue: Queue,
//   ) {}

//   async enqueueInternalDriverAssignment(orderId: string) {
//     await this.queue.add(
//       'assign-internal',
//       { orderId },
//       {
//         attempts: 5,
//         backoff: { type: 'exponential', delay: 8000 },
//         removeOnComplete: true,
//       },
//     );
//   }

//   async enqueueExternalDriverAssignment(orderId: string) {
//     await this.queue.add(
//       'assign-external',
//       { orderId },
//       {
//         attempts: 3,
//         backoff: 15000,
//         removeOnComplete: true,
//       },
//     );
//   }
// }
