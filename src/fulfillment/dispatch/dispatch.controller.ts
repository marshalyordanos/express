import { Controller, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { PATTERNS } from '../../contracts';
import { DispatchUseCasesImpl } from './dispatch.usecase.impl';
import {
  AssignDriverForPickup,
  AssignOfficerForBatch,
  BatchDispatchDto,
  BatchHandoverDto,
  CompleteDeliveryDto,
  ConfirmBatchHandoverDto,
  CreateDriver,
  GenerateQrDto,
  LastMileDeliveryDto,
  OrderScanTokenDto,
} from './dispatch.entity';
import { IResponse } from '../../common/types';
import { ListQueryDto } from '../../common/query/query.dto';
import { CheckPermission } from '../../common/decorator/check-permission.decorator';
import { PermissionGuard } from '../../common/permission.guard';
import {
  PermissionActions,
  ScopeAction,
} from '../../contracts/permission-actions.enum';
import { RateLimitGuard } from '../../common/rate-limit.guard';
import { stat } from 'fs';

@Controller()
export class DispatchMessageController {
  constructor(private readonly usecases: DispatchUseCasesImpl) {}

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Dispatch', PermissionActions.CREATE, ScopeAction.ASSIGN)
  @MessagePattern(PATTERNS.DISPATCH_ASSIGN_DRIVER_FOR_PICKUP)
  async assignDriverForPickup(
    @Payload() payoad: { data: AssignDriverForPickup; user: any },
  ): Promise<any> {
    const userId = payoad.user?.sub;
    return this.usecases.assignDriverForPickup(payoad.data, userId);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Dispatch', PermissionActions.CREATE)
  @MessagePattern(PATTERNS.DISPATCH_APPROVE_CATEGORIZATION)
  async createBatchDispatch(
    @Payload() payload: { data: BatchDispatchDto; user: any },
  ): Promise<any> {
    const userId = payload.user?.sub;
    const result = await this.usecases.createBatchDispatch(
      payload.data,
      userId,
    );
    return IResponse.success('Batch Dispatch created successfully', result);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Dispatch', PermissionActions.READ)
  @MessagePattern(PATTERNS.DISPATCH_FIND_ALL)
  async findDispatches(
    @Payload() payload: { query: ListQueryDto },
  ): Promise<any> {
    const result = await this.usecases.getBatches(payload.query);
    return IResponse.success('Batch Dispatch Fetched successfully', result);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Dispatch', PermissionActions.UPDATE)
  @MessagePattern(PATTERNS.DISPATCH_ADD_ORDERS_TO_BATCH)
  async addOrdersToBatch(
    @Payload()
    payload: {
      data: any;
      batchId: string;
      newOrderIds: string[];
      user: any;
    },
  ): Promise<any> {
    const { batchId, newOrderIds, data, user } = payload;
    const userId = user.sub;
    return this.usecases.addOrdersToBatch(batchId, newOrderIds, userId, data);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Dispatch', PermissionActions.CREATE, ScopeAction.ASSIGN)
  @MessagePattern(PATTERNS.DISPATCH_ASSIGN_OFFICER_TO_BATCH)
  async assignOfficerToBatch(
    @Payload() payload: { data: AssignOfficerForBatch; user: any },
  ): Promise<any> {
    const userId = payload.user?.sub;
    return this.usecases.confirmDispatch(payload.data, userId);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Dispatch', PermissionActions.UPDATE)
  @MessagePattern(PATTERNS.DISPATCH_COLLECT_BATCH_BY_CARGO_OFFICER)
  async collectBatchByCargoOfficer(
    @Payload() payload: { data: AssignOfficerForBatch; user: any },
  ): Promise<any> {
    const userId = payload.user?.sub;
    return this.usecases.collectBatchByCargoOfficer(payload.data, userId);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Dispatch', PermissionActions.UPDATE)
  @MessagePattern(PATTERNS.DISPATCH_HAND_OVER_BATCHES_TO_AIRPORT)
  async handoverBatchesToAirport(
    @Payload() payload: { data: BatchHandoverDto; user: any },
  ): Promise<any> {
    const userId = payload.user?.sub;
    return this.usecases.deliverBatchToAirport(payload.data, userId);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Dispatch', PermissionActions.UPDATE)
  @MessagePattern(PATTERNS.DISPATCH_COLLECT_FROM_AIRPORT)
  async collectFromAirport(
    @Payload() payload: { data: OrderScanTokenDto; user: any },
  ): Promise<any> {
    const userId = payload.user?.sub;
    return this.usecases.scanOrder(
      payload.data.scannedBy,
      payload.data.token,
      userId,
    );
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Dispatch', PermissionActions.UPDATE)
  @MessagePattern(PATTERNS.DISPATCH_COMPARE_SCANNED_ORDERS)
  async comapreOrders(
    @Payload() payload: { officerId: string; user: any },
  ): Promise<any> {
    const userId = payload.user?.sub;
    return this.usecases.compareOrders(payload.officerId, userId);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Dispatch', PermissionActions.UPDATE)
  @MessagePattern(PATTERNS.DISPATCH_CONFIRM_ARRIVAL_AND_HANDOVER)
  async arriveAndInbound(
    @Payload() payload: { data: ConfirmBatchHandoverDto },
  ): Promise<any> {
    return this.usecases.confirmHandover(payload.data);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Dispatch', PermissionActions.READ)
  @MessagePattern(PATTERNS.DISPATCH_FIND_DELIVERED_AND_ONGOING)
  async getDeliveredAndOnGoingDispatches(
    @Payload() payload: { user: any },
  ): Promise<any> {
    const userId = payload.user?.sub;
    return this.usecases.getDeliveredAndOnGoingDispatches(userId);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Dispatch', PermissionActions.CREATE, ScopeAction.ASSIGN)
  @MessagePattern(PATTERNS.DISPATCH_ASSIGN_DRIVER_FOR_DELIVERY)
  async assignDriverForDelivery(
    @Payload() payload: { data: AssignDriverForPickup; user: any },
  ): Promise<any> {
    const userId = payload.user?.sub;
    return this.usecases.assignDriverToOrder(payload.data, userId);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Dispatch', PermissionActions.CREATE, ScopeAction.DELIVERY)
  @MessagePattern(PATTERNS.DISPATCH_ACCEPT_LAST_MILE_DELIVERY)
  async lastMileDelivery(
    @Payload() payload: { data: LastMileDeliveryDto; user: any },
  ): Promise<any> {
    const userId = payload.user?.sub;
    return this.usecases.lastMileDelivery(
      payload.data.orderId,
      payload.data.driverId,
      userId,
      payload.data.notes,
    );
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Dispatch', PermissionActions.CREATE, ScopeAction.DELIVERY)
  @MessagePattern(PATTERNS.DISPATCH_COMPLETE_DELIVERY)
  async completeDelivery(
    @Payload() payload: { data: CompleteDeliveryDto; user: any },
  ): Promise<any> {
    const userId = payload.user?.sub;
    const result = await this.usecases.completeDelivery(payload.data, userId);
    return IResponse.success('Delivery completed successfully', result);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Dispatch', PermissionActions.DELETE)
  @MessagePattern(PATTERNS.DISPATCH_REMOVE_DRIVER_FROM_ORDER)
  async removeDriverFromOrder(
    @Payload() payload: { orderId: string },
  ): Promise<any> {
    const result = await this.usecases.removeDriverFromOrder(payload.orderId);
    return IResponse.success('Driver removed successfully', result);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Dispatch', PermissionActions.UPDATE, ScopeAction.APPROVE)
  @MessagePattern(PATTERNS.DISPATCH_CHANGE_DRIVER_FOR_ORDER)
  async changeDriverForOrder(
    @Payload() payload: { data: AssignDriverForPickup },
  ): Promise<any> {
    const result = await this.usecases.changeDriverForOrder(payload.data);
    return IResponse.success('Driver changed successfully', result);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Dispatch', PermissionActions.CREATE)
  @MessagePattern(PATTERNS.DISPATCH_GENERATE_QR_CODE)
  async generateQrCode(@Payload() payload: { data: GenerateQrDto }) {
    const result = await this.usecases.prepareQRCodes(payload.data);
    return IResponse.success('Qr code generated successfully', result);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Dispatch', PermissionActions.CREATE, ScopeAction.APPROVE)
  @MessagePattern(PATTERNS.DISPATCH_CREATE_DRIVER)
  async createDriver(@Payload() payload: { data: CreateDriver }) {
    const result = await this.usecases.createDriver(payload.data);
    return IResponse.success(
      'Driver with id [' +
        payload.data.userId +
        '] is successfully created for vehicle with id [' +
        payload.data.vehicleId +
        '].',
      result,
    );
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Dispatch', PermissionActions.READ)
  @MessagePattern(PATTERNS.DISPATCH_FIND_DRIVER)
  async findDriver(@Payload() payload: { query: ListQueryDto }) {
    const result = await this.usecases.findDriver(payload.query);
    return IResponse.success('Officer created successfully', result);
  }
}
