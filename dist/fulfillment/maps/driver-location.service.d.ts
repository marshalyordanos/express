import { RedisService } from '../../redis/redis.service';
import { PrismaService } from '../../prisma/prisma.service';
import { WebSocketEventService } from '../../websocket/services/websocket-event.service';
export interface NearbyDriver {
    driverId: string;
    distanceKm: number;
    coordinates: {
        lat: number;
        lon: number;
    };
}
export declare class DriverLocationService {
    private readonly redisService;
    private readonly prisma;
    private websocketEventService;
    private readonly GEO_KEY;
    private readonly LOCATION_TTL_SECONDS;
    private readonly STATUS_PERSIST_MINUTES;
    private readonly LOCATION_LOG_INTERVAL_SECONDS;
    private readonly logger;
    constructor(redisService: RedisService, prisma: PrismaService, websocketEventService: WebSocketEventService);
    updateDriverLocation(data: {
        driverId: string;
        lon: number;
        lat: number;
        speed?: number;
        heading?: number;
    }): Promise<void>;
    onlineEmitter: (driverId: string, status?: 'ONLINE' | 'OFFLINE') => void;
    setOnlineEmitter(fn: (driverId: string) => void): void;
    findNearbyDrivers(lon: number, lat: number, radiusKm: number): Promise<any[]>;
    syncToDatabase(): Promise<void>;
    updateOfflineDrivers(): Promise<void>;
    markOfflineByDriverId(driverId: string): Promise<void>;
}
