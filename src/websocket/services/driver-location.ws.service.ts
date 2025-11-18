// import { forwardRef, Inject, Injectable } from '@nestjs/common';
// import { DriverLocationService } from '../../fulfillment/maps/driver-location.service';

// @Injectable()
// export class DriverLocationWsService {
//   constructor(
//     @Inject(forwardRef(() => DriverLocationService))
//     private readonly driverLocationService: DriverLocationService,
//   ) {}

//   async updateDriverLocation(payload: {
//     driverId: string;
//     lon: number;
//     lat: number;
//     speed?: number;
//     heading?: number;
//   }) {
//     return this.driverLocationService.updateDriverLocation(payload);
//   }

//   async findNearbyDrivers(orderIds: string[], radiusKm: number): Promise<any> {
//     return this.driverLocationService.findNearbyDrivers(orderIds, radiusKm);
//   }

//   markOffline(driverId: string) {
//     return this.driverLocationService.markOfflineByDriverId(driverId);
//   }

//   setOnlineEmitter(
//     callback: (driverId: string, status?: 'ONLINE' | 'OFFLINE') => void,
//   ) {
//      // Wrap the callback so we can inspect the data
//   const wrappedCallback = (driverId: string, status?: 'ONLINE' | 'OFFLINE') => {
//     console.log('🚚 Driver Status Callback Triggered:');
//     console.log('Driver ID:', driverId);
//     console.log('Status:', status);
    
//     // Call the original callback
//     callback(driverId, status);
//   };

//   console.log('✅ Online emitter initialized');
//     this.driverLocationService.setOnlineEmitter(wrappedCallback);
//   }
// }