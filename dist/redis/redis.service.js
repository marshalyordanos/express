"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const redis_1 = require("redis");
let RedisService = class RedisService {
    async onModuleInit() {
        this.client = (0, redis_1.createClient)({
            socket: {
                host: process.env.REDIS_HOST,
                port: parseInt(process.env.REDIS_PORT, 10),
            },
            username: process.env.REDIS_USERNAME,
            password: process.env.REDIS_PASSWORD,
        });
        this.client.on('connect', () => console.log('✅ Connected to Redis Cloud'));
        this.readyPromise = new Promise((resolve, reject) => {
            this.client.on('connect', () => {
                console.log('✅ Redis connected');
                resolve();
            });
            this.client.on('error', (err) => {
                console.error('❌ Redis error:', err);
                reject(err);
            });
        });
        await this.client.connect();
    }
    async set(key, value, options) {
        if (options?.EX) {
            return this.client.set(key, value, { EX: options.EX });
        }
        return this.client.set(key, value);
    }
    async get(key) {
        return this.client.get(key);
    }
    async gets(key) {
        const result = await this.client.get(key);
        return typeof result === 'string' ? result : null;
    }
    async del(key) {
        return this.client.del(key);
    }
    async waitUntilReady() {
        return this.readyPromise;
    }
    getClient() {
        return this.client;
    }
    async onModuleDestroy() {
        await this.client.quit();
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = __decorate([
    (0, common_1.Injectable)()
], RedisService);
//# sourceMappingURL=redis.service.js.map