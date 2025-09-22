import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrderDto, ValidateOrderDto } from './order.entity';
import {
  VehicleStatus,
  OrderStatus,
  ServiceType,
  FulfillmentType,
} from '@prisma/client'; // assuming you use Prisma enums

@Injectable()
export class OrderRepository {
  async trackOrder(orderId: string) {
    return this.prisma.orderTracking.findMany({
      where: { orderId },
    });
  }
  getOrderByDriverId(
    id: string,
    skip: number,
    pageSize: any,
  ): [any, any] | PromiseLike<[any, any]> {
    throw new Error('Method not implemented.');
  }
  constructor(private prisma: PrismaService) {}

  async createCustomer(customerData: {
    name: string;
    email: string;
    phone: string;
  }) {
    return this.prisma.user.create({
      data: {
        name: customerData.name,
        email: customerData.email,
        phone: customerData.phone ?? null,
        password: '',
        isStaff: false,
        roleId: null,
      },

    });
  }

  async findCustomerByEmailOrPhone(email: string, phone: string) {
    return this.prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: email, mode: 'insensitive' } },
          { phone: phone },
        ],
      },
    });
  }
  async findCustomer(customerId: string): Promise<any> {
    return this.prisma.user.findUnique({
      where: { id: customerId },
    });
  }

  async findStaffById(officerId: string) {
    return this.prisma.user.findUnique({
      where: { id: officerId },
    });
  }

  async findBranch(branchId: string): Promise<any> {
    return this.prisma.branch.findUnique({
      where: { id: branchId },
    });
  }

  async findDriver(driverId: string): Promise<any> {
    return this.prisma.user.findUnique({
      where: { id: driverId },
    });
  }

  async findPayment(paymentId: string): Promise<any> {
    return this.prisma.payment.findUnique({
      where: { id: paymentId },
    });
  }
  async createOrder(
    data: any,
    customerConnect: any,
    branchConnect: any,
    driverConnect: any,
    paymentConnect: any,
    trackingCode: string,
    location: string,
    updatedBy: string,
  ): Promise<any> {
    const order = await this.prisma.order.create({
      data: {
        trackingCode,
        status: 'CREATED',
        serviceType: data.serviceType,
        fulfillmentType: data.fulfillmentType,
        weight: data.weight,
        height: data.height,
        width: data.width,
        length: data.length,
        category: data.category,
        isFragile: data.isFragile,
        shipmentType: data.shipmentType,
        shippingScope: data.shippingScope,
        pickupAddress: data.pickupAddress,
        pickupDate: data.pickupDate ? new Date(data.pickupDate) : null,
        deliveryAddress: data.deliveryAddress,
        deliveryDate: data.deliveryDate ? new Date(data.deliveryDate) : null,
        cost: data.cost,
        customer: customerConnect,
        ...(branchConnect && { branch: branchConnect }), // ✅ only add if exists
        ...(driverConnect && { driver: driverConnect }), // ✅ only add if exists
        ...(paymentConnect && { payment: paymentConnect }), // ✅ only add if exists
      },
    });

    await this.logOrderStatus(
      order.id,
      'CREATED',
      location,
      updatedBy,
      'Order Created.',
    );

    return order;
  }
  async createOrderAndValidate(
    data: ValidateOrderDto,
    customerConnect: any,
    branchConnect: any,
    driverConnect: any,
    paymentConnect: any,
    trackingCode: string,
    location: string,
    updatedBy: string,
  ) {
    console.log("Validator: ", data.validatedBy);
    
    const order = await this.prisma.order.create({
      data: {
        trackingCode,
        status: 'PENDING_APPROVAL',
        serviceType: data.serviceType,
        fulfillmentType: data.fulfillmentType,
        weight: data.weight,
        height: data.height,
        width: data.width,
        length: data.length,
        category: data.category,
        isFragile: data.isFragile,
        shipmentType: data.shipmentType,
        shippingScope: data.shippingScope,
        pickupAddress: data.pickupAddress,
        pickupDate: data.pickupDate ? new Date(data.pickupDate) : null,
        deliveryAddress: data.deliveryAddress,
        deliveryDate: data.deliveryDate ? new Date(data.deliveryDate) : null,
        cost: data.cost,
        isUnusual: data.isUnusual ?? false,
        unusualReason: data.unusualReason ?? null,
        validator: { connect: { id: data.validatedBy } },
        validatedAt: new Date(),
        validatedNotes: data.validatedNotes ?? null,
        actualDropoffDate: new Date(),
        dropoffConfirmed: true,

        customer: customerConnect,
        ...(branchConnect && { branch: branchConnect }),
        ...(driverConnect && { driver: driverConnect }),
        ...(paymentConnect && { payment: paymentConnect }),
      },
    });

    await this.logOrderStatus(
      order.id,
      'PENDING_APPROVAL',
      location,
      data.validatedBy,
      'Order Created and validated.',
    );

    return order;
  }

  async confirmPickupOrder(
    orderId: string,
    location: string,
    updatedBy: string,
  ) {
    const result = await Promise.all([
      await this.prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'PICKED_UP',
          pickupConfirmed: true,
          actualPickupDate: new Date(),
        },
      }),
      await this.logOrderStatus(
        orderId,
        'PICKED_UP',
        location,
        updatedBy,
        'Pickup confirmed by driver',
      ),
    ]);

    return result;
  }

  async validateOrder(orderId: string, officerId: string,location: string, data: any) {
    console.log('updates: ', data);

    const result = await Promise.all([
      await this.prisma.order.update({
        where: { id: orderId },
        data: {
          ...data, // dynamic fields (weight, size, cost, etc.)
          status: 'PENDING_APPROVAL',
          validatedBy: officerId,
          validatedAt: new Date(),
          updatedAt: new Date(),
        },
      }),
      await this.logOrderStatus(
        orderId,
        'PENDING_APPROVAL',
        location,
        officerId,
        'Order validated, pending approval',
      ),
    ]);
    return result;
  }

  async markUnusualOrder(orderId: string, data: any) {
    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        isUnusual: true,
        isFragile: data.isFragile,
        unusualReason: data.unusualReason,
        updatedAt: new Date(),
      },
    });
  }

  async getFragileOrder(skip: number, pageSize: number) {
    return await Promise.all([
      this.prisma.order.findMany({
        skip,
        take: pageSize,
        where: {
          isFragile: true,
        },
        include: {
          customer: true,
          branch: true,
          driver: true,
          payment: true,
          validator: true,
        },
      }),
      this.prisma.order.count({ where: { isFragile: true } }),
    ]);
  }

  async getUnusualOrder(skip: number, pageSize: number) {
    return await Promise.all([
      this.prisma.order.findMany({
        skip,
        take: pageSize,
        where: {
          isUnusual: true,
        },
        include: {
          customer: true,
          branch: true,
          driver: true,
          payment: true,
          validator: true,
        },
      }),
      this.prisma.order.count({ where: { isUnusual: true } }),
    ]);
  }

  async getPendingApprovalOrder(skip: number, pageSize: number) {
    return await Promise.all([
      this.prisma.order.findMany({
        skip,
        take: pageSize,
        where: {
          status: 'PENDING_APPROVAL',
        },
        include: {
          customer: true,
          branch: true,
          driver: true,
          payment: true,
          validator: true,
        },
      }),
      this.prisma.order.count({ where: { status: 'PENDING_APPROVAL' } }),
    ]);
  }

  async approveOrder(
    order: any,
    reason: string,
    location: string,
    updatedBy: string,
  ) {
    const result = await Promise.all([
      await this.prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'APPROVED',
        },
      }),
      await this.prisma.parcelApproval.create({
        data: {
          orderId: order.id,
          status: 'APPROVED',
          reason,
          decisionBy: updatedBy,
          decidedAt: new Date(),
        },
      }),
      await this.logOrderStatus(
        order.id,
        'APPROVED',
        location,
        updatedBy,
        'Order approved by Operation Manager',
      ),
    ]);
    return result;
  }

  async getPendingOrder(skip: number, pageSize: number) {
    return await Promise.all([
      this.prisma.order.findMany({
        skip,
        take: pageSize,
        where: {
          status: 'PICKED_UP',
        },
        include: {
          customer: true,
          branch: true,
          driver: true,
          payment: true,
        },
      }),
      this.prisma.order.count({ where: { status: 'PICKED_UP' } }),
    ]);
  }

  async getPendingPickupOrder(skip: number, pageSize: number) {
    return await Promise.all([
      this.prisma.order.findMany({
        skip,
        take: pageSize,
        where: {
          status: 'READY_FOR_PICKUP',
        },
        include: {
          customer: true,
          branch: true,
          driver: true,
          payment: true,
        },
      }),
      this.prisma.order.count({ where: { status: 'READY_FOR_PICKUP' } }),
    ]);
  }

  async getAllOrders(skip: number, pageSize: number): Promise<any> {
    return await Promise.all([
      this.prisma.order.findMany({
        skip,
        take: pageSize,
        include: {
          customer: true,
          branch: true,
          driver: true,
          payment: true,
          validator: true,
          approvalRequest: true,
          orderTracking: true,
        },
      }),
      this.prisma.order.count(),
    ]);
  }
  async getOrderById(id: string): Promise<any> {
    return this.prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        branch: true,
        driver: true,
        payment: true,
        validator: true,
      },
    });
  }

  async getOrderByFullfillmentType(
    fulfillmentType: FulfillmentType,
    skip: number,
    pageSize: number,
  ): Promise<any> {
    return await Promise.all([
      this.prisma.order.findMany({
        skip,
        take: pageSize,
        where: { fulfillmentType },
        include: {
          customer: true,
          branch: true,
          driver: true,
          payment: true,
          validator: true,
        },
      }),
      this.prisma.order.count({ where: { fulfillmentType } }),
    ]);
  }
  async getOrderByTrackingCode(trackingCode: string): Promise<any> {
    return this.prisma.order.findUnique({
      where: { trackingCode: trackingCode },
      include: {
        customer: true,
        branch: true,
        driver: true,
        payment: true,
      },
    });
  }
  async getOrderByCustomerId(
    customerId: string,
    skip: number,
    pageSize: number,
  ): Promise<any> {
    return await Promise.all([
      this.prisma.order.findMany({
        skip,
        take: pageSize,
        where: { customerId },
        include: {
          customer: true,
          branch: true,
          driver: true,
          payment: true,
        },
      }),
      this.prisma.order.count({ where: { customerId } }),
    ]);
  }

  async getOrderByBranch(
    branchId: string,
    skip: number,
    pageSize: number,
  ): Promise<any> {
    return await Promise.all([
      this.prisma.order.findMany({
        skip,
        take: pageSize,
        where: { branchId },
        include: {
          customer: true,
          branch: true,
          driver: true,
          payment: true,
          validator: true,
        },
      }),
      this.prisma.order.count({ where: { branchId } }),
    ]);
  }

  async getOrderByStatus(
    status: OrderStatus,
    skip: number,
    pageSize: number,
  ): Promise<any> {
    return await Promise.all([
      this.prisma.order.findMany({
        skip,
        take: pageSize,
        where: { status },
        include: {
          customer: true,
          branch: true,
          driver: true,
          payment: true,
        },
      }),
      this.prisma.order.count({ where: { status } }),
    ]);
  }

  async getOrderByServiceType(
    serviceType: ServiceType,
    skip: number,
    pageSize: number,
  ): Promise<any> {
    return await Promise.all([
      this.prisma.order.findMany({
        skip,
        take: pageSize,
        where: { serviceType },
        include: {
          customer: true,
          branch: true,
          driver: true,
          payment: true,
          validator: true,
        },
      }),
      this.prisma.order.count({ where: { serviceType } }),
    ]);
  }

  async getOrderByFulfillmentType(
    fulfillmentType: FulfillmentType,
    skip: number,
    pageSize: number,
  ): Promise<any> {
    return await Promise.all([
      this.prisma.order.findMany({
        skip,
        take: pageSize,
        where: { fulfillmentType },
        include: {
          customer: true,
          branch: true,
          driver: true,
          payment: true,
          validator: true,
        },
      }),
      this.prisma.order.count({ where: { fulfillmentType } }),
    ]);
  }

  async acceptDropOffOrder(
    trackingCode: string,
    orderId: string,
    branchId: string,
    updatedBy: string,
  ) {
    console.log('trackingCode: ', trackingCode);

    const result = await Promise.all([
      this.prisma.order.update({
        where: { trackingCode },
        data: {
          status: 'DROPPED_OFF',
          dropoffConfirmed: true,
          actualDropoffDate: new Date(),
          branchId,
        },
        select: {
          id: true,
          trackingCode: true,
          status: true,
          serviceType: true,
          fulfillmentType: true,
          deliveryAddress: true,
          deliveryDate: true,
          height: true,
          width: true,
          length: true,
          shipmentType: true,
          shippingScope: true,
          isFragile: true,
          isUnusual: true,
          dropoffConfirmed: true,
          actualDropoffDate: true,
          weight: true,
          cost: true,
          payment: {
            select: {
              id: true,
              amount: true,
              status: true,
            },
          },
          customer: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true,
            },
          },
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
          branch: {
            select: {
              id: true,
              name: true,
              location: true,
            },
          },
        },
      }),
      await this.logOrderStatus(
        orderId,
        'PICKED_UP',
        branchId,
        updatedBy,
        'Dropoff confirmed by customer',
      ),
    ]);
    return result;
  }

  private async logOrderStatus(
    orderId: string,
    status: OrderStatus,
    location?: string,
    updatedBy?: string,
    notes?: string,
  ) {
    await this.prisma.orderTracking.create({
      data: { orderId, status, location, updatedBy, notes },
    });
  }
}
