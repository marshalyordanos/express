import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PATTERNS } from 'src/contracts';
import { CreateOrderDto, ValidateOrderDto } from './order.entity';
import { Public } from 'src/common/decorator/public.decorator';
import { OrderUseCasesImpl } from './order.usecase.impl';
import { FulfillmentType, OrderStatus, ServiceType } from '@prisma/client'; // assuming you use Prisma enums
import { IResponse } from 'src/common/types';
import { log } from 'util';

@Controller()
export class OrderMessageController {
  constructor(private readonly orderUseCases: OrderUseCasesImpl) {}

  //COMPLETED
  @Public()
  @MessagePattern(PATTERNS.ORDER_CREATE)
  async createOrder(data: CreateOrderDto) {
    const result = await this.orderUseCases.createOrder(data);
    return IResponse.success('Order created successfully', result);
  }

  @Public()
  @MessagePattern(PATTERNS.ORDER_CREATE_AND_VALIDATE)
  async createOrderAndValidate(data: ValidateOrderDto) {
    const result = await this.orderUseCases.createOrder(data);
    return IResponse.success(
      'Order created and validated successfully by customer officer',
      result,
    );
  }
  //COMPLETED
  @Public()
  @MessagePattern(PATTERNS.ORDER_ACCEPT_DROP_OFF)
  async acceptDropOffOrder(data: any) {
    console.log('data: ', data);
    const trackingCode = data?.trackingCode;
    console.log('trackingCode: ', trackingCode);

    const result = await this.orderUseCases.acceptDropOff(trackingCode);
    return IResponse.success('Drop Off Order accepted successfully', result);
  }

  //COMPLETED
  @Public()
  @MessagePattern(PATTERNS.ORDER_CONFIRM_PICKUP)
  async confirmPickup(data: any) {
    const { orderId, driverId } = data;
    const result = await this.orderUseCases.confirmPickupOrder(
      orderId,
      driverId,
    );
    return IResponse.success('Pick Up Order Confirmed successfully', result);
  }

  //COMPLETED
  @Public()
  @MessagePattern(PATTERNS.ORDER_VALIDATE)
  async validateOrder(@Payload() payload: any) {
    const { id, data } = payload;
    const { officerId, updates } = data;
    console.log('Orderid and officerId', id, officerId);
    console.log('updates', updates);
    console.log('data', data);
    const result = await this.orderUseCases.validateOrder(id, data);
    return IResponse.success('Order validated successfully', result);
  }

  //COMPLETED
  @Public()
  @MessagePattern(PATTERNS.ORDER_MARK_UNUSUAL)
  async markUnusualOrder(@Payload() payload: any) {
    const { orderId, data } = payload;
    const result = await this.orderUseCases.markUnusualOrder(orderId, data);
    return IResponse.success('Order Marked as Unusual successfully', result);
  }

  @Public()
  @MessagePattern(PATTERNS.ORDER_APPROVE)
  async approveOrder(@Payload() payload: any) {
    const orderId = payload.orderId;
    const reason = payload.reason;
    console.log('Order : ', orderId);

    const result = await this.orderUseCases.approveOrder(orderId, reason);
    return IResponse.success(
      `Order with id: ${orderId} approved by Operation Manager.`,
      result,
    );
  }

  //COMPLETED
  @Public()
  @MessagePattern(PATTERNS.ORDER_FIND_CATEGORICAL)
  async getOrdersGroupedByScope(@Payload() payload: any) {
    const result = await this.orderUseCases.getOrdersGroupedByScope(payload);
    return IResponse.success('Dangerous Orders fetched successfully ', result);
  }

  //COMPLETED
  @Public()
  @MessagePattern(PATTERNS.ORDER_FIND_ALL)
  async getAllOrders(@Payload() payload: any) {
    // payload contains: filters, headers, page, pageSize
    const { filters, page, pageSize } = payload;
    const result = await this.orderUseCases.getAllOrders({
      filters,
      page,
      pageSize,
    });
    return IResponse.success('Orders fetched successfully', result);
  }
  
  @Public()
  @MessagePattern(PATTERNS.ORDER_FIND_STATUS_LOG)
  async getOrdersStatusLog(data: any){
    const result= await this.orderUseCases.getOrderStatusLog(data);
    return IResponse.success('Orders Log with status fetched successfully', result);
  }

  @Public()
  @MessagePattern(PATTERNS.ORDER_FIND_BY_ID)
  async getOrderById(id: string) {
    const result= await this.orderUseCases.getOrderById(id);
    return IResponse.success('Order fetched successfully', result);
  }

  @Public()
  @MessagePattern(PATTERNS.ORDER_UPDATE_STATUS)
  async updateOrderStatus(id: string, data: any) {
    return this.orderUseCases.updateOrderStatus(id, data);
  }

  @Public()
  @MessagePattern(PATTERNS.ORDER_FIND_BY_TRACK_CODE)
  async trackOrder(code: string) {
    return this.orderUseCases.trackOrder(code);
  }
}
