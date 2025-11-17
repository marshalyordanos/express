// import { Module } from '@nestjs/common';
// import { Queue } from 'bullmq';
// import { DriverAssignmentQueue } from './driver-assignment.queue';
// import { OrderQueue } from './order.queue';

// @Module({
//   providers: [
//     {
//       provide: 'ORDER_QUEUE',
//       useFactory: () =>
//         new Queue('order-queue', {
//           connection: {
//             host: process.env.REDIS_HOST,
//             port: parseInt(process.env.REDIS_PORT),
//             password: process.env.REDIS_PASSWORD,
//           },
//         }),
//     },
//     {
//       provide: 'DRIVER_ASSIGNMENT_QUEUE',
//       useFactory: () =>
//         new Queue('driver-assignment-queue', {
//           connection: {
//             host: process.env.REDIS_HOST,
//             port: parseInt(process.env.REDIS_PORT),
//             password: process.env.REDIS_PASSWORD,
//           },
//         }),
//     },
//     OrderQueue, // ✅ add these to providers
//     DriverAssignmentQueue,
//   ],
//   exports: [
//     'ORDER_QUEUE',
//     'DRIVER_ASSIGNMENT_QUEUE',
//     OrderQueue,
//     DriverAssignmentQueue,
//   ],
// })
// export class QueueModule {}
