import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { Request } from 'express';

import { ClientProxy } from '@nestjs/microservices';
import { PATTERNS } from '../contracts';
import {
  CreateOrderDto,
  ValidateOrderDto,
} from '../fulfillment/order/order.entity';

@Controller('order')
export class OrderGatewayController {
  constructor(
    @Inject('FULFILLMENT_SERVICE') private readonly orderClient: ClientProxy,
  ) {}

  //Create order for customer
  @Post()
  async createOrder(@Body() data: CreateOrderDto) {
    return this.orderClient.send(PATTERNS.ORDER_CREATE, data);
  }
  
  @Post('/create-validate')
  async orderCreateValidate(@Body() data: ValidateOrderDto) {
    return this.orderClient.send(PATTERNS.ORDER_CREATE_AND_VALIDATE, data);
  }

  @Post('/accept')
  async acceptDropOffOrder(@Body() data: any) {
    return this.orderClient.send(PATTERNS.ORDER_ACCEPT_DROP_OFF, data);
  }

  @Post('/confirm')
  async confirmPickup(@Body() data: any) {
    return this.orderClient.send(PATTERNS.ORDER_CONFIRM_PICKUP, data);
  }

  @Patch('/validate/:id')
  async validateOrder(@Body() data: ValidateOrderDto, @Param('id') id: string) {
    console.log('data: ', data);

    return this.orderClient.send(PATTERNS.ORDER_VALIDATE, { id, data });
  }

  @Patch('/unusual/:orderId')
  async unusualOrder(@Body() data: any, @Param('orderId') orderId: string) {
    console.log('data: ', data);

    return this.orderClient.send(PATTERNS.ORDER_MARK_UNUSUAL, {
      orderId,
      data,
    });
  }

  @Post('/approve')
  async approveOrder(@Body() data: any) {
    return this.orderClient.send(PATTERNS.ORDER_APPROVE, data);
  }

  @Get()
  async getAllOrders(
    @Req() req: Request,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    const authHeader = req.headers['authorization'] || null;

    return this.orderClient.send(PATTERNS.ORDER_FIND_ALL, {
      headers: { authorization: authHeader },
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 10,
    });
  }

  @Get('/fullfillment/:type')
  async getOrderByFullfillment(
    @Param('type') type: string,
    @Req() req: Request,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    const authHeader = req.headers['authorization'] || null;
    return this.orderClient.send(PATTERNS.ORDER_FIND_BY_FULLFILLMENT, {
      type,
      headers: { authorization: authHeader },
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 10,
    });
  }

  @Get('/customer/:id')
  async getOrderByCustomer(
    @Param('id') id: string,
    @Req() req: Request,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    const authHeader = req.headers['authorization'] || null;

    return this.orderClient.send(PATTERNS.ORDER_FIND_BY_CUSTOMER, {
      id,
      headers: { authorization: authHeader },
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 10,
    });
  }
  @Get('/status/:status')
  async getOrderByStatus(
    @Param('status') status: string,
    @Req() req: Request,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    const authHeader = req.headers['authorization'] || null;
    return this.orderClient.send(PATTERNS.ORDER_FIND_BY_STATUS, {
      status,
      headers: { authorization: authHeader },
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 10,
    });
  }

  @Get('/branch/:id')
  async getOrderByBranch(
    @Param('id') id: string,
    @Req() req: Request,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    const authHeader = req.headers['authorization'] || null;
    return this.orderClient.send(PATTERNS.ORDER_FIND_BY_BRANCH, {
      id,
      headers: { authorization: authHeader },
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 10,
    });
  }
  @Get('/track/:code')
  async trackOrder(@Param('code') code: string) {
    return this.orderClient.send(PATTERNS.ORDER_FIND_BY_TRACK_CODE, code);
  }

  @Get('/driver/:id')
  async getOrderByDriver(
    @Param('id') id: string,
    @Req() req: Request,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    const authHeader = req.headers['authorization'] || null;
    return this.orderClient.send(PATTERNS.ORDER_FIND_BY_DRIVER, {
      id,
      headers: { authorization: authHeader },
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 10,
    });
  }

  @Get('/type/:type')
  async getOrderByType(
    @Param('type') type: string,
    @Req() req: Request,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    const authHeader = req.headers['authorization'] || null;
    return this.orderClient.send(PATTERNS.ORDER_FIND_BY_TYPE, {
      type,
      headers: { authorization: authHeader },
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 10,
    });
  }

  @Get('/payment/:payment')
  async getOrderByPayment(@Param('payment') payment: string) {
    return this.orderClient.send(PATTERNS.ORDER_FIND_BY_PAYMENT, payment);
  }

  @Get('fragile')
  async getFragileOrders(
    @Req() req: Request,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    console.log('getFragileOrders');

    const authHeader = req.headers['authorization'] || null;
    return this.orderClient.send(PATTERNS.ORDER_FIND_FRAGILENT, {
      headers: { authorization: authHeader },
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 10,
    });
  }

  @Get('unusual')
  async getUnusualOrders(
    @Req() req: Request,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    const authHeader = req.headers['authorization'] || null;
    return this.orderClient.send(PATTERNS.ORDER_FIND_UNUSUAL, {
      headers: { authorization: authHeader },
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 10,
    });
  }

  @Get('pending')
  async getPendingOrders(
    @Req() req: Request,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    const authHeader = req.headers['authorization'] || null;
    return this.orderClient.send(PATTERNS.ORDER_FIND_PENDING, {
      headers: { authorization: authHeader },
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 10,
    });
  }

  @Get('pending-approval')
  async getPendingApprovalOrders(
    @Req() req: Request,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    const authHeader = req.headers['authorization'] || null;
    return this.orderClient.send(PATTERNS.ORDER_FIND_PENDING_APPROVAL, {
      headers: { authorization: authHeader },
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 10,
    });
  }

  @Get('pending-pickup')
  async getPendingPickupOrders(
    @Req() req: Request,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    const authHeader = req.headers['authorization'] || null;
    return this.orderClient.send(PATTERNS.ORDER_FIND_PENDING_PICKUP, {
      headers: { authorization: authHeader },
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 10,
    });
  }
  @Patch(':id')
  async updateOrder(@Param('id') id: string, data: any) {
    return this.orderClient.send(PATTERNS.ORDER_UPDATE, { id, data });
  }

  @Patch('/status/:id')
  async updateOrderStatus(@Param('id') id: string, data: any) {
    return this.orderClient.send(PATTERNS.ORDER_UPDATE_STATUS, { id, data });
  }

  @Patch('/type/:type')
  async updateOrderType(@Param('type') type: string, data: any) {
    return this.orderClient.send(PATTERNS.ORDER_UPDATE_TYPE, { type, data });
  }

  @Patch('/driver/:id')
  async updateOrderDriver(@Param('id') id: string, data: any) {
    return this.orderClient.send(PATTERNS.ORDER_UPDATE_DRIVER, { id, data });
  }

  @Get(':id')
  async getOrder(@Param('id') id: string) {
    return this.orderClient.send(PATTERNS.ORDER_FIND_BY_ID, id);
  }
}
