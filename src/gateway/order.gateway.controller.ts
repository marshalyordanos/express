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
  async createOrder(@Body() data: CreateOrderDto, @Req() req) {
    const authHeader = req.headers['authorization'] || null;
    return this.orderClient.send(PATTERNS.ORDER_CREATE, {
      data,
      headers: { authorization: authHeader },
    });
  }

  @Post('/create-validate')
  async orderCreateValidate(@Body() data: ValidateOrderDto, @Req() req) {
    const authHeader = req.headers['authorization'] || null;
    return this.orderClient.send(PATTERNS.ORDER_CREATE_AND_VALIDATE, {
      data,
      headers: { authorization: authHeader },
    });
  }

  @Post('/accept')
  async acceptDropOffOrder(@Body() data: any, @Req() req) {
    const authHeader = req.headers['authorization'] || null;
    return this.orderClient.send(PATTERNS.ORDER_ACCEPT_DROP_OFF, {
      data,
      headers: { authorization: authHeader },
    });
  }

  @Post('/confirm')
  async confirmPickup(@Body() data: any, @Req() req) {
    const authHeader = req.headers['authorization'] || null;
    return this.orderClient.send(PATTERNS.ORDER_CONFIRM_PICKUP, {
      data,
      headers: { authorization: authHeader },
    });
  }

  @Patch('/validate/:id')
  async validateOrder(
    @Body() data: ValidateOrderDto,
    @Param('id') id: string,
    @Req() req,
  ) {
    console.log('data: ', data);
    const authHeader = req.headers['authorization'] || null;

    return this.orderClient.send(PATTERNS.ORDER_VALIDATE, {
      id,
      data,
      headers: { authorization: authHeader },
    });
  }

  @Patch('/unusual/:orderId')
  async unusualOrder(
    @Body() data: any,
    @Param('orderId') orderId: string,
    @Req() req,
  ) {
    console.log('data: ', data);
    const authHeader = req.headers['authorization'] || null;

    return this.orderClient.send(PATTERNS.ORDER_MARK_UNUSUAL, {
      orderId,
      data,
      headers: { authorization: authHeader },
    });
  }

  @Post('/approve')
  async approveOrder(@Body() data: any, @Req() req) {
    const authHeader = req.headers['authorization'] || null;
    return this.orderClient.send(PATTERNS.ORDER_APPROVE, {
      data,
      headers: { authorization: authHeader },
    });
  }

  @Patch('/cancel')
  async cancelOrder(@Body() data: CancelOrderDto, @Req() req) {
    const authHeader = req.headers['authorization'] || null;
    return this.orderClient.send(PATTERNS.ORDER_CANCEL, {
      data,
      headers: { authorization: authHeader },
    });
  }

  @Post('/exception')
  async exceptionOrder(@Body() data: AddException, @Req() req) {
    const authHeader = req.headers['authorization'] || null;
    return this.orderClient.send(PATTERNS.ORDER_ADD_EXCEPTION, {
      data,
      headers: { authorization: authHeader },
    });
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
    @Req() req,
  ) {
    const authHeader = req.headers['authorization'] || null;
    return this.orderClient.send(PATTERNS.ORDER_REMOVE_EXCEPTION, {
      orderId,
      data,
      headers: { authorization: authHeader },
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
  async trackOrder(@Param('code') code: string, @Req() req) {
    const authHeader = req.headers['authorization'] || null;
    return this.orderClient.send(PATTERNS.ORDER_FIND_BY_TRACK_CODE, {
      code,
      headers: { authorization: authHeader },
    });
  }
  @Patch(':id')
  async updateOrder(
    @Param('id') id: string,
    @Body() data: UpdateOrderDto,
    @Req() req,
  ) {
    const authHeader = req.headers['authorization'] || null;
    return this.orderClient.send(PATTERNS.ORDER_UPDATE, {
      id,
      data,
      headers: { authorization: authHeader },
    });
  }

  @Get('/my-orders')
  async getMyOrders(@Req() req, @Query() query: ListQueryDto) {
    const authHeader = req.headers['authorization'] || null;
    return this.orderClient.send(PATTERNS.ORDER_FIND_MY_ORDERS, {
      headers: { authorization: authHeader },
      query,
    });
  }

  @Get(':id')
  async getOrder(@Param('id') id: string, @Req() req) {
    const authHeader = req.headers['authorization'] || null;
    return this.orderClient.send(PATTERNS.ORDER_FIND_BY_ID, {
      id,
      headers: { authorization: authHeader },
    });
  }
}
