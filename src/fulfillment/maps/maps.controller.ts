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
import { IResponse } from '../../common/types';

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
    const result = await this.usecases.getRoute(payoad.driverId);
    return IResponse.success('Route Fetched successfully', result);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Maps', PermissionActions.UPDATE)
  @MessagePattern(PATTERNS.MAP_MARK_STOP_VISITED)
  async markStopVisited(
    @Payload() payload: { driverId: string; orderId: string },
  ): Promise<any> {
    const result = await this.usecases.markStopVisited(
      payload.driverId,
      payload.orderId,
    );
    return IResponse.success('Stop visited successfully', result);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Maps', PermissionActions.READ)
  @MessagePattern(PATTERNS.MAP_GET_CURRENT_ROUTE_STATUS)
  async getRouteStatus(@Payload() payoad: { driverId: string }): Promise<any> {
    const result = await this.usecases.getRouteStatus(payoad.driverId);
    return IResponse.success('Route Status Fetched successfully', result);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Maps', PermissionActions.READ)
  @MessagePattern(PATTERNS.MAP_NEARBY_DRIVERS)
  async getNearbyDrivers(
    @Payload() payoad: { orderIds: string[]; radius: any; user: any },
  ): Promise<any> {
    const userId = payoad.user?.sub;
    const result = await this.locationService.findNearbyDrivers(
      payoad.orderIds,
      payoad.radius,
    );

    return IResponse.success('Nearby Drivers Fetched successfully', result);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Maps', PermissionActions.READ)
  @MessagePattern(PATTERNS.MAP_EXTERNAL_NEARBY_DRIVERS)
  async findNearbyExternalDrivers(
    @Payload() payoad: { lon: number; lat: number; radius: any; user: any },
  ): Promise<any> {
    const userId = payoad.user?.sub;
    const result = await this.locationService.findNearbyExternalDrivers(
      payoad.lon,
      payoad.lat,
      payoad.radius,
    );

    return IResponse.success(
      'External Nearby Drivers Fetched successfully',
      result,
    );
  }
}
