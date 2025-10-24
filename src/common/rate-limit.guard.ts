import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly limit = 5; // max requests per window
  private readonly windowMs = 60 * 1000; // 1 minute
  private readonly blockDuration = 5 * 60; // 5 minutes block
  private readonly logger = new Logger('RateLimitGuard');

  constructor(private readonly redisService: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    let userId = 'anon:unknown';
    let ipAddress = 'unknown';
    let resource = 'unknown';

    const ctxType = context.getType<'rpc' | 'http'>();

    if (ctxType === 'http') {
      const req = context.switchToHttp().getRequest();
      ipAddress = req.ip || 'unknown';
      userId = req.user?.sub || `anon:${ipAddress}`;
      resource = `${req.method} ${req.originalUrl}`;
    } else if (ctxType === 'rpc') {
      const rpcCtx = context.switchToRpc();
      const payload = rpcCtx.getContext?.()?.getArgs?.()?.[0] || rpcCtx.getData?.() || {};
      userId = payload?.user?.sub || `anon:${payload?.ip || 'unknown'}`;
      ipAddress = payload?.ip || 'unknown';
      resource = rpcCtx.getContext?.().getPattern?.() || 'unknown';
    }

    this.logger.log(`User ${userId} accessing ${resource} from IP ${ipAddress}`);

    const now = Date.now();
    const rateKey = `rate:${userId}:${resource}`;
    const ipKey = `ips:${userId}`;
    const blockKey = `block:${userId}`;
    const redisClient = this.redisService.getClient();

    // 2️⃣ Check temporary block
    const isBlocked = await this.redisService.get(blockKey);
    if (isBlocked) {
      this.throwLimitException(ctxType, `Too many requests to ${resource}. Try again later.`);
    }

    // 3️⃣ Fetch request timestamps from Redis
    const existing = await this.redisService.gets(rateKey);
    let timestamps: number[] = [];
    if (existing) {
      try {
        const parsed = JSON.parse(existing);
        if (Array.isArray(parsed)) timestamps = parsed;
      } catch {
        timestamps = [];
      }
    }

    // 4️⃣ Sliding window: remove old timestamps
    const recentTimestamps = timestamps.filter((ts) => now - ts < this.windowMs);

    // 5️⃣ Add current timestamp
    recentTimestamps.push(now);

    // 6️⃣ Save updated timestamps
    await this.redisService.set(rateKey, JSON.stringify(recentTimestamps), {
      EX: Math.ceil(this.windowMs / 1000),
    });

    // 7️⃣ Track IP
    await redisClient.sAdd(ipKey, ipAddress);
    await redisClient.expire(ipKey, Math.ceil(this.windowMs / 1000));

    // 8️⃣ Check limit exceeded
    if (recentTimestamps.length > this.limit) {
      await this.redisService.set(blockKey, '1', { EX: this.blockDuration });
      this.logger.warn(
        `User ${userId} exceeded rate limit for ${resource}. Temporarily blocked.`,
      );
      this.throwLimitException(ctxType, `Too many requests to ${resource}. Try again later.`);
    }

    return true;
  }

  private throwLimitException(ctxType: string, message: string) {
    if (ctxType === 'rpc') throw new RpcException({ statusCode: 429, message });
    else throw new HttpException(message, HttpStatus.TOO_MANY_REQUESTS);
  }
}



// // guards/rate-limit.guard.ts
// import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

// const rateMap = new Map<string, { count: number; time: number }>();

// @Injectable()
// export class RateLimitGuard implements CanActivate {
//   private readonly limit = 5; // 5 requests
//   private readonly windowMs = 60 * 1000; // 1 minute

//   canActivate(context: ExecutionContext): boolean {
//     const req = context.switchToRpc().getContext().getArgs()[0]; // for microservice payload
//     const userId = req?.user?.sub || req?.ip || 'unknown';

//     const now = Date.now();
//     const entry = rateMap.get(userId) || { count: 0, time: now };

//     if (now - entry.time > this.windowMs) {
//       // Reset window
//       entry.count = 1;
//       entry.time = now;
//     } else {
//       entry.count += 1;
//       if (entry.count > this.limit) {
//         throw new RpcException({ statusCode: 429, message: 'Rate limit exceeded. Too many requests. Please try again later.' });
//       }
//     }

//     rateMap.set(userId, entry);
//     return true;
//   }
// }
