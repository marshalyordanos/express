import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateOrderDto,
  UpdateOrderDto,
  ValidateOrderDto,
} from './order.entity';
import {
  VehicleStatus,
  OrderStatus,
  ServiceType,
  FulfillmentType,
  Prisma,
  AddressPurpose,
} from '@prisma/client'; // assuming you use Prisma enums
import { ListQueryDto } from '../../common/query/query.dto';
import { PrismaQueryFeature } from '../../common/query/prisma-query-feature';
import { RpcException } from '@nestjs/microservices';
import { MapsService } from '../maps/maps.usecase.impl';
// import { AddressDto } from 'src/operations/user/user.entity';

@Injectable()
export class OrderRepository {
  constructor(
    private prisma: PrismaService,
    private mapsService: MapsService,
  ) {}
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

  async getException(payload: ListQueryDto) {
    const feature = new PrismaQueryFeature({
      search: payload.search,
      filter: payload.filter,
      sort: payload.sort,
      page: payload.page,
      pageSize: payload.pageSize,
      searchableFields: ['type', 'reason'],
    });
    const query = feature.getQuery();
    console.log('quest1: ', query);

    const results = await Promise.all([
      this.prisma.orderException.findMany({
        ...query,
        where: query.where || {},
        include: {
          order: {
            include: {
              customer: true,
              branch: true,
              driver: true,
              payment: true,
            },
          },
        },
      }),
      this.prisma.orderException.count({ where: query.where || {} }),
    ]);

    const orders = results[0] || [];
    const total = results[1] || 0;
    return {
      orders,
      pagination: feature.getPagination(total),
    };
  }

  async solveException(orderId: string, data: UpdateOrderDto) {
    return this.prisma.$transaction(async (tx) => {
      // Clean incoming data (remove null/undefined)
      const cleanedData = Object.fromEntries(
        Object.entries(data).filter(
          ([_, value]) => value !== undefined && value !== null,
        ),
      );

      // Force status back to PENDING
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          ...cleanedData,
          status: 'PENDING',
        },
      });

      await tx.orderException.deleteMany({
        where: {
          orderId,
        },
      });
      await tx.orderTracking.create({
        data: {
          orderId,
          status: updatedOrder.status, // log current status after update
          // updatedBy,
          notes: `Order resolved for exception `,
        },
      });

      return updatedOrder;
    });
  }

  async createOrderWithAddressesAndDistance(
    data: any,
    customerId: string,
    trackingCode: string,
  ) {
    return this.prisma.$transaction(
      async (tx) => {
        // 🔹 Create addresses
        let pickupAddress: any = null;
        if (data.pickupAddress) {
          pickupAddress = await tx.address.create({
            data: {
              ...data.pickupAddress,
              purpose: 'ORDER_PICKUP',
              user: { connect: { id: customerId } },
            },
          });
        }

        const deliveryAddress = await tx.address.create({
          data: {
            ...data.deliveryAddress,
            purpose: 'ORDER_DELIVERY',
            user: { connect: { id: customerId } },
          },
        });

        // 🔹 Calculate distance
        const origin = pickupAddress
          ? { lat: Number(pickupAddress.lat), lon: Number(pickupAddress.long) }
          : await this.getBranchCoordinates(data.branchId, tx);

        const destination = {
          lat: Number(deliveryAddress.lat),
          lon: Number(deliveryAddress.long),
        };

        const distance = await this.mapsService.calculateDistance(
          origin,
          destination,
        );

        // 🔹 Create order
        const orderData = {
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
          distance,
          pickupDate: data.pickupDate ? new Date(data.pickupDate) : null,
          deliveryDate: data.deliveryDate ? new Date(data.deliveryDate) : null,
          cost: data.cost,
          customer: { connect: { id: customerId } },
          ...(data.branchId && { branch: { connect: { id: data.branchId } } }),
          ...(data.driverId && { driver: { connect: { id: data.driverId } } }),
          ...(data.paymentId && {
            payment: { connect: { id: data.paymentId } },
          }),
          ...(pickupAddress && {
            pickupAddress: { connect: { id: pickupAddress.id } },
          }),
          deliveryAddress: { connect: { id: deliveryAddress.id } },
        };

        const order = await tx.order.create({
          data: orderData,
          include: {
            pickupAddress: true,
            deliveryAddress: true,
            customer: true,
          },
        });

        // 🔹 Create order tracking
        await tx.orderTracking.create({
          data: {
            orderId: order.id,
            status: 'CREATED',
            location: pickupAddress.addressLine ?? 'Customer Home.',
            updatedBy: customerId,
            notes: 'Order Created.',
          },
        });

        return order;
      },
      {
        timeout: 60000,
      },
    );
  }

  private async getBranchCoordinates(branchId: string, tx: any) {
    const branch = await tx.branch.findUnique({
      where: { id: branchId },
      include: { address: true },
    });
    if (!branch) throw new RpcException('Branch not found');

    return { lat: branch.address.lat, lon: branch.address.long };
  }

  async updateOrder(orderId: string, data: UpdateOrderDto): Promise<any> {
    return this.prisma.$transaction(async (tx) => {
      // remove undefined / null values so Prisma only updates what's present
      const cleanedData = Object.fromEntries(
        Object.entries(data).filter(
          ([_, value]) => value !== undefined && value !== null,
        ),
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

  // async createOrderAndValidate(
  //   data: ValidateOrderDto,
  //   customerConnect: any,
  //   branchConnect: any,
  //   driverConnect: any,
  //   paymentConnect: any,
  //   trackingCode: string,
  //   location: string,
  //   updatedBy: string,
  // ) {
  //   console.log('Validator: ', data.validatedBy);

  //   const order = await this.prisma.order.create({
  //     data: {
  //       trackingCode,
  //       status: 'PENDING_APPROVAL',
  //       serviceType: data.serviceType,
  //       fulfillmentType: data.fulfillmentType,
  //       weight: data.weight,
  //       height: data.height,
  //       width: data.width,
  //       length: data.length,
  //       category: data.category,
  //       isFragile: data.isFragile,
  //       shipmentType: data.shipmentType,
  //       shippingScope: data.shippingScope,
  //       pickupAddressId: data.pickupAddressId,
  //       pickupDate: data.pickupDate ? new Date(data.pickupDate) : null,
  //       deliveryAddressId: data.deliveryAddressId,
  //       deliveryDate: data.deliveryDate ? new Date(data.deliveryDate) : null,
  //       cost: data.cost,
  //       isUnusual: data.isUnusual ?? false,
  //       unusualReason: data.unusualReason ?? null,
  //       validator: { connect: { id: data.validatedBy } },
  //       validatedAt: new Date(),
  //       validatedNotes: data.validatedNotes ?? null,
  //       actualDropoffDate: new Date(),
  //       dropoffConfirmed: true,

  //       customer: customerConnect,
  //       ...(branchConnect && { branch: branchConnect }),
  //       ...(driverConnect && { driver: driverConnect }),
  //       ...(paymentConnect && { payment: paymentConnect }),
  //     },
  //   });

  //   await this.logOrderStatus(
  //     order.id,
  //     'PENDING_APPROVAL',
  //     location,
  //     data.validatedBy,
  //     'Order Created and validated.',
  //   );

  //   return order;
  // }

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
        select: {
          id: true,
          trackingCode: true,
          // status: true,
          // serviceType: true,
          // fulfillmentType: true,
          // pickupAddress: {
          //   select: { addressLine: true, city: true },
          // },
          // deliveryAddress: {
          //   select: { addressLine: true, city: true },
          // },
          pickupDate: true,
          // deliveryDate: true,
          pickupDriver: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true,
            },
          },
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

  async validateOrder(
    orderId: string,
    officerId: string,
    location: string,
    data: any,
  ) {
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

  async getPendingApprovals(payload: ListQueryDto) {
    const feature = new PrismaQueryFeature({
      search: payload.search,
      filter: payload.filter,
      sort: payload.sort,
      page: payload.page,
      pageSize: payload.pageSize,
      searchableFields: ['status', 'reason'],
    });

    const query = feature.getQuery();
    console.log('quest1: ', query);

    const where = {
      AND: [
        query.where || {}, // existing filters (search, etc.)
        { status: 'PENDING' }, // enforce pending status
      ],
    };
    const results = await Promise.all([
      await this.prisma.parcelApproval.findMany({
        ...query,
        where,
      }),
      await this.prisma.parcelApproval.count({
        where,
      }),
    ]);

    const approvals = results[0] || [];
    const total = results[1] || 0;
    return {
      approvals,
      pagination: feature.getPagination(total),
    };
  }

  async getAllOrders(payload: ListQueryDto) {
    const feature = new PrismaQueryFeature({
      search: payload.search,
      filter: payload.filter,
      sort: payload.sort,
      page: payload.page,
      pageSize: payload.pageSize,
      searchableFields: ['trackingCode', 'notes', 'category'],
    });

    const query = feature.getQuery();
    console.log('quest1: ', query);

    const results = await Promise.all([
      this.prisma.order.findMany({
        ...query,
        where: query.where || {},
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
      this.prisma.order.count({ where: query.where || {} }),
    ]);

    const orders = results[0] || [];
    const total = results[1] || 0;
    return {
      orders,
      pagination: feature.getPagination(total),
    };
  }
  async getOrderById(id: string): Promise<any> {
    return this.prisma.order.findUnique({
      where: { id },
      include: {
        pickupAddress: true,
      },
    });
  }

  async getOrderByTrackingCode(trackingCode: string): Promise<any> {
    return this.prisma.order.findUnique({
      where: { trackingCode: trackingCode },
      include: {
        customer: true,
        branch: true,
        payment: true,
        pickupDriver: true,
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
          deliveryAddress: {
            select: { addressLine: true, city: true },
          },
          deliveryDate: true,
          height: true,
          width: true,
          length: true,
          shipmentType: true,
          shippingScope: true,
          isFragile: true,
          isUnusual: true,
          // dropoffConfirmed: true,
          // actualDropoffDate: true,
          weight: true,
          // cost: true,
          finalPrice: true,
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
          pickupDriver: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true,
              // branch: true,
              // vehicles: true,
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

  async getOrdersGroupedByScope(payload: ListQueryDto) {
    const feature = new PrismaQueryFeature({
      search: payload.search,
      filter: payload.filter,
      sort: payload.sort,
      page: payload.page,
      pageSize: payload.pageSize,
      searchableFields: [],
    });

    const query = feature.getQuery();
    console.log('quest1: ', query);

    // ✅ Merge conditions
    const where = {
      AND: [
        query.where || {}, // existing search & filters
        { status: 'APPROVED' }, // enforce approved status
        {
          OR: [
            { batchId: null }, // not yet batched
            // { status: 'COMPLETED' }, // or already completed
          ],
        },
      ],
    };
    const results = await Promise.all([
      await this.prisma.order.findMany({
        ...query,
        where,
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
          validatedNotes: true,
        },
      }),
      await this.prisma.order.count({
        where,
      }),
    ]);
    const orders = results[0] || [];
    const total = results[1] || 0;
    return {
      orders,
      pagination: feature.getPagination(total),
    };
  }

  async getOrderStatusLog(payload: ListQueryDto) {
    const feature = new PrismaQueryFeature({
      search: payload.search,
      filter: payload.filter,
      sort: payload.sort,
      page: payload.page,
      pageSize: payload.pageSize,
      searchableFields: ['location', 'notes', 'status'],
    });
    const query = feature.getQuery();
    console.log('quest1: ', query);

    const results = await Promise.all([
      this.prisma.orderTracking.findMany({
        ...query,
        where: query.where || {},
      }),
      this.prisma.orderTracking.count({ where: query.where || {} }),
    ]);

    const orders = results[0] || [];
    const total = results[1] || 0;
    return {
      orders,
      pagination: feature.getPagination(total),
    };
  }

  async addException(
    orderId: string,
    reason: string,
    type: string,
    userId?: string,
  ) {
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
          type: 'CANCELLED',
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

  async createAddress(data: any, customerId: string, tx?: any) {
    const db = tx ?? this.prisma;
    return db.address.create({
      data: {
        label: data.label ?? 'ADDRESS',
        addressLine: data.addressLine ?? '',
        city: data.city ?? '',
        state: data.state ?? '',
        country: data.country ?? '',
        postalCode: data.postalCode ?? '',
        lat: data.lat,
        long: data.long,
        purpose: data.purpose ?? 'ORDER',
        user: { connect: { id: customerId } },
      },
    });
  }
}
