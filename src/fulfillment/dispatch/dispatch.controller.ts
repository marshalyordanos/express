import { Body, Controller, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Public } from '../../common/decorator/public.decorator';
import { PATTERNS } from '../../contracts';
import { DispatchUseCasesImpl } from './dispatch.usecase.impl';
import {
  AssignDriverForPickup,
  AssignOfficerForBatch,
  BatchDispatchDto,
  BatchHandoverDto,
  CompleteDeliveryDto,
  ConfirmBatchHandoverDto,
  LastMileDeliveryDto,
  OrderScanTokenDto,
} from './dispatch.entity';
import { IResponse } from '../../common/types';
import { ListQueryDto } from '../../common/query/query.dto';
import { CheckPermission } from '../../common/decorator/check-permission.decorator';
import { PermissionGuard } from '../../common/permission.guard';
import { PermissionActions } from '../../contracts/permission-actions.enum';

@Controller()
export class DispatchMessageController {
  constructor(private readonly usecases: DispatchUseCasesImpl) {}

  @UseGuards(PermissionGuard)
  @CheckPermission('Dispatch', PermissionActions.CREATE)
  //   @Public()
  @MessagePattern(PATTERNS.DISPATCH_ASSIGN_DRIVER_FOR_PICKUP)
  async assignDriverForPickup(
    @Payload() payoad: { data: AssignDriverForPickup },
  ): Promise<any> {
    console.log('assignDriverForPickup payload :', payoad.data);

    return this.usecases.assignDriverForPickup(payoad.data);
  }

  @UseGuards(PermissionGuard)
  @CheckPermission('Dispatch', PermissionActions.CREATE)
  //   @Public()
  @MessagePattern(PATTERNS.DISPATCH_APPROVE_CATEGORIZATION)
  async createBatchDispatch(
    @Payload() payload: { data: BatchDispatchDto },
  ): Promise<any> {
    const result = await this.usecases.createBatchDispatch(payload.data);
    console.log('createBatchDispatch payload :', payload.data);

    return IResponse.success('Batch Dispatch created successfully', result);
  }

  @UseGuards(PermissionGuard)
  @CheckPermission('Dispatch', PermissionActions.READ)
  //   @Public()
  @MessagePattern(PATTERNS.DISPATCH_FIND_ALL)
  async findDispatches(
    @Payload() payload: { query: ListQueryDto },
  ): Promise<any> {
    console.log('body: ', payload.query);
    return this.usecases.getBatches(payload.query);
  }

  @UseGuards(PermissionGuard)
  @CheckPermission('Dispatch', PermissionActions.CREATE)
  //   @Public()
  @MessagePattern(PATTERNS.DISPATCH_ADD_ORDERS_TO_BATCH)
  async addOrdersToBatch(
    @Payload() payload: { data: any; batchId: string; newOrderIds: string[] },
  ): Promise<any> {
    console.log('addOrdersToBatch payload: ', payload);
    const { batchId, newOrderIds, data } = payload;
    return this.usecases.addOrdersToBatch(batchId, newOrderIds, data);
  }

  @UseGuards(PermissionGuard)
  @CheckPermission('Dispatch', PermissionActions.CREATE)
  //   @Public()
  @MessagePattern(PATTERNS.DISPATCH_ASSIGN_OFFICER_TO_BATCH)
  async assignOfficerToBatch(
    @Payload() payload: { data: AssignOfficerForBatch },
  ): Promise<any> {
    console.log('assignOfficerToBatch data :', payload.data);

    return this.usecases.confirmDispatch(payload.data);
  }

  @UseGuards(PermissionGuard)
  @CheckPermission('Dispatch', PermissionActions.UPDATE)
  //   @Public()
  @MessagePattern(PATTERNS.DISPATCH_COLLECT_BATCH_BY_CARGO_OFFICER)
  async collectBatchByCargoOfficer(
    @Payload() payload: { data: AssignOfficerForBatch },
  ): Promise<any> {
    console.log('collectBatchByCargoOfficer payload :', payload.data);

    return this.usecases.collectBatchByCargoOfficer(payload.data);
  }

  @UseGuards(PermissionGuard)
  @CheckPermission('Dispatch', PermissionActions.UPDATE)
  //   @Public()
  @MessagePattern(PATTERNS.DISPATCH_HAND_OVER_BATCHES_TO_AIRPORT)
  async handoverBatchesToAirport(
    @Payload() payload: { data: BatchHandoverDto },
  ): Promise<any> {
    console.log('handoverBatchesToAirport payload :', payload.data);

    return this.usecases.deliverBatchToAirport(payload.data);
  }

  @UseGuards(PermissionGuard)
  @CheckPermission('Dispatch', PermissionActions.UPDATE)
  //   @Public()
  @MessagePattern(PATTERNS.DISPATCH_COLLECT_FROM_AIRPORT)
  async collectFromAirport(@Payload() payload: { data: OrderScanTokenDto }): Promise<any> {
    console.log('collectFromAirport payload :', payload.data);
    return this.usecases.scanOrder(
      payload.data.scannedBy,
      payload.data.token,
    );
  }

  @UseGuards(PermissionGuard)
  @CheckPermission('Dispatch', PermissionActions.UPDATE)
  //   @Public()
  @MessagePattern(PATTERNS.DISPATCH_COMPARE_SCANNED_ORDERS)
  async comapreOrders(@Payload() payload: { officerId: string }): Promise<any> {
    console.log('comapreOrders payload :', payload);

    return this.usecases.compareOrders(payload.officerId);
  }

  @UseGuards(PermissionGuard)
  @CheckPermission('Dispatch', PermissionActions.CREATE)
  //   @Public()
  @MessagePattern(PATTERNS.DISPATCH_CONFIRM_ARRIVAL_AND_HANDOVER)
  async arriveAndInbound(
    @Payload() payload: { data: ConfirmBatchHandoverDto },
  ): Promise<any> {
    console.log('arriveAndInbound payload :', payload.data);

    return this.usecases.confirmHandover(payload.data);
  }

  @UseGuards(PermissionGuard)
  @CheckPermission('Dispatch', PermissionActions.CREATE)
  //   @Public()
  @MessagePattern(PATTERNS.DISPATCH_ASSIGN_DRIVER_FOR_DELIVERY)
  async assignDriverForDelivery(
    @Payload() payload: { data: AssignDriverForPickup },
  ): Promise<any> {
    console.log('assignDriverForDelivery payload :', payload.data);

    return this.usecases.assignDriverToOrder(payload.data);
  }

  @UseGuards(PermissionGuard)
  @CheckPermission('Dispatch', PermissionActions.CREATE)
  //   @Public()
  @MessagePattern(PATTERNS.DISPATCH_ACCEPT_LAST_MILE_DELIVERY)
  async lastMileDelivery(
    @Payload() payload: { data: LastMileDeliveryDto },
  ): Promise<any> {
    console.log('lastMileDelivery payload :', payload.data);

    return this.usecases.lastMileDelivery(
      payload.data.orderId,
      payload.data.driverId,
      payload.data.notes,
    );
  }

  @UseGuards(PermissionGuard)
  @CheckPermission('Dispatch', PermissionActions.CREATE)
  //   @Public()
  @MessagePattern(PATTERNS.DISPATCH_COMPLETE_DELIVERY)
  async completeDelivery(
    @Payload() payload: { data: CompleteDeliveryDto },
  ): Promise<any> {
    console.log('completeDelivery payload :', payload.data);
    return this.usecases.completeDelivery(
      payload.data.orderId,
      payload.data.driverId,
      payload.data.notes,
    );
  }

  @UseGuards(PermissionGuard)
  @CheckPermission('Dispatch', PermissionActions.DELETE)
  //   @Public()
  @MessagePattern(PATTERNS.DISPATCH_REMOVE_DRIVER_FROM_ORDER)
  async removeDriverFromOrder(
    @Payload() payload: { orderId: string },
  ): Promise<any> {
    console.log('removeDriverFromOrder payload :', payload);

    const result = await this.usecases.removeDriverFromOrder(payload.orderId);
    return IResponse.success('Driver removed successfully', result);
  }

  @UseGuards(PermissionGuard)
  @CheckPermission('Dispatch', PermissionActions.UPDATE)
  //   @Public()
  @MessagePattern(PATTERNS.DISPATCH_CHANGE_DRIVER_FOR_ORDER)
  async changeDriverForOrder(
    @Payload() payload: { data: AssignDriverForPickup },
  ): Promise<any> {
    console.log('changeDriverForOrder payload :', payload.data);
    const result = await this.usecases.changeDriverForOrder(payload.data);

    return IResponse.success('Driver changed successfully', result);
  }
}
