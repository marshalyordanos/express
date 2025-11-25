import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { RedisPublisher } from './redis.publisher';
import { RedisSubscriber } from './redis.subscriber';

@Global()
@Module({
  providers: [RedisService, RedisPublisher, RedisSubscriber],
  exports: [RedisService, RedisPublisher, RedisSubscriber],
})
export class RedisModule {}
