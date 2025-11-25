// src/common/redis.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClientType; // for cache/normal operations
  private subscriber: RedisClientType; // for pub/sub
  // public client2: RedisClientType;
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

    this.subscriber = createClient({
      socket: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT, 10),
      },
      username: process.env.REDIS_USERNAME,
      password: process.env.REDIS_PASSWORD,
    });

    this.readyPromise = new Promise((resolve, reject) => {
      this.client.on('connect', () => resolve());
      this.client.on('error', (err) => reject(err));
    });

    await this.client.connect();
    await this.subscriber.connect();
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

  getSubscriber(): RedisClientType {
    return this.subscriber;
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
    await this.subscriber.quit();
  }
}
