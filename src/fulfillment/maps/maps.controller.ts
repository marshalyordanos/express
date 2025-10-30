import { Controller, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CheckPermission } from '../../common/decorator/check-permission.decorator';
import { PermissionGuard } from '../../common/permission.guard';
import { PATTERNS } from '../../contracts';
import { PermissionActions } from '../../contracts/permission-actions.enum';
import { MapsUseCasesImpl } from './maps.usecase.impl';
import { RouteCacheService } from './navigation.service';
import { RateLimitGuard } from '../../common/rate-limit.guard';
import { DriverLocationService } from './driver-location.service';

@Controller()
export class MapMessageController {
  constructor(
    private readonly routeCacheService: RouteCacheService,
    private readonly usecases: MapsUseCasesImpl,
    private readonly locationService: DriverLocationService,
  ) {}

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Maps', PermissionActions.CREATE)
  @MessagePattern(PATTERNS.MAP_GET_ROUTE)
  async getRoute(@Payload() payoad: { driverId: string }): Promise<any> {
    console.log('getRoute payload :', payoad.driverId);

    return this.usecases.getRoute(payoad.driverId);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Maps', PermissionActions.CREATE)
  @MessagePattern(PATTERNS.MAP_MARK_STOP_VISITED)
  async markStopVisited(
    @Payload() payload: { driverId: string; orderId: string },
  ): Promise<any> {
    console.log('markStopVisited payload :', payload.driverId);

    return this.usecases.markStopVisited(payload.driverId, payload.orderId);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Maps', PermissionActions.READ)
  @MessagePattern(PATTERNS.MAP_GET_CURRENT_ROUTE_STATUS)
  async getRouteStatus(@Payload() payoad: { driverId: string }): Promise<any> {
    console.log('getRouteStatus payload :', payoad.driverId);

    return this.usecases.getRouteStatus(payoad.driverId);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Maps', PermissionActions.READ)
  @MessagePattern(PATTERNS.MAP_NEARBY_DRIVERS)
  async getNearbyDrivers(
    @Payload() payoad: { lat: any; lon: any; radius: any; user: any },
  ): Promise<any> {
    console.log('getNearbyDrivers payload :', payoad);

    const userId = payoad.user?.sub;
    return this.locationService.findNearbyDrivers(
      payoad.lon,
      payoad.lat,
      payoad.radius,
    );
  }
}
