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
  AssignDriverForPickup,
  AssignOfficerForBatch,
  BatchDispatchDto,
  BatchHandoverDto,
  CompleteDeliveryDto,
  LastMileDeliveryDto,
} from '../fulfillment/dispatch/dispatch.entity';
import { DispatchStatus, ShippingScope, ServiceType } from '@prisma/client';

@Controller('dispatch')
export class DispatchGatewayController {
  constructor(
    @Inject('FULFILLMENT_SERVICE') private readonly dispatchClient: ClientProxy,
  ) {}

  @Post()
  async createDispatch() {}

  // Controller used for assigning driver for the pick up of the package from the customer
  @Post('/assign-pickup')
  async assignDispatch(@Body() body: AssignDriverForPickup): Promise<any> {
    console.log('body: ', body);
    return this.dispatchClient.send(
      PATTERNS.DISPATCH_ASSIGN_DRIVER_FOR_PICKUP,
      body,
    );
  }

  //Controller used for assigning a cargo officer for batched orders to give them for airport
  @Post('/batch/assign-officer')
  async assignOfficerToBatch(@Body() body: AssignOfficerForBatch): Promise<any> {
    return this.dispatchClient.send(
      PATTERNS.DISPATCH_ASSIGN_OFFICER_TO_BATCH,
      body,
    );
  }

  //COntroller used for accepting dispatch from the operation manager and it is done by cargo officer
  @Post('/accept-batch')
  async acceptDispatch(@Body() body: AssignOfficerForBatch): Promise<any> {
    return this.dispatchClient.send(
      PATTERNS.DISPATCH_COLLECT_BATCH_BY_CARGO_OFFICER,
      body,
    );
  }

  //COntroller used for delivering dispatch to the airport and it is done by cargo officer
  @Post('/handover')
  async handoverBatchesToAirport(@Body() body: BatchHandoverDto): Promise<any> {
    return this.dispatchClient.send(
      PATTERNS.DISPATCH_HAND_OVER_BATCHES_TO_AIRPORT,
      body,
    );
  }

  //Controller used for collecting or recieving dispatch from the airport and it is done by local branch customer officer
  @Post('/collect')
  async collectFromAirport(@Body() body: BatchHandoverDto): Promise<any> {
    return this.dispatchClient.send(
      PATTERNS.DISPATCH_COLLECT_FROM_AIRPORT,
      body,
    );
  }
  //COntroller used for creating or categorizing batch orders or used for creating batch dispatch after categorization
  @Post('/batch')
  async createBatchDispatch(@Body() body: BatchDispatchDto): Promise<any> {
    console.log('body: ', body);
    return this.dispatchClient.send(
      PATTERNS.DISPATCH_APPROVE_CATEGORIZATION,
      body,
    );
  }

  //Controller used for assigning driver for the last mile delivery of the package
  @Post('/assign-delivery')
  async assignDriverForDelivery(@Body() body: AssignDriverForPickup): Promise<any> {
    return this.dispatchClient.send(
      PATTERNS.DISPATCH_ASSIGN_DRIVER_FOR_DELIVERY,
      body,
    );
  }

  @Post('/last-mile-delivery')
  async lastMileDelivery(@Body() body: LastMileDeliveryDto): Promise<any> {
    return this.dispatchClient.send(
      PATTERNS.DISPATCH_ACCEPT_LAST_MILE_DELIVERY,
      body,
    );
  }

  @Post('/complete-delivery')
  async completeDelivery(@Body() body: CompleteDeliveryDto): Promise<any> {
    return this.dispatchClient.send(
      PATTERNS.DISPATCH_COMPLETE_DELIVERY,
      body,
    );
  }
  //COntroller used for assigning driver for the pick up of the package from the customer
  @Patch('change-driver')
  async changeDriverForOrder(
    @Body() body: AssignDriverForPickup,
  ): Promise<any> {
    return this.dispatchClient.send(
      PATTERNS.DISPATCH_CHANGE_DRIVER_FOR_ORDER,
      body,
    );
  }

  //COntroller used  for removing driver completely from the order
  @Delete('remove-driver/:orderId')
  async removeDriverFromOrder(@Param('orderId') orderId: string): Promise<any> {
    return this.dispatchClient.send(
      PATTERNS.DISPATCH_REMOVE_DRIVER_FROM_ORDER,
      orderId,
    );
  }

  //Controller used for getting all batch dispatches with filters and pagination
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

  //Controller used for adding new orders to the batches. this happened when new orders came and it can be categoriezed with existing batch dispatch or may be new order's service type is sameday and used to send it with in existing dispatched orders
  @Patch('/add-order/:batchId')
  async addOrderToBatch(@Param('batchId') batchId: string, @Body() body: any) {
    return this.dispatchClient.send(PATTERNS.DISPATCH_ADD_ORDERS_TO_BATCH, {
      batchId,
      newOrderIds: body.orders,
      // updateData: body.updateData
      body,
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
