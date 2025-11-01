import { forwardRef, Module } from '@nestjs/common';
import { WebSocketEventService } from './services/websocket-event.service';
import { DriverLocationWsService } from './services/driver-location.ws.service';
import { OrderDistanceWsService } from './services/order-distance.ws.service';
import { FulfillmentModule } from '../fulfillment/fulfillment.module';
import { MapModule } from '../redis/redis.module';
import { MapLocationGateway } from './gateways/map-location.gateway';
import { MapsService } from '../fulfillment/maps/maps.service';
import { RedisService } from '../redis/redis.service';
import { NavigationWsService } from './services/navigation.ws.service';
@Module({
  imports: [ MapModule,forwardRef(() => FulfillmentModule),],
  providers: [
    MapLocationGateway,
    WebSocketEventService,
    DriverLocationWsService,
    OrderDistanceWsService,
    NavigationWsService,
    MapsService,
    RedisService,
    // DriverLocationService,
  ],
  exports: [WebSocketEventService, MapLocationGateway],
})
export class WebSocketModule {}