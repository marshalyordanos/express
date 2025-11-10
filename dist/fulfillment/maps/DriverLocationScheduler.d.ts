import { DriverLocationService } from './driver-location.service';
export declare class DriverLocationScheduler {
    private readonly driverLocationService;
    private readonly logger;
    constructor(driverLocationService: DriverLocationService);
    handleCron(): Promise<void>;
}
