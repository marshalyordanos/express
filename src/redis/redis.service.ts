// src/common/redis.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClientType;
  public client2: RedisClientType;
  private readyPromise: Promise<void>;

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
    // this.client.on('error', (err) => console.error('❌ Redis error:', err));

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

  async set(key: string, value: string, options?: { EX?: number }) {
    if (options?.EX) {
      return this.client.set(key, value, { EX: options.EX });
    }
    return this.client.set(key, value);
  }

  async get(key: string) {
    return this.client.get(key);
  }

  async gets(key: string): Promise<string | null> {
    const result = await this.client.get(key);
    return typeof result === 'string' ? result : null; // ensure string or null
  }

  async del(key: string) {
    return this.client.del(key);
  }

  // getClient() {
  //   return this.client;
  // }
  /** ✅ Wait until Redis is fully initialized */
  async waitUntilReady(): Promise<void> {
    return this.readyPromise;
  }

  getClient(): RedisClientType {
    return this.client;
  }
  async onModuleDestroy() {
    await this.client.quit();
  }
}
