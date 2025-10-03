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
import { query, Request } from 'express';

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
import { ListQueryDto } from '../common/query/query.dto';

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

  @Get('/exception')
  async getException(@Req() req, @Query() query: ListQueryDto) {
    const authHeader = req.headers['authorization'] || null;

    return this.orderClient.send(PATTERNS.ORDER_FIND_EXCEPTIONS, {
      headers: { authorization: authHeader },
      query,
    });
  }

  @Patch('/exception/:id')
  async updateException(
    @Body() data: UpdateOrderDto,
    @Param('id') orderId: string,
  ) {
    return this.orderClient.send(PATTERNS.ORDER_REMOVE_EXCEPTION, {
      orderId,
      data,
    });
  }

  // ✅ NEW unified GET endpoint with filters
  @Get()
  async getAllOrders(@Req() req, @Query() query: ListQueryDto) {
    const authHeader = req.headers['authorization'] || null;

    return this.orderClient.send(PATTERNS.ORDER_FIND_ALL, {
      headers: { authorization: authHeader },
      query,
    });
  }

  @Get('/approval/pending')
  async getPendingApprovalOrders(@Req() req, @Query() query: ListQueryDto) {
    const authHeader = req.headers['authorization'] || null;
    return this.orderClient.send(PATTERNS.ORDER_FIND_PENDING_APPROVAL, {
      headers: { authorization: authHeader },
      query,
    });
  }

  @Get('/status/log')
  async getOrderStatusLog(
    // @Query('orderId') orderId?: string,
    // @Query('staffId') staffId?: string,
    // @Query('search') search?: string,
    // @Query('page') page?: number,
    // @Query('pageSize') pageSize?: number,
    @Req() req,
    @Query() query: ListQueryDto,
  ) {
    const authHeader = req.headers['authorization'] || null;
    return this.orderClient.send(PATTERNS.ORDER_FIND_STATUS_LOG, {
      headers: { authorization: authHeader },
      query,
    });
  }

  @Get('/categorical')
  async getCategoricalOrders(@Req() req, @Query() query: ListQueryDto) {
    const authHeader = req.headers['authorization'] || null;

    console.log('authHeader: ', authHeader);

    return this.orderClient.send(PATTERNS.ORDER_FIND_CATEGORICAL, {
      headers: { authorization: authHeader },
      query,
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
