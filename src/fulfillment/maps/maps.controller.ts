import { Controller, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { CheckPermission } from '../../common/decorator/check-permission.decorator';
import { PermissionGuard } from '../../common/permission.guard';
import { PATTERNS } from '../../contracts';
import { PermissionActions } from '../../contracts/permission-actions.enum';
import { MapsUseCasesImpl } from './maps.usecase.impl';
import { RouteCacheService } from './navigation.service';

@Controller()
export class MapMessageController {
  constructor(
    private readonly routeCacheService: RouteCacheService,
    private readonly usecases: MapsUseCasesImpl,
  ) {}

  @UseGuards(PermissionGuard)
  @CheckPermission('Maps', PermissionActions.CREATE)
  @MessagePattern(PATTERNS.MAP_GET_ROUTE)
  async getRoute(@Payload() payoad: { driverId: string }): Promise<any> {
    console.log('getRoute payload :', payoad.driverId);

    return this.usecases.getRoute(payoad.driverId);
  }

  @UseGuards(PermissionGuard)
  @CheckPermission('Maps', PermissionActions.CREATE)
  @MessagePattern(PATTERNS.MAP_MARK_STOP_VISITED)
  async markStopVisited(
    @Payload() payload: { driverId: string; orderId: string },
  ): Promise<any> {
    console.log('markStopVisited payload :', payload.driverId);

    return this.usecases.markStopVisited(payload.driverId, payload.orderId);
  }

  @UseGuards(PermissionGuard)
  @CheckPermission('Maps', PermissionActions.CREATE)
  @MessagePattern(PATTERNS.MAP_GET_CURRENT_ROUTE_STATUS)
  async getRouteStatus(@Payload() payoad: { driverId: string }): Promise<any> {
    console.log('getRouteStatus payload :', payoad.driverId);

    return this.usecases.getRouteStatus(payoad.driverId);
  }
}
