// websocket-shared.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { WebSocketEventService } from './services/websocket-event.service';
import { DriverLocationWsService } from './services/driver-location.ws.service';
// import { OrderDistanceWsService } from '../fulfillment/order-distance.ws.service';
import { NavigationWsService } from './services/navigation.ws.service';
import { MapLocationGateway } from './gateways/map-location.gateway';
import { MapModule } from '../redis/redis.module';
import { MapsModule } from '../fulfillment/maps/map.module';
import { FulfillmentModule } from '../fulfillment/fulfillment.module';

@Module({
  imports: [MapModule,  forwardRef(() => MapsModule), // ✅ Import to access DriverLocationWsService & NavigationWsService
    forwardRef(() => FulfillmentModule), // ✅ Import to access OrderDistanceWsService
  ],
  providers: [
    WebSocketEventService,
    // DriverLocationWsService,
    // OrderDistanceWsService,
    // NavigationWsService,
    MapLocationGateway,
  ],
  exports: [
    WebSocketEventService,
    // DriverLocationWsService,
    // OrderDistanceWsService,
    // NavigationWsService,
    MapLocationGateway,
  ],
})
export class WebSocketSharedModule {}
