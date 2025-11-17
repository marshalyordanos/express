"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimitGuard = void 0;
const common_1 = require("@nestjs/common");
const redis_service_1 = require("../redis/redis.service");
const microservices_1 = require("@nestjs/microservices");
const app_logger_service_1 = require("./app-logger.service");
let RateLimitGuard = class RateLimitGuard {
    constructor(redisService, logger) {
        this.redisService = redisService;
        this.logger = logger;
        this.limit = 500;
        this.windowMs = 60 * 1000;
        this.blockDuration = 5 * 60;
        this.logger.setContext('Security', 'RateLimitGuard');
    }
    async canActivate(context) {
        let userId = 'anon:unknown';
        let email = 'unknown';
        let ipAddress = 'unknown';
        let resource = 'unknown';
        const ctxType = context.getType();
        if (ctxType === 'http') {
            const req = context.switchToHttp().getRequest();
            ipAddress = req.ip || 'unknown';
            userId = req.user?.sub || `anon:${ipAddress}`;
            resource = `${req.method} ${req.originalUrl}`;
        }
        else if (ctxType === 'rpc') {
            const rpcCtx = context.switchToRpc();
            const data = rpcCtx.getData();
            userId = data?.user?.sub || `anon:${data?.ip || 'unknown'}`;
            email = data?.user?.email || 'unknown';
            ipAddress = data?.ip || 'unknown';
            resource = rpcCtx.getContext?.().getPattern?.() || 'unknown';
        }
        this.logger.log(`User with Email: [${email}] with ID: [${userId}] accessing resource: [${resource}] from IP: [${ipAddress}].`);
        const now = Date.now();
        const rateKey = `rate:${userId}:${resource}`;
        const ipKey = `ips:${userId}`;
        const blockKey = `block:${userId}`;
        const redisClient = this.redisService.getClient();
        const isBlocked = await this.redisService.get(blockKey);
        if (isBlocked) {
            this.throwLimitException(ctxType, `Too many requests to ${resource}. Try again later.`);
        }
        const existing = await this.redisService.gets(rateKey);
        let timestamps = [];
        if (existing) {
            try {
                const parsed = JSON.parse(existing);
                if (Array.isArray(parsed))
                    timestamps = parsed;
            }
            catch {
                timestamps = [];
            }
        }
        const recentTimestamps = timestamps.filter((ts) => now - ts < this.windowMs);
        recentTimestamps.push(now);
        await this.redisService.set(rateKey, JSON.stringify(recentTimestamps), {
            EX: Math.ceil(this.windowMs / 1000),
        });
        await redisClient.sAdd(ipKey, ipAddress);
        await redisClient.expire(ipKey, Math.ceil(this.windowMs / 1000));
        if (recentTimestamps.length > this.limit) {
            await this.redisService.set(blockKey, '1', { EX: this.blockDuration });
            this.logger.warn(`User with Email: [${email}] with ID: [${userId}] exceeded rate limit for resource: [${resource}]. Temporarily blocked.`);
            this.throwLimitException(ctxType, `Too many requests to ${resource}. Try again later.`);
        }
        return true;
    }
    throwLimitException(ctxType, message) {
        if (ctxType === 'rpc')
            throw new microservices_1.RpcException({ statusCode: 429, message });
        else
            throw new common_1.HttpException(message, common_1.HttpStatus.TOO_MANY_REQUESTS);
    }
};
exports.RateLimitGuard = RateLimitGuard;
exports.RateLimitGuard = RateLimitGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService,
        app_logger_service_1.AppLogger])
], RateLimitGuard);
//# sourceMappingURL=rate-limit.guard.js.map