// src/common/redis.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClientType;

  async onModuleInit() {
    this.client = createClient({
      socket: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT, 10),
        // tls: true,
      },
      username: process.env.REDIS_USERNAME,
      password: process.env.REDIS_PASSWORD,
    });

    this.client.on('connect', () => console.log('✅ Connected to Redis Cloud'));
    this.client.on('error', (err) => console.error('❌ Redis error:', err));

    await this.client.connect();
  }

  getClient() {
    return this.client;
  }

  async onModuleDestroy() {
    await this.client.quit();
  }
}
