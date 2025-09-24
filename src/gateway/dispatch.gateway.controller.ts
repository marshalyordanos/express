import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PATTERNS } from '../contracts';
import {
  AssignDriverForBatch,
  AssignDriverForPickup,
  BatchDispatchDto,
} from '../fulfillment/dispatch/dispatch.entity';
import { DispatchStatus, ShippingScope, ServiceType } from '@prisma/client';

@Controller('dispatch')
export class DispatchGatewayController {
  constructor(
    @Inject('FULFILLMENT_SERVICE') private readonly dispatchClient: ClientProxy,
  ) {}

  @Post()
  async createDispatch() {}

  @Post('/assign-pickup')
  async assignDispatch(@Body() body: AssignDriverForPickup): Promise<any> {
    console.log('body: ', body);

    return this.dispatchClient.send(
      PATTERNS.DISPATCH_ASSIGN_DRIVER_FOR_PICKUP,
      body,
    );
  }

  @Post('/batch/assign-driver')
  async assignDriverToBatch(@Body() body: AssignDriverForBatch): Promise<any> {
    return this.dispatchClient.send(PATTERNS.DISPATCH_ASSIGN_DRIVER_TO_BATCH,body);
  }

  @Post('/batch')
  async createBatchDispatch(@Body() body: BatchDispatchDto): Promise<any> {
    console.log('body: ', body);

    return this.dispatchClient.send(
      PATTERNS.DISPATCH_APPROVE_CATEGORIZATION,
      body,
    );
  }

  @Patch('change-driver')
  async changeDriverForOrder(
    @Body() body: AssignDriverForPickup,
  ): Promise<any> {
    return this.dispatchClient.send(
      PATTERNS.DISPATCH_CHANGE_DRIVER_FOR_ORDER,
      body,
    );
  }

  @Delete('remove-driver/:orderId')
  async removeDriverFromOrder(@Param('orderId') orderId: string): Promise<any> {
    return this.dispatchClient.send(
      PATTERNS.DISPATCH_REMOVE_DRIVER_FROM_ORDER,
      orderId,
    );
  }

  @Get()
  async getAllDispatches(
    @Req() req: Request,
    @Query()
    filters: {
      status?: DispatchStatus;
      scope?: ShippingScope;
      serviceType?: ServiceType;
      fragile?: boolean;
      unusual?: boolean;
      search?: string; // for general search (batchCode, origin, destination, driverId, vehicleId)
      page?: number;
      pageSize?: number;
    },
  ) {
    const authHeader = req.headers['authorization'] || null;

    return this.dispatchClient.send(PATTERNS.DISPATCH_FIND_ALL, {
      filters,
      headers: { authorization: authHeader },
      page: filters.page ? Number(filters.page) : 1,
      pageSize: filters.pageSize ? Number(filters.pageSize) : 10,
    });
  }

  @Patch('/add-order/:batchId')
  async addOrderToBatch(@Param('batchId') batchId: string, @Body() body: any) {
    return this.dispatchClient.send(PATTERNS.DISPATCH_ADD_ORDERS_TO_BATCH,{
      batchId,
      newOrderIds: body.orders,
      // updateData: body.updateData
      body

    });
  }

  @Get(':id')
  async getDispatchById() {}

  @Get('/order/:id')
  async getDispatchByOrderId() {}

  @Get('/branch/:id')
  async getDispatchByBranchId() {}

  @Get('/staff/:id')
  async getDispatchByStaffId() {}

  @Get('/customer/:id')
  async getDispatchByCustomerId() {}

  @Get('/driver/:id')
  async getDispatchByDriverId() {}

  @Get('/vehicle/:id')
  async getDispatchByVehicleId() {}
}
