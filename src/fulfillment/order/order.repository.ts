import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrderDto, UpdateOrderDto, ValidateOrderDto } from './order.entity';
import {
  VehicleStatus,
  OrderStatus,
  ServiceType,
  FulfillmentType,
} from '@prisma/client'; // assuming you use Prisma enums
import { AddressDto } from 'src/operations/user/user.entity';

@Injectable()
export class OrderRepository {

  constructor(private prisma: PrismaService) {}
  async trackOrder(orderId: string) {
    return this.prisma.orderTracking.findMany({
      where: { orderId },
    });
  }

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
        status: OrderStatus.CREATED,
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

async updateOrder(orderId: string, data: UpdateOrderDto): Promise<any> {
  return this.prisma.$transaction(async (tx) => {
    // remove undefined / null values so Prisma only updates what's present
    const cleanedData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined && value !== null)
    );

    // 1. Update the order
    const updatedOrder = await tx.order.update({
      where: { id: orderId },
      data: cleanedData,
    });

    // 2. Track the update
    await tx.orderTracking.create({
      data: {
        orderId,
        status: updatedOrder.status, // log current status after update
        // updatedBy,
        notes: `Order updated with fields: ${Object.keys(cleanedData).join(', ')}`,
      },
    });

    return updatedOrder;
  });
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

   async getPendingApprovals(skip: number, pageSize: number): Promise<any> {
    return await Promise.all([
      await this.prisma.parcelApproval.findMany({
      skip,
      take: pageSize,
      where: {
        status: 'PENDING',
      },
    }),
      await this.prisma.parcelApproval.count({
        where: {
          status: 'PENDING',
        },
      }),
    ])
  }

  async getAllOrders(
    filters: {
      fragile?: boolean;
      unusual?: boolean;
      pending?: boolean;
      pendingApproval?: boolean;
      pendingPickup?: boolean;
      branchId?: string;
      customerId?: string;
      status?: OrderStatus | string;
      driverId?: string;
      serviceType?: ServiceType | string;
      payment?: string;
      fulfillmentType?: FulfillmentType | string;
    },
    data: { page: number; pageSize: number },
  ): Promise<any> {
    const { page, pageSize } = data;
    const skip = (page - 1) * pageSize;

    // Build where clause dynamically
    const where: any = {};
    if (filters.fragile) where.isFragile = true;
    if (filters.unusual) where.isUnusual = true;
    if (filters.pending) where.status = 'PICKED_UP';
    if (filters.pendingApproval) where.status = 'PENDING_APPROVAL';
    if (filters.pendingPickup) where.status = 'READY_FOR_PICKUP';
    if (filters.branchId) where.branchId = filters.branchId;
    if (filters.customerId) where.customerId = filters.customerId;
    if (filters.status) where.status = filters.status;
    if (filters.driverId) where.driverId = filters.driverId;
    if (filters.serviceType) where.serviceType = filters.serviceType;
    if (filters.payment) where.paymentId = filters.payment;
    if (filters.fulfillmentType) where.fulfillmentType = filters.fulfillmentType;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        skip,
        take: pageSize,
        where,
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
      this.prisma.order.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    return {
      orders,
      pagination: {
        total,
        page,
        pageSize,
        totalPages,
      },
    };
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
  async acceptDropOffOrder(
    trackingCode: string,
    orderId: string,
    branchId: string,
    updatedBy: string,
    location: string,
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
        location,
        updatedBy,
        'Dropoff confirmed by customer',
      ),
    ]);
    return result;
  }

   async getOrdersGroupedByScope(skip: number, pageSize: number) {
    const orders = await Promise.all([
      await this.prisma.order.findMany({
      skip,
      take: pageSize,
      where: { batchId: null, status: "APPROVED" },
      select: {
        id: true,
        trackingCode: true,
        shippingScope: true,
        serviceType: true,
        category: true,
        isFragile: true,
        deliveryAddress: true,
        weight: true,
        height: true,
        width: true,
        length: true,
        shipmentType: true,
        isUnusual: true,
        unusualReason: true,
        notes: true,
        validatedNotes: true
      },
    }),
      await this.prisma.order.count({ where: { batchId: null, status: "APPROVED" } }),
    ])
    return orders;
  }

  async getOrderStatusLog(skip: number, pageSize: number, where: any) {
    return await Promise.all([
      this.prisma.orderTracking.findMany({
        skip,
        take: pageSize,
        where,
      }),
      this.prisma.orderTracking.count({
        where
      })
    ])
  }

async addException(orderId: string, reason: string, type: string, userId?: string) {
  return this.prisma.$transaction(async (tx) => {
    // Step 1: Add the exception
    const exception = await tx.orderException.create({
      data: {
        orderId,
        reason,
        type,
      },
    });

    // Step 2: Update order status
    const updatedOrder = await tx.order.update({
      where: { id: orderId },
      data: { status: 'EXCEPTION' }, 
    });

    // Step 3: Add order tracking
    await tx.orderTracking.create({
      data: {
        orderId,
        status: 'EXCEPTION',
        // updatedBy: userId || 'system',
        notes: `Exception: ${reason} (Type: ${type})`,
      },
    });

    return { exception, updatedOrder };
  });
}


async cancelOrder(orderId: string, reason: string, userId?: string) {
  return this.prisma.$transaction(async (tx) => {
    // 1. Update order status to CANCELED
    const canceledOrder = await tx.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.CANCELED },
    });

    // 2. If the order is part of a batch, remove it from that batch
    if (canceledOrder.batchId) {
      await tx.batchDispatch.update({
        where: { id: canceledOrder.batchId },
        data: {
          orders: {
            disconnect: { id: orderId }, 
          },
        },
      });
    }

    // 3. Add the exception with cancelation reason
    await tx.orderException.create({
      data: {
        orderId,
        reason,
        type: "CANCELLED",
      },
    });

    // 4. Log the cancellation for tracking
    await tx.orderTracking.create({
      data: {
        orderId,
        status: OrderStatus.CANCELED,
        // updatedBy: 'User', 
        notes: 'Order canceled and removed from batch (if any).',
      },
    });

    return canceledOrder;
  });
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
