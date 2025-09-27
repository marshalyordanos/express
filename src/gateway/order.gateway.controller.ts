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
  AddException,
  CancelOrderDto,
  CreateOrderDto,
  UpdateOrderDto,
  ValidateOrderDto,
} from '../fulfillment/order/order.entity';
import { OrderStatus, ServiceType } from '@prisma/client';

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

  @Patch('/cancel')
  async cancelOrder(@Body() data: CancelOrderDto) {
    return this.orderClient.send(PATTERNS.ORDER_CANCEL, data);
  }

  @Post('/exception')
  async exceptionOrder(@Body() data: AddException) {
    return this.orderClient.send(PATTERNS.ORDER_ADD_EXCEPTION, data);
  }

  // ✅ NEW unified GET endpoint with filters
  @Get()
  async getAllOrders(
    @Req() req: Request,
    @Query()
    filters: {
      fragile?: boolean;
      unusual?: boolean;
      pending?: boolean;
      pendingApproval?: boolean;
      pendingPickup?: boolean;
      branchId?: string;
      customerId?: string;
      status?: OrderStatus;
      driverId?: string;
      serviceType?: ServiceType;
      payment?: string;
      fulfillmentType?: string;
      page?: number;
      pageSize?: number;
    },
  ) {
    const authHeader = req.headers['authorization'] || null;

    return this.orderClient.send(PATTERNS.ORDER_FIND_ALL, {
      filters,
      headers: { authorization: authHeader },
      page: filters.page ? Number(filters.page) : 1,
      pageSize: filters.pageSize ? Number(filters.pageSize) : 10,
    });
  }

 @Get('/approval/pending')
  async getPendingApprovalOrders(
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number
  ) {
    return this.orderClient.send(PATTERNS.ORDER_FIND_PENDING_APPROVAL, {
      search: search ,
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 10
    });
  }


  @Get('/status/log')
  async getOrderStatusLog(
    @Query('orderId') orderId?: string,
    @Query('staffId') staffId?: string,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number
  ) {
    return this.orderClient.send(PATTERNS.ORDER_FIND_STATUS_LOG, {
      orderId: orderId ,
      updatedBy: staffId,
      search: search ,
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 10
    });
  }

  @Get('/categorical')
  async getCategoricalOrders(
    @Req() req: Request,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    const authHeader = req.headers['authorization'] || null;

    console.log('authHeader: ', authHeader);

    return this.orderClient.send(PATTERNS.ORDER_FIND_CATEGORICAL, {
      headers: { authorization: authHeader },
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 10,
    });
  }

  @Get('/track/:code')
  async trackOrder(@Param('code') code: string) {
    return this.orderClient.send(PATTERNS.ORDER_FIND_BY_TRACK_CODE, code);
  }
  @Patch(':id')
  async updateOrder(@Param('id') id: string, @Body() data: UpdateOrderDto) {
    return this.orderClient.send(PATTERNS.ORDER_UPDATE, { id, data });
  }

  @Get(':id')
  async getOrder(@Param('id') id: string) {
    return this.orderClient.send(PATTERNS.ORDER_FIND_BY_ID, id);
  }
}
