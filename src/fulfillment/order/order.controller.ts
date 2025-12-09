import { Controller, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PATTERNS } from '../../contracts';
import {
  AcceptDropOffDto,
  AddException,
  AddOrderOnHold,
  ApproveOrderDto,
  CancelOrderDto,
  ConfirmPickUpOrderDto,
  CreateOrderDto,
  MarkUnusualOrderDto,
  RemoveOrderFromOnHold,
  UpdateOrderDto,
  ValidateOrderDto,
} from './order.entity';
import { OrderUseCasesImpl } from './order.usecase.impl';
import { IResponse } from '../../common/types';
import { ListQueryDto } from '../../common/query/query.dto';
import { CheckPermission } from '../../common/decorator/check-permission.decorator';
import { PermissionGuard } from '../../common/permission.guard';
import {
  PermissionActions,
  ScopeAction,
} from '../../contracts/permission-actions.enum';
import { RateLimitGuard } from '../../common/rate-limit.guard';
import { Public } from '../../common/decorator/public.decorator';
import { query } from 'express';

@Controller()
export class OrderMessageController {
  constructor(private readonly orderUseCases: OrderUseCasesImpl) {}

  //COMPLETED
  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Order', PermissionActions.CREATE)
  @MessagePattern(PATTERNS.ORDER_CREATE)
  async createOrder(@Payload() payload: { data: CreateOrderDto; user: any }) {
    const userId = payload.user?.sub;
    const result = await this.orderUseCases.createOrder(payload.data, userId);
    return IResponse.success('Order created successfully', result);
  }

  @Public()
  @MessagePattern(PATTERNS.ORDER_CREATE_NOT_LOGGED_IN_CUSTOMER)
  async createUserOrder(@Payload() payload: { data: CreateOrderDto }) {
    const result = await this.orderUseCases.createUserOrder(payload.data);
    return IResponse.success('Order created successfully.', result);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Order', PermissionActions.READ)
  @MessagePattern(PATTERNS.ORDER_MANIFEST)
  async getOrderManifest(
    @Payload() payload: { user: any; query: ListQueryDto },
  ) {
    const userId = payload.user?.sub;
    const result = await this.orderUseCases.getOrderManifest(
      payload.query,
      userId,
    );
    return IResponse.success('Order Manifest Fetched successfully.', result);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Order', PermissionActions.READ)
  @MessagePattern(PATTERNS.ORDER_ONGOING_AND_DELIVERED)
  async getOngoingAndDeliveredOrders(
    @Payload() payload: { user: any; query: ListQueryDto },
  ) {
    const userId = payload.user?.sub;
    const result = await this.orderUseCases.getOngoingAndDeliveredOrders(
      payload.query,
      userId,
    );
    return IResponse.success(
      'Order Ongoing and Delivered Fetched successfully.',
      result,
    );
  }

  //COMPLETED
  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Order', PermissionActions.UPDATE, ScopeAction.FULL)
  @MessagePattern(PATTERNS.ORDER_ACCEPT_DROP_OFF)
  async acceptDropOffOrder(
    @Payload() payload: { data: AcceptDropOffDto; user: any },
  ) {
    console.log('data: ', payload.data);
    const trackingCode = payload.data?.trackingCode;
    console.log('trackingCode: ', trackingCode);
    const userId = payload.user?.sub;

    const result = await this.orderUseCases.acceptDropOff(trackingCode);
    return IResponse.success('Drop Off Order accepted successfully', result);
  }

  //COMPLETED
  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Order', PermissionActions.UPDATE, ScopeAction.DELIVERY)
  @MessagePattern(PATTERNS.ORDER_CONFIRM_PICKUP)
  async confirmPickup(
    @Payload() payload: { data: ConfirmPickUpOrderDto; user: any },
  ) {
    const userId = payload.user?.sub;
    const result = await this.orderUseCases.confirmPickupOrder(
      payload.data,
      userId,
    );
    return IResponse.success('Pick Up Order Confirmed successfully', result);
  }

  //COMPLETED
  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Order', PermissionActions.UPDATE, ScopeAction.FULL)
  @MessagePattern(PATTERNS.ORDER_VALIDATE)
  async validateOrder(
    @Payload() payload: { data: any; id: string; user: any },
  ) {
    const { id, data } = payload;
    const userId = payload.user?.sub;
    const { officerId, updates } = payload.data;
    const result = await this.orderUseCases.validateOrder(id, data, userId);
    return IResponse.success('Order validated successfully', result);
  }

  //COMPLETED
  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Order', PermissionActions.UPDATE)
  @MessagePattern(PATTERNS.ORDER_MARK_UNUSUAL)
  async markUnusualOrder(
    @Payload() payload: { orderId: string; data: MarkUnusualOrderDto },
  ) {
    const { orderId, data } = payload;
    const result = await this.orderUseCases.markUnusualOrder(
      payload.orderId,
      payload.data,
    );
    return IResponse.success('Order Marked as Unusual successfully', result);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Order', PermissionActions.UPDATE)
  @MessagePattern(PATTERNS.ORDER_UPDATE)
  async updateOrder(
    @Payload() payload: { id: string; data: UpdateOrderDto; user: any },
  ) {
    const userId = payload.user?.sub;
    const result = await this.orderUseCases.updateOrder(
      payload.id,
      payload.data,
      userId,
    );
    return IResponse.success('Order updated successfully', result);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Order', PermissionActions.UPDATE, ScopeAction.APPROVE)
  @MessagePattern(PATTERNS.ORDER_APPROVE)
  async approveOrder(@Payload() payload: { data: ApproveOrderDto; user: any }) {
    const orderId = payload.data.orderId;
    const reason = payload.data.reason;
    console.log('Order : ', orderId);
    const userId = payload.user?.sub;

    const result = await this.orderUseCases.approveOrder(
      orderId,
      reason,
      userId,
    );
    return IResponse.success(
      `Order with id: ${orderId} approved by Operation Manager.`,
      result,
    );
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Order', PermissionActions.READ)
  @MessagePattern(PATTERNS.ORDER_FIND_SORTING)
  async getOrderForSorting(@Payload() payload: { user: any }) {
    const userId = payload.user?.sub;

    const result = await this.orderUseCases.getOrderForSorting(userId);
    return IResponse.success(`Order fetched for sorting.`, result);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Order', PermissionActions.UPDATE)
  @MessagePattern(PATTERNS.ORDER_CANCEL)
  async cancelOrder(@Payload() payload: { data: CancelOrderDto; user: any }) {
    console.log('payload: ', payload);
    const { data } = payload;
    const orderId = data.orderId;
    const userId = payload.user?.sub;
    const result = await this.orderUseCases.cancelOrder(data, userId);
    return IResponse.success(`Order with id: ${orderId} cancelled.`, result);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Order', PermissionActions.READ, ScopeAction.APPROVE)
  @MessagePattern(PATTERNS.ORDER_FIND_PENDING_APPROVAL)
  async getPendingApproval(@Payload() payload: { query: ListQueryDto }) {
    const result = await this.orderUseCases.getPendingApproval(payload.query);
    return IResponse.success(
      `Order pending for approval fetched successfully.`,
      result.approvals,
      result.pagination,
    );
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Order', PermissionActions.CREATE, ScopeAction.FULL)
  @MessagePattern(PATTERNS.ORDER_ADD_EXCEPTION)
  async addException(@Payload() payload: { data: AddException; user: any }) {
    const orderId = payload.data.orderId;
    const userId = payload.user?.sub;
    const result = await this.orderUseCases.addException(payload.data, userId);
    return IResponse.success(
      `Order with id: ${orderId} Added to Exception successfully.`,
      result,
    );
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Order', PermissionActions.READ)
  @MessagePattern(PATTERNS.ORDER_FIND_EXCEPTIONS)
  async getException(@Payload() payload: { query: ListQueryDto }) {
    const result = await this.orderUseCases.getException(payload.query);
    return IResponse.success(
      `Order Exception fetched successfully.`,
      result.orders,
      result.pagination,
    );
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Order', PermissionActions.UPDATE, ScopeAction.FULL)
  @MessagePattern(PATTERNS.ORDER_REMOVE_EXCEPTION)
  async solveExceptions(
    @Payload() payload: { data: UpdateOrderDto; orderId: string; user: any },
  ) {
    const { orderId, data } = payload;
    const userId = payload.user?.sub;
    const result = await this.orderUseCases.solveExceptions(
      orderId,
      data,
      userId,
    );
    return IResponse.success(`Order exception resolved successfully.`, result);
  }

  //COMPLETED
  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Order', PermissionActions.READ, ScopeAction.FULL)
  @MessagePattern(PATTERNS.ORDER_FIND_CATEGORICAL)
  async getOrdersGroupedByScope(@Payload() payload: { query: ListQueryDto }) {
    const result = await this.orderUseCases.getOrdersGroupedByScope(
      payload.query,
    );
    return IResponse.success(
      'Categorization Orders fetched successfully ',
      result,
    );
  }

  //COMPLETED
  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Order', PermissionActions.READ, ScopeAction.FULL)
  @MessagePattern(PATTERNS.ORDER_FIND_ALL)
  async getAllOrders(@Payload() payload: { query: ListQueryDto }) {
    const result = await this.orderUseCases.getAllOrders(payload.query);
    return IResponse.success(
      'Orders fetched successfully',
      result.orders,
      result.pagination,
    );
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Order', PermissionActions.READ, ScopeAction.FULL)
  @MessagePattern(PATTERNS.ORDER_FIND_STATUS_LOG)
  async getOrdersStatusLog(@Payload() payload: { query: ListQueryDto }) {
    const result = await this.orderUseCases.getOrderStatusLog(payload.query);
    return IResponse.success(
      'Orders Log with status fetched successfully',
      result.orders,
      result.pagination,
    );
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Order', PermissionActions.READ)
  @MessagePattern(PATTERNS.ORDER_FIND_BY_ID)
  async getOrderById(@Payload() payload: { id: string }) {
    const result = await this.orderUseCases.getOrderById(payload.id);
    return IResponse.success('Order fetched successfully', result);
  }

  @UseGuards(RateLimitGuard)
  @Public()
  @MessagePattern(PATTERNS.ORDER_FIND_BY_TRACK_CODE)
  async trackOrder(@Payload() payload: { code: string }) {
    const result = await this.orderUseCases.trackOrder(payload.code);
    return IResponse.success('Order Tracking fetched successfully', result);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Order', PermissionActions.READ)
  @MessagePattern(PATTERNS.ORDER_FIND_BY_USER_AND_TRACK_CODE)
  async trackUserOrder(@Payload() payload: { code: string; user: any }) {
    const userId = payload.user?.sub;
    const result = await this.orderUseCases.trackUserOrder(
      payload.code,
      userId,
    );
    return IResponse.success('Order Tracking fetched successfully', result);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Order', PermissionActions.READ)
  @MessagePattern(PATTERNS.ORDER_FIND_MY_ORDERS)
  async getMyOrders(@Payload() payload: { query: ListQueryDto; user: any }) {
    const user = payload.user;
    const userId = user.sub;
    const result = await this.orderUseCases.getMyOrders(userId, payload.query);
    return IResponse.success(
      'Orders fetched successfully',
      result.orders,
      result.pagination,
    );
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Order', PermissionActions.CREATE)
  @MessagePattern(PATTERNS.ORDER_ADD_ON_HOLD)
  async addOrderOnHold(
    @Payload() payload: { data: AddOrderOnHold; user: any },
  ) {
    const user = payload.user;
    const userId = user.sub;
    const result = await this.orderUseCases.addOnHold(
      payload.data.orderIds,
      payload.data.reason,
      userId,
    );
    return IResponse.success('Orders added on hold successfully', result);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Order', PermissionActions.UPDATE)
  @MessagePattern(PATTERNS.ORDER_REMOVE_ON_HOLD)
  async RemoveOrderFromOnHold(
    @Payload() payload: { data: RemoveOrderFromOnHold; user: any },
  ) {
    const user = payload.user;
    const userId = user.sub;
    const result = await this.orderUseCases.removeOnHold(
      payload.data.orderIds,
      userId,
    );
    return IResponse.success(
      'Orders removed from on hold successfully',
      result,
    );
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Order', PermissionActions.READ)
  @MessagePattern(PATTERNS.ORDER_FIND_ON_HOLD)
  async getOnHoldOrders(@Payload() payload: { user: any }) {
    const user = payload.user;
    const userId = user.sub;
    const result = await this.orderUseCases.getOnHoldOrders(userId);
    return IResponse.success(
      'Orders removed from on hold successfully',
      result,
    );
  }
}

//
