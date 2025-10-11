import { Module } from '@nestjs/common';
import { MapLocationGateway } from './map-location.gateway';
// import { MapModule } from '../../fulfillment/maps/map.module';
import { MapModule } from '../../redis/redis.module';
import { RedisService } from '../../redis/redis.service';
import { DriverLocationService } from '../../fulfillment/maps/driver-location.service';
import { FulfillmentModule } from '../../fulfillment/fulfillment.module';
@Module({
  imports: [MapModule, FulfillmentModule],
  providers: [MapLocationGateway],
})
export class WebSocketModule {}
