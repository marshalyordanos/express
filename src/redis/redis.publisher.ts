import { Injectable } from '@nestjs/common';
import { RedisService } from './redis.service';

@Injectable()
export class RedisPublisher {
  constructor(private redis: RedisService) {}

  async publish(channel: string, payload: any) {
    const message =
      typeof payload === 'string' ? payload : JSON.stringify(payload);

    return this.redis.getClient().publish(channel, message);
  }
}
