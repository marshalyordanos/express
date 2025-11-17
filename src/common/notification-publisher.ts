import { Inject, Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class NotificationPublisher {
  constructor(@Inject(RedisService) private readonly redisService: RedisService) {}

  async publish(channel: string, payload: any) {
    const client = this.redisService.getClient();
    console.log(`Publishing to channel ${channel}: ${JSON.stringify(payload)}`);
    await client.publish(channel, JSON.stringify(payload));
    console.log(`Published to channel ${channel}: ${JSON.stringify(payload)}`);
  }
}
