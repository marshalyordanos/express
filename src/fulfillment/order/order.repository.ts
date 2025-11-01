import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateOrderDto } from './order.entity';
import { OrderStatus, Address, Order, ApprovalStatus } from '@prisma/client'; // assuming you use Prisma enums
import { ListQueryDto } from '../../common/query/query.dto';
import { PrismaQueryFeature } from '../../common/query/prisma-query-feature';
import { RpcException } from '@nestjs/microservices';
import { WebSocketEventService } from '../../websocket/services/websocket-event.service';

@Injectable()
export class OrderRepository {
  constructor(
    private prisma: PrismaService,
  ) {
  }
  async trackOrder(orderId: string) {
    return this.prisma.orderTracking.findMany({
      where: { orderId },
    });
  }

  async createCustomer(customerData: {
    name: string;
    email: string;
    phone: string;
    userId?: string;
  }) {
    return this.prisma.user.create({
      data: {
        name: customerData.name,
        email: customerData.email,
        phone: customerData.phone ?? null,
        password: '',
        isStaff: false,
        roleId: null,
        createdBy: customerData.userId || 'system',
      },
    });
  }

  //   async findOrCreateCustomer(customerData: {
  //   name: string;
  //   email: string;
  //   phone: string;
  //   userId?: string;
  // }) {
  //   // 1️⃣ Try to find existing user by email or phone
  //   const existingUser = await this.prisma.user.findFirst({
  //     where: {
  //       OR: [
  //         { email: customerData.email },
  //         { phone: customerData.phone },
  //       ],
  //     },
  //   });

  //   // 2️⃣ If found, return it
  //   if (existingUser) {
  //     return existingUser;
  //   }

  //   // 3️⃣ If not found, create new customer
  //   return this.prisma.user.create({
  //     data: {
  //       name: customerData.name,
  //       email: customerData.email,
  //       phone: customerData.phone ?? null,
  //       password: '', // or generate random password if needed
  //       isStaff: false,
  //       roleId: null,
  //       createdBy: customerData.userId || 'system',
  //     },
  //   });
  // }

  async findOrCreateCustomer(customerData: {
    name: string;
    email: string;
    phone: string;
    userId?: string;
  }) {
    // Step 1: Try to find existing user by email or phone
    let existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: customerData.email }, { phone: customerData.phone }],
      },
    });

    // Step 2: If user exists, optionally update name if different
    if (existingUser) {
      if (existingUser.name !== customerData.name) {
        existingUser = await this.prisma.user.update({
          where: { id: existingUser.id },
          data: { name: customerData.name },
        });
      }
      return existingUser;
    }

    // Step 3: If not exists, create new user
    try {
      return await this.prisma.user.create({
        data: {
          name: customerData.name,
          email: customerData.email,
          phone: customerData.phone ?? null,
          password: '', // or generate a random password
          isStaff: false,
          roleId: null,
          createdBy: customerData.userId || 'system',
        },
      });
    } catch (error) {
      // Step 4: Handle unique constraint errors gracefully (race condition)
      if (error.code === 'P2002') {
        // Conflict: someone created the user concurrently
        existingUser = await this.prisma.user.findFirst({
          where: {
            OR: [{ email: customerData.email }, { phone: customerData.phone }],
          },
        });
        if (existingUser) return existingUser;
      }
      throw error;
    }
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
        select: {
          id: true,
          type: true,
          reason: true,
          order: {
            select: {
              id: true,
              trackingCode: true,
              serviceType: true,
              fulfillmentType: true,
              status: true,
              category: true,
              shipmentType: true,
              shippingScope: true,
              isFragile: true,
              customer: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                },
              },
              receiver: {
                select: {
                  id: true,
                  name: true,
                  phone: true,
                  email: true,
                },
              },
              branch: {
                select: {
                  id: true,
                  name: true,
                },
              },
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

  async solveException(
    orderId: string,
    data: UpdateOrderDto,
    updatedBy?: string,
  ) {
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
          updatedBy,
          notes: `Order resolved for exception `,
        },
      });

      return updatedOrder;
    });
  }

  async createOrderWithAddresses(
    data: any,
    customerId: string,
    receiverId: string,
    trackingCode: string,
    pickupAddress: any,
    deliveryAddress: any,
    userId?: string,
  ): Promise<any> {
    console.log(
      'Repository inside creation order for addresses pickup and delivery :::::: ',
      pickupAddress,
      deliveryAddress,
    );

    // 1️⃣ Create addresses and order in a short Prisma transaction
    const order = await this.prisma.$transaction(
      async (tx) => {
        console.log('Pickup address is :::::: ', data.pickupAddress);

        // Create pickup address if provided
        let pickupAddressRecord: Address | null = null;
        if (data.pickupAddress) {
          // Try to find an existing address with the same lat & long
          pickupAddressRecord = await tx.address.findFirst({
            where: {
              lat: data.pickupAddress.lat,
              long: data.pickupAddress.long,
              purpose: 'ORDER_PICKUP',
              userId: customerId,
            },
          });

          // If not found, create a new one
          if (!pickupAddressRecord) {
            pickupAddressRecord = await tx.address.create({
              data: {
                addressLine: pickupAddress.addressLine ?? 'Unknown',
                label: pickupAddress.label ?? 'Unknown Home or Office',
                lat: data.pickupAddress.lat,
                long: data.pickupAddress.long,
                city: pickupAddress.city ?? 'Unknown',
                state: pickupAddress.state ?? 'Unknown',
                country: pickupAddress.country ?? 'Unknown',
                postalCode: pickupAddress.postalCode ?? 'Unknown',
                purpose: 'ORDER_PICKUP',
                user: { connect: { id: customerId } },
                createdBy: userId ?? customerId,
              },
            });
          }
        }

        // console.log('Pickup address ready:', pickupAddressRecord);

        // Delivery address (similar logic)
        let deliveryAddressRecord: Address | null = null;
        if (data.deliveryAddress) {
          deliveryAddressRecord = await tx.address.findFirst({
            where: {
              lat: data.deliveryAddress.lat,
              long: data.deliveryAddress.long,
              purpose: 'ORDER_DELIVERY',
              userId: customerId,
            },
          });

          if (!deliveryAddressRecord) {
            deliveryAddressRecord = await tx.address.create({
              data: {
                addressLine: deliveryAddress.addressLine ?? 'Unknown',
                label: deliveryAddress.label ?? 'Unknown Home or Office',
                lat: data.deliveryAddress.lat,
                long: data.deliveryAddress.long,
                city: deliveryAddress.city ?? 'Unknown',
                state: deliveryAddress.state ?? 'Unknown',
                country: deliveryAddress.country ?? 'Unknown',
                postalCode: deliveryAddress.postalCode ?? 'Unknown',
                purpose: 'ORDER_DELIVERY',
                user: { connect: { id: customerId } },
                createdBy: userId ?? customerId,
              },
            });
          }
        }

        // console.log('Delivery address ready:', deliveryAddressRecord);

        console.log('Delivery created:: ');

        // Prepare order data
        const orderData: any = {
          trackingCode: trackingCode,
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
          pickupDate: data.pickupDate ? new Date(data.pickupDate) : null,
          deliveryDate: data.deliveryDate ? new Date(data.deliveryDate) : null,
          createdBy: userId ?? customerId,
          cost: data.cost,
          customerId: customerId,
          receiverId: receiverId,
          // customer: { connect: { id: customerId } },
          branchId: data.branchId ? data.branchId : null,
          // branch: data.branchId ? { connect: { id: data.branchId } } : undefined,
          pickupAddressId: pickupAddressRecord?.id ?? null,
          // pickupAddress: pickupAddress ? { connect: { id: pickupAddress.id } } : undefined,
          deliveryAddressId: deliveryAddressRecord.id,
          // deliveryAddress: { connect: { id: deliveryAddress.id } },
        };

        // Create order
        const order = await tx.order.create({
          data: orderData,
          include: { pickupAddress: true, deliveryAddress: true },
        });

        console.log('Order created:: ');

        // Create order tracking record
        await tx.orderTracking.create({
          data: {
            orderId: order.id,
            status: 'CREATED',
            location: pickupAddress?.addressLine ?? 'Customer Home',
            updatedBy: userId ?? customerId,
            notes: 'Order Created.',
          },
        });

        console.log('Log created:: ');

        return order;
      },
      { timeout: 60000 },
    );

    // 2️⃣ Trigger async distance & pricing calculation outside transaction
    // let origin: { lat: number; lon: number };
    // if (order.pickupAddress) {
    //   origin = {
    //     lat: Number(order.pickupAddress.lat),
    //     lon: Number(order.pickupAddress.long),
    //   };
    // } else {
    //   origin = (await this.getBranchCoordinates(data.branchId)) as any;
    // }

    // const destination = {
    //   lat: Number(order.deliveryAddress.lat),
    //   lon: Number(order.deliveryAddress.long),
    // };

    // console.log('before calculating : ', origin, destination);
    // console.log('before calculating second : ', this.websocketService);

    // console.log(
    //   '🧩 websocketService:',
    //   this.websocketService?.constructor?.name,
    // );
    // if (!this.websocketService) {
    //   throw new Error('🚨 websocketService is not injected!');
    // }
    // // Emit WebSocket or background job for async processing
    // this.websocketService.emitOrderDistanceCalculation(
    //   order.id,
    //   origin,
    //   destination,
    // );

    // console.log('Distance and price calculated:: ');

    // 3️⃣ Return immediately, transaction is complete
    return order;
  }

  

  async updateOrderDistance(orderId: string, distance: number) {
    try {
      await this.prisma.order.update({
        where: { id: orderId },
        data: { distance },
      });
      console.log(`✅ Updated distance for order ${orderId}: ${distance} km`);
    } catch (error) {
      console.error(
        `❌ Failed to update order distance for ${orderId}:`,
        error,
      );
    }
  }
  async getBranchCoordinates(branchId: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
      include: { address: true },
    });
    if (!branch) throw new RpcException('Branch not found');

    return { lat: branch.address.lat, lon: branch.address.long };
  }

  async updateOrder(
    orderId: string,
    data: UpdateOrderDto,
    updatedBy?: string,
  ): Promise<any> {
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
          updatedBy,
          notes: `Order updated with fields: ${Object.keys(cleanedData).join(', ')}`,
        },
      });

      return updatedOrder;
    });
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
          ...data,
          status: 'PENDING_APPROVAL',
          validatedBy: officerId,
          validatedAt: new Date(),
          updatedAt: new Date(),
        },
      }),
      await this.prisma.parcelApproval.create({
        data: {
          orderId,
          status: 'PENDING',
          reason: data.reason,
          decisionBy: officerId,
          decidedAt: new Date(),
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
        { status: ApprovalStatus.PENDING }, // enforce pending status
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
        select: {
          id: true,
          trackingCode: true,
          serviceType: true,
          fulfillmentType: true,
          pickupDriverId: true,
          deliveryDriverId: true,
          status: true,
          weight: true,
          length: true,
          width: true,
          height: true,
          category: true,
          isFragile: true,
          shipmentType: true,
          shippingScope: true,
          isUnusual: true,
          unusualReason: true,
          pickupAddressId: true,
          pickupDate: true,
          deliveryAddressId: true,
          deliveryDate: true,
          distance: true,
          validatedBy: true,
          validatedNotes: true,
          estimatedDeliveryAt: true,
          actualDeliveryAt: true,
          batchId: true,
          finalPrice: true,
          currency: true,
          customer: {
            select: { id: true, name: true, phone: true, email: true },
          },
          receiver: {
            select: { id: true, name: true, phone: true, email: true },
          },
          branch: {
            select: { id: true, name: true },
          },
          payment: {
            select: { id: true, amount: true, status: true },
          },
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

  async getMyOrders(userId: string, payload: ListQueryDto) {
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
        { customerId: userId },
      ],
    };
    const results = await Promise.all([
      await this.prisma.order.findMany({
        ...query,
        where,
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
  async getOrderById(id: string): Promise<any> {
    return this.prisma.order.findUnique({
      where: { id },
      include: {
        pickupAddress: true,
      },
    });
  }

  async getOrderByTrackingCode(
    trackingCode: string,
    userId?: string,
  ): Promise<any> {
    return this.prisma.order.findFirst({
      where: {
        trackingCode,
        ...(userId ? { customerId: userId } : {}), // only adds customerId if defined
      },
      select: {
        id: true,
        trackingCode: true,
        serviceType: true,
        fulfillmentType: true,
        pickupDriverId: true,
        deliveryDriverId: true,
        status: true,
        weight: true,
        length: true,
        width: true,
        height: true,
        category: true,
        isFragile: true,
        shipmentType: true,
        shippingScope: true,
        isUnusual: true,
        unusualReason: true,
        pickupAddressId: true,
        pickupDate: true,
        deliveryAddressId: true,
        deliveryDate: true,
        distance: true,
        validatedBy: true,
        validatedNotes: true,
        estimatedDeliveryAt: true,
        actualDeliveryAt: true,
        batchId: true,
        finalPrice: true,
        currency: true,
        customer: {
          select: { id: true, name: true, phone: true, email: true },
        },
        receiver: {
          select: { id: true, name: true, phone: true, email: true },
        },
        branch: {
          select: { id: true, name: true },
        },
        payment: {
          select: { id: true, amount: true, status: true },
        },
        pickupDriver: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
        deliveryDriver: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
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
          receiver: {
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
          createdBy: userId || 'system',
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
          updatedBy: userId || 'system',
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
          createdBy: userId || 'system',
        },
      });

      // 4. Log the cancellation for tracking
      await tx.orderTracking.create({
        data: {
          orderId,
          status: OrderStatus.CANCELED,
          updatedBy: userId,
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

  async createAddress(
    data: any,
    customerId: string,
    tx?: any,
    userId?: string,
  ) {
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
        createdBy: userId || 'system',
      },
    });
  }
}
