import { Injectable } from '@nestjs/common';
import { DispatchUseCases } from './dispatch.usecase';
import { DispatchRepository } from './dispatch.repository';
import { AssignDriverForPickup } from './dispatch.entity';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class DispatchUseCasesImpl implements DispatchUseCases {
  constructor(private readonly dispatchRepo: DispatchRepository) {}

  async assignDriverForPickup(data: AssignDriverForPickup): Promise<any> {

    const driver = await this.dispatchRepo.findDriverById(data.driverId);
    if (!driver) {
      throw new RpcException({
        statusCode: 404,
        message: `Driver with ID ${data.driverId} not found.`,
      });
    }

    const order = await this.dispatchRepo.findOrderById(data.orderId);
    if (!order) {
      throw new RpcException({
        statusCode: 404,
        message: `Order with ID ${data.orderId} not found.`,
      });
    }

    if (order.driverId) {
      throw new RpcException({
        statusCode: 400,
        message: `Order with ID ${data.orderId} is already assigned to a driver.`,
      });
    }
    // Status checks
    if (order.status !== 'CREATED') {
      let message = `Order with ID ${data.orderId} is not eligible for driver assignment. Current status: ${order.status}.`;

      if (order.status === 'APPROVED') {
        message = `Order with ID ${data.orderId} has been approved. The driver is already coming to pick up the package.`;
      }

      throw new RpcException({
        statusCode: 400,
        message,
      });
    }

    // Validate pickup date
    if (!order.pickupDate) {
      throw new RpcException({
        statusCode: 400,
        message: `Order with ID ${data.orderId} does not have a scheduled pickup date.`,
      });
    }

    const now = new Date();
    const pickupDate = new Date(order.pickupDate);

    // Ensure pickup date is today or in the future
    if (pickupDate < new Date(now.setHours(0, 0, 0, 0))) {
      throw new RpcException({
        statusCode: 400,
        message: `Order with ID ${data.orderId} has an invalid pickup date (${pickupDate.toISOString()}). Pickup date cannot be in the past.`,
      });
    }

    // Assign driver
    const updatedOrder = await this.dispatchRepo.assignDriverForPickup(data);

    return {
      statusCode: 200,
      message: `Driver ${driver.name} (ID: ${driver.id}) successfully assigned to order ${order.id}.`,
      data: updatedOrder,
    };
  }

  async assignDriverForDelivery(data: AssignDriverForPickup): Promise<any> {
    return this.dispatchRepo.assignDriverForDelivery(data);
  }


  async removeDriverFromOrder(orderId: string): Promise<any> {
    const order= await this.dispatchRepo.findOrderById(orderId);
    if (!order || order.driverId === null) {
      throw new RpcException({
        statusCode: 404,
        message: `Order with ID ${orderId} is not assigned to any driver or Order does not Exist.`,
      });
    }
    return this.dispatchRepo.removeDriverFromOrder(orderId);
  }
 
  async changeDriverForOrder(data: AssignDriverForPickup): Promise<any> {
    const { orderId, driverId } = data;
    const order= await this.dispatchRepo.findOrderById(orderId);
    if (!order || order.driverId === null) {
      throw new RpcException({
        statusCode: 404,
        message: `Order with ID ${orderId} is not assigned to any driver or Order does not Exist.`,
      });
    }

    const driver= await this.dispatchRepo.findDriverById(driverId);
    if (!driver) {
      throw new RpcException({
        statusCode: 404,
        message: `Driver with ID ${driverId} not found.`,
      });
    }
    return this.dispatchRepo.changeDriverForOrder(orderId, driverId);
  }

}