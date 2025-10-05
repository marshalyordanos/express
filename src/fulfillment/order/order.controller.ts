import { Controller, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PATTERNS } from '../../contracts';
import {
  AddException,
  CancelOrderDto,
  CreateOrderDto,
  UpdateOrderDto,
  ValidateOrderDto,
} from './order.entity';
import { Public } from '../../common/decorator/public.decorator';
import { OrderUseCasesImpl } from './order.usecase.impl';
import { FulfillmentType, OrderStatus, ServiceType } from '@prisma/client'; // assuming you use Prisma enums
import { IResponse } from '../../common/types';
import { log } from 'util';
import { ListQueryDto } from '../../common/query/query.dto';
import { CheckPermission } from '../../common/decorator/check-permission.decorator';
import { PermissionGuard } from '../../common/permission.guard';
import { PermissionActions } from '../../contracts/permission-actions.enum';

@Controller()
export class OrderMessageController {
  constructor(private readonly orderUseCases: OrderUseCasesImpl) {}

  //COMPLETED
  @UseGuards(PermissionGuard)
  @CheckPermission('Order', PermissionActions.CREATE)
  // @Public()
  @MessagePattern(PATTERNS.ORDER_CREATE)
  async createOrder(@Payload() payload:{data: CreateOrderDto}) {
    const result = await this.orderUseCases.createOrder(payload.data);
    return IResponse.success('Order created successfully', result);
  }

  @UseGuards(PermissionGuard)
  @CheckPermission('Order', PermissionActions.CREATE)
  // @Public()
  @MessagePattern(PATTERNS.ORDER_CREATE_AND_VALIDATE)
  async createOrderAndValidate(@Payload() payload: {data: ValidateOrderDto}) {
    const result = await this.orderUseCases.createOrder(payload.data);
    return IResponse.success(
      'Order created and validated successfully by customer officer',
      result,
    );
  }
  //COMPLETED
  @UseGuards(PermissionGuard)
  @CheckPermission('Order', PermissionActions.UPDATE)
  // @Public()
  @MessagePattern(PATTERNS.ORDER_ACCEPT_DROP_OFF)
  async acceptDropOffOrder(@Payload() payload: {data: any}) {
    console.log('data: ', payload.data);
    const trackingCode = payload.data?.trackingCode;
    console.log('trackingCode: ', trackingCode);

    const result = await this.orderUseCases.acceptDropOff(trackingCode);
    return IResponse.success('Drop Off Order accepted successfully', result);
  }

  //COMPLETED
  @UseGuards(PermissionGuard)
  @CheckPermission('Order', PermissionActions.UPDATE)
  // @Public()
  @MessagePattern(PATTERNS.ORDER_CONFIRM_PICKUP)
  async confirmPickup(@Payload() payload:{data: any}) {
    const { orderId, driverId } = payload.data;
    const result = await this.orderUseCases.confirmPickupOrder(
      orderId,
      driverId,
    );
    return IResponse.success('Pick Up Order Confirmed successfully', result);
  }

  //COMPLETED
  @UseGuards(PermissionGuard)
  @CheckPermission('Order', PermissionActions.UPDATE)
  // @Public()
  @MessagePattern(PATTERNS.ORDER_VALIDATE)
  async validateOrder(@Payload() payload: {data: any, id: string}) {
    const { id, data } = payload;
    const { officerId, updates } = payload.data;
    console.log('Orderid and officerId', id, officerId);
    console.log('updates', updates);
    console.log('data', data);
    const result = await this.orderUseCases.validateOrder(id, data);
    return IResponse.success('Order validated successfully', result);
  }

  //COMPLETED
  @UseGuards(PermissionGuard)
  @CheckPermission('Order', PermissionActions.UPDATE)
  // @Public()
  @MessagePattern(PATTERNS.ORDER_MARK_UNUSUAL)
  async markUnusualOrder(@Payload() payload: {orderId: string, data: any}) {
    const { orderId, data } = payload;
    console.log('payload: ', payload);
    console.log('orderId: ', orderId);
    console.log('data: ', data);
    
    const result = await this.orderUseCases.markUnusualOrder(payload.orderId, payload.data);
    return IResponse.success('Order Marked as Unusual successfully', result);
  }

  @UseGuards(PermissionGuard)
  @CheckPermission('Order', PermissionActions.UPDATE)
  // @Public()
  @MessagePattern(PATTERNS.ORDER_UPDATE)
  async updateOrder(@Payload() payload: { id: string; data: UpdateOrderDto }) {
    const result = await this.orderUseCases.updateOrder(
      payload.id,
      payload.data,
    );
    return IResponse.success('Order updated successfully', result);
  }

  @UseGuards(PermissionGuard)
  @CheckPermission('Order', PermissionActions.UPDATE)
  // @Public()
  @MessagePattern(PATTERNS.ORDER_APPROVE)

  async approveOrder(@Payload() payload: {data: any}) {
    const orderId = payload.data.orderId;
    const reason = payload.data.reason;
    console.log('Order : ', orderId);

    const result = await this.orderUseCases.approveOrder(orderId, reason);
    return IResponse.success(
      `Order with id: ${orderId} approved by Operation Manager.`,
      result,
    );
  }

  @UseGuards(PermissionGuard)
  @CheckPermission('Order', PermissionActions.UPDATE)
  // @Public()
  @MessagePattern(PATTERNS.ORDER_CANCEL)
  async cancelOrder(@Payload() payload: { data: CancelOrderDto; headers: any }) {
    console.log('payload: ', payload);
const { data } = payload;
    const orderId = data.orderId;
    const result = await this.orderUseCases.cancelOrder(data);
    return IResponse.success(`Order with id: ${orderId} cancelled.`, result);
  }

  @UseGuards(PermissionGuard)
  @CheckPermission('Order', PermissionActions.READ)
  // @Public()
  @MessagePattern(PATTERNS.ORDER_FIND_PENDING_APPROVAL)
  async getPendingApproval(@Payload() payload: { query: ListQueryDto }) {
    const result = await this.orderUseCases.getPendingApproval(payload.query);
    return IResponse.success(
      `Order pending for approval fetched successfully.`,
      result.approvals,
      result.pagination,
    );
  }

  @UseGuards(PermissionGuard)
  @CheckPermission('Order', PermissionActions.CREATE)
  // @Public()
  @MessagePattern(PATTERNS.ORDER_ADD_EXCEPTION)
  async addException(@Payload() payload: {data: AddException}) {
    const orderId = payload.data.orderId;
    const result = await this.orderUseCases.addException(payload.data);
    return IResponse.success(
      `Order with id: ${orderId} Added to Exception successfully.`,
      result,
    );
  }

  @UseGuards(PermissionGuard)
  @CheckPermission('Order', PermissionActions.READ)
  // @Public()
  @MessagePattern(PATTERNS.ORDER_FIND_EXCEPTIONS)
  async getException(@Payload() payload: { query: ListQueryDto }) {
    const result = await this.orderUseCases.getException(payload.query);
    return IResponse.success(
      `Order Exception fetched successfully.`,
      result.orders,
      result.pagination,
    );
  }

  @UseGuards(PermissionGuard)
  @CheckPermission('Order', PermissionActions.UPDATE)
  // @Public()
  @MessagePattern(PATTERNS.ORDER_REMOVE_EXCEPTION)
  async solveExceptions(@Payload() payload: {data: UpdateOrderDto, orderId: string}) {
    const { orderId, data } = payload;
    const result = await this.orderUseCases.solveExceptions(orderId, data);
    return IResponse.success(`Order exception resolved successfully.`, result);
  }

  //COMPLETED
  @UseGuards(PermissionGuard)
  @CheckPermission('Order', PermissionActions.READ)
  // @Public()
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
  @UseGuards(PermissionGuard)
  @CheckPermission('Order', PermissionActions.READ)
  // @Public()
  @MessagePattern(PATTERNS.ORDER_FIND_ALL)
  async getAllOrders(@Payload() payload: { query: ListQueryDto }) {
    const result = await this.orderUseCases.getAllOrders(payload.query);
    return IResponse.success(
      'Orders fetched successfully',
      result.orders,
      result.pagination,
    );
  }

  @UseGuards(PermissionGuard)
  @CheckPermission('Order', PermissionActions.READ)
  // @Public()
  @MessagePattern(PATTERNS.ORDER_FIND_STATUS_LOG)
  async getOrdersStatusLog(@Payload() payload: { query: ListQueryDto }) {
    const result = await this.orderUseCases.getOrderStatusLog(payload.query);
    return IResponse.success(
      'Orders Log with status fetched successfully',
      result.orders,
      result.pagination,
    );
  }

  @UseGuards(PermissionGuard)
  @CheckPermission('Order', PermissionActions.READ)
  // @Public()
  @MessagePattern(PATTERNS.ORDER_FIND_BY_ID)
  async getOrderById(@Payload() payload: { id: string }) {
    const result = await this.orderUseCases.getOrderById(payload.id);
    return IResponse.success('Order fetched successfully', result);
  }

  @UseGuards(PermissionGuard)
  @CheckPermission('Order', PermissionActions.READ)
  // @Public()
  @MessagePattern(PATTERNS.ORDER_FIND_BY_TRACK_CODE)
  async trackOrder(@Payload() payload: { code: string }) {
    return this.orderUseCases.trackOrder(payload.code);
  }
}
