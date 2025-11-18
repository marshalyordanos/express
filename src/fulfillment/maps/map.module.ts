// maps.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { MapsService } from './maps.service';
import { DriverLocationService } from './driver-location.service';
import { RouteCacheService } from './navigation.service';
import { RouteOptimizerService } from './route-optimizer.service';
import { MapsUseCasesImpl } from './maps.usecase.impl';
import { MapsRepository } from './maps.repository';
import { RedisService } from '../../redis/redis.service';
import { MapMessageController } from './maps.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { AppLogger } from '../../common/app-logger.service';
// import { WebSocketModule } from '../../websocket/socket.module'; //temporary fix
// import { DriverLocationWsService } from '../../websocket/services/driver-location.ws.service';
// import { NavigationWsService } from '../../websocket/services/navigation.ws.service';

// @Module({
//   imports: [forwardRef(() => WebSocketModule)],
//   controllers: [MapMessageController],
//   providers: [
//     MapsService,
//     DriverLocationService,
//     RouteCacheService,
//     RouteOptimizerService,
//     MapsUseCasesImpl,
//     MapsRepository,
//     RedisService,
//     PrismaService,
//     AppLogger,
//   ],
//   exports: [
//     MapsService,
//     DriverLocationService,
//     RouteCacheService,
//     RouteOptimizerService,
//     MapsUseCasesImpl,
//     MapsRepository,
//         RedisService,           // ✅ export RedisService
//     PrismaService,
//   ],
// })
// export class MapsModule {}

// maps.module.ts
@Module({
  // imports: [forwardRef(() => WebSocketModule)], //temporary fix
  providers: [
    DriverLocationService,
    MapsRepository,
    MapsService,
    AppLogger,
    RedisService,
    PrismaService,
    RouteCacheService,
    RouteOptimizerService,
    // DriverLocationWsService, // ✅ Export //temporary fix
    // NavigationWsService,
  ],
  exports: [
    DriverLocationService,
    MapsService,
    RouteCacheService,
    RouteOptimizerService,
    // DriverLocationWsService, // ✅ Export //temporary fix
    // NavigationWsService,
  ],
})
export class MapsModule {}
