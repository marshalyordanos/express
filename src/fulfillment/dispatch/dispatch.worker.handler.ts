// import { Injectable } from "@nestjs/common";
// import { DispatchRepository } from "./dispatch.repository";
// import { RpcException } from "@nestjs/microservices";



// @Injectable()
// export class DispatchWorkerHandler {
//     constructor(
//         private readonly dispatchRepo: DispatchRepository,

//     ) {}


// async createRouteSegments(orderIds: string[], driverId: string) {
//   if (!orderIds || orderIds.length === 0) return [];

//   // 1️⃣ Get driver location (latest)
//   let driverLocation = await this.getDriverLocation(driverId);
//   if (!driverLocation) {
//     throw new RpcException("Driver location not found");
//   }

//   // 2️⃣ Fetch all orders at once
//   const orders = await this.dispatchRepo.findOrdersByIds(orderIds);

//   // 3️⃣ Build all promises for creating route segments
//   const promises = orders.map(order => (async () => {
//     const destination = {
//       id: order.pickupAddressId,
//       lat: parseFloat(order.pickupAddress.lat),
//       lon: parseFloat(order.pickupAddress.long),
//     };

//     const distanceMeters = await this.mapService.calculateDistance(
//       driverLocation,
//       { lat: destination.lat, lon: destination.lon },
//     );

//     const etaMinutes = await this.mapService.calculateETA(
//       driverLocation,
//       { lat: destination.lat, lon: destination.lon },
//     );

//     // Call single-segment repository
//     return this.dispatchRepo.createRouteSegmentOnly(
//       driverId,
//       order.id,
//       driverLocation,
//       destination,
//       distanceMeters,
//       etaMinutes,
//     );
//   })());

//   // 4️⃣ Run all inserts in parallel
//   const results = await Promise.all(promises);
//   return results;
// }

// }