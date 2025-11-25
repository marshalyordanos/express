import { Injectable, OnModuleInit } from '@nestjs/common';
import { RedisService } from './redis.service';

@Injectable()
export class RedisSubscriber implements OnModuleInit {
  constructor(private redis: RedisService) {}

  async onModuleInit() {
    console.log('📡 Redis Subscriber Ready');
  }

  async subscribe(channel: string, handler: (data: any) => void) {
    const sub = this.redis.getSubscriber();

    await sub.subscribe(channel, (message) => {
      try {
        const parsed = JSON.parse(message);
        handler(parsed);
      } catch {
        handler(message);
      }
    });
  }
}
