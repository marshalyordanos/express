import { RedisService } from '../redis/redis.service';
export declare class NotificationPublisher {
    private readonly redisService;
    constructor(redisService: RedisService);
    publish(channel: string, payload: any): Promise<void>;
}
