import { DriverLocationService } from '../../fulfillment/maps/driver-location.service';
export declare class DriverLocationWsService {
    private readonly driverLocationService;
    constructor(driverLocationService: DriverLocationService);
    updateDriverLocation(payload: {
        driverId: string;
        lon: number;
        lat: number;
        speed?: number;
        heading?: number;
    }): Promise<void>;
    findNearbyDrivers(orderIds: string[], radiusKm: number): Promise<any>;
    markOffline(driverId: string): Promise<void>;
    setOnlineEmitter(callback: (driverId: string, status?: 'ONLINE' | 'OFFLINE') => void): void;
}
