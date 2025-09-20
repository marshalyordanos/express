import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AssignDriverForPickup } from './dispatch.entity';

@Injectable()
export class DispatchRepository {
  assignDriverForDelivery(data: AssignDriverForPickup): any {
    throw new Error('Method not implemented.');
  }
  constructor(private prisma: PrismaService) {}

  async assignDriverForPickup(body: any) {
    return this.prisma.order.update({
      where: {
        id: body.orderId,
      },
      data: {
        driverId: body.driverId,
        status: 'ASSIGNED',
      },
      select: {
        id: true,
        trackingCode: true,
        status: true,
        serviceType: true,
        fulfillmentType: true,
        pickupAddress: true,
        deliveryAddress: true,
        pickupDate: true,
        deliveryDate: true,
        driver: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            branch: true,
            vehicles: true,
          },
        },
      },
    });
  }

  async findOrderById(orderId: string) {
    return this.prisma.order.findUnique({
      where: { id: orderId },
    });
  }
  async findDriverById(driverId: string) {
    return this.prisma.user.findUnique({
      where: { id: driverId },
    });
  }

  async removeDriverFromOrder(orderId: string) {
    return this.prisma.order.update({
      where: { id: orderId },
      data: { driverId: null },
    });
  }

  async changeDriverForOrder(orderId: string, driverId: string) {
    return this.prisma.order.update({
      where: { id: orderId },
      data: { driverId },
    });
  }
}
