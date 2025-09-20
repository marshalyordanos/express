import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PATTERNS } from 'src/contracts';
import { AssignDriverForPickup } from 'src/fulfillment/dispatch/dispatch.entity';

@Controller('dispatch')
export class DispatchGatewayController {
  constructor(
    @Inject('FULFILLMENT_SERVICE') private readonly dispatchClient: ClientProxy,
  ) {}

  @Post()
  async createDispatch() {}

  @Post('/assign')
  async assignDispatch(@Body() body: AssignDriverForPickup): Promise<any> {
    console.log('body: ', body);

    return this.dispatchClient.send(
      PATTERNS.DISPATCH_ASSIGN_DRIVER_FOR_PICKUP,
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
  async getAllDispatch() {}

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
