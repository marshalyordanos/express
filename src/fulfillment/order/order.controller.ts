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
    return IResponse.success('Order created and validated successfully by customer officer', result);
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
  async approveOrder(@Payload() payload: any){
    const orderId= payload.orderId;
    const reason= payload.reason;
    console.log("Order : ", orderId);
    
    const result= await this.orderUseCases.approveOrder(orderId, reason);
    return IResponse.success(`Order with id: ${orderId} approved by Operation Manager.`, result);
  }

  //COMPLETED
  @Public()
  @MessagePattern(PATTERNS.ORDER_FIND_FRAGILENT)
  async getFragileOrders(@Payload() payload: any) {
    const result = await this.orderUseCases.getFragileOrders(payload);
    return IResponse.success('Fragile Orders fetched successfully ', result);
  }

    //COMPLETED
  @Public()
  @MessagePattern(PATTERNS.ORDER_FIND_UNUSUAL)
  async getUnusualOrders(@Payload() payload: any) {
    const result = await this.orderUseCases.getUnusualOrders(payload);
    return IResponse.success('Unusuall Orders fetched successfully ', result);
  }

      //COMPLETED
  @Public()
  @MessagePattern(PATTERNS.ORDER_FIND_PENDING)
  async getPendingOrders(@Payload() payload: any) {
    const result = await this.orderUseCases.getPendingOrders(payload);
    return IResponse.success('Pending Orders for Validation fetched successfully ', result);
  }

      //COMPLETED
  @Public()
  @MessagePattern(PATTERNS.ORDER_FIND_PENDING_APPROVAL)
  async getPendingApprovalOrders(@Payload() payload: any) {
    const result = await this.orderUseCases.getPendingApprovalOrders(payload);
    return IResponse.success('Pending Orders for Approval fetched successfully ', result);
  }

        //COMPLETED
  @Public()
  @MessagePattern(PATTERNS.ORDER_FIND_PENDING_PICKUP)
  async getPendingPickupOrders(@Payload() payload: any) {
    const result = await this.orderUseCases.getPendingPickupOrders(payload);
    return IResponse.success('Pending Orders for PickUp fetched successfully ', result);
  }

   @Public()
  @MessagePattern(PATTERNS.ORDER_FIND_ALL)
  async getAllOrders(@Payload() payload: any) {
    const result = await this.orderUseCases.getAllOrders(payload);
    return IResponse.success('Orders fetched successfully', result);
  }

  @Public()
  @MessagePattern(PATTERNS.ORDER_FIND_BY_FULLFILLMENT)
  async getOrderByFullfillmentType(@Payload() payload: any) {
    const { type } = payload;
    console.log('Controller received fullfillment type:', type);
    console.log('Controller received fullfillment payload:', payload);

    const result = await this.orderUseCases.getOrderByFullfillmentType(
      type,
      payload,
    );
    return IResponse.success(
      `Orders fetched  successfully for fullfillment type ${type}.`,
      result,
    );
  }

  @Public()
  @MessagePattern(PATTERNS.ORDER_FIND_BY_ID)
  async getOrderById(id: string) {
    return this.orderUseCases.getOrderById(id);
  }

  @Public()
  @MessagePattern(PATTERNS.ORDER_UPDATE_STATUS)
  async updateOrderStatus(id: string, data: any) {
    return this.orderUseCases.updateOrderStatus(id, data);
  }

  @Public()
  @MessagePattern(PATTERNS.ORDER_FIND_BY_BRANCH)
  async getOrderByBranch(@Payload() payload: any) {
    const { id } = payload;
    console.log('Controller received branch id:', id);
    console.log('Controller received branch payload:', payload);
    const result = await this.orderUseCases.getOrderByBranch(id, payload);
    return IResponse.success(
      `Orders fetched  successfully for branch ${id}.`,
      result,
    );
  }

  @Public()
  @MessagePattern(PATTERNS.ORDER_FIND_BY_CUSTOMER)
  async getOrderByCustomer(@Payload() payload: any) {
    const { id } = payload;
    console.log('Controller received customer id:', id);
    console.log('Controller received customer payload:', payload);
    const result = await this.orderUseCases.getOrderByCustomer(id, payload);
    return IResponse.success(
      `Orders fetched  successfully for customer ${id}.`,
      result,
    );
  }

  @Public()
  @MessagePattern(PATTERNS.ORDER_FIND_BY_STATUS)
  async getOrderByStatus(@Payload() payload: any) {
    const { status } = payload;
    console.log('Controller received status status:', status);
    console.log('Controller received status payload:', payload);
    const result = await this.orderUseCases.getOrderByStatus(status, payload);
    return IResponse.success(
      `Orders fetched  successfully for status ${status}.`,
      result,
    );
  }

  @Public()
  @MessagePattern(PATTERNS.ORDER_FIND_BY_DRIVER)
  async getOrderByDriver(@Payload() payload: any) {
    const { id } = payload;
    console.log('Controller received driver id:', id);
    console.log('Controller received driver payload:', payload);
    const result = await this.orderUseCases.getOrderByDriver(id, payload);
    return IResponse.success(
      `Orders fetched  successfully for driver ${id}.`,
      result,
    );
  }

  @Public()
  @MessagePattern(PATTERNS.ORDER_FIND_BY_TYPE)
  async getOrderByType(@Payload() payload: any) {
    const { type } = payload;
    console.log('Controller received type:', type);
    console.log('Controller received payload:', payload);
    const result = await this.orderUseCases.getOrderByType(type, payload);
    return IResponse.success(
      `Orders fetched  successfully for service type ${type}.`,
      result,
    );
  }

  @Public()
  @MessagePattern(PATTERNS.ORDER_FIND_BY_PAYMENT)
  async getOrderByPayment(payment: string) {
    return this.orderUseCases.getOrderByPayment(payment);
  }

  @Public()
  @MessagePattern(PATTERNS.ORDER_FIND_BY_TRACK_CODE)
  async trackOrder(code: string) {
    return this.orderUseCases.trackOrder(code);
  }
}
