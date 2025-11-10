import { CanActivate, ExecutionContext } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { AppLogger } from './app-logger.service';
export declare class RateLimitGuard implements CanActivate {
    private readonly redisService;
    private readonly logger;
    private readonly limit;
    private readonly windowMs;
    private readonly blockDuration;
    constructor(redisService: RedisService, logger: AppLogger);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private throwLimitException;
}
