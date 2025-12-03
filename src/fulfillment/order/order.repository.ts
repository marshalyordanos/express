import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfirmPickUpOrderDto, UpdateOrderDto } from './order.entity';
import {
  OrderStatus,
  Address,
  Order,
  ApprovalStatus,
  OrderRouteSegment,
} from '@prisma/client'; // assuming you use Prisma enums
import { ListQueryDto } from '../../common/query/query.dto';
import { PrismaQueryFeature } from '../../common/query/prisma-query-feature';
import { RpcException } from '@nestjs/microservices';
// import { WebSocketEventService } from '../../websocket/services/websocket-event.service'; //temporary fix only

@Injectable()
export class OrderRepository {
  //       //       lat: data.pickupAddress.lat,
  //       //       long: data.pickupAddress.long,
  //       //       purpose: 'ORDER_PICKUP',
  //       //       userId: customerId,
  //       //     },
  //       //   });
  //       //   console.log("Pickup address for creating address inside repo .... ::", pickupAddress);
  //       //   // If not found, create a new one
  //       //   if (!pickupAddressRecord) {
  //       //     pickupAddressRecord = await tx.address.create({
  //       //       data: {
  //       //         addressLine: pickupAddress.addressLine ?? 'Unknown',
  //       //         label: pickupAddress.label ?? 'Unknown Home or Office',
  //       //         lat: data.pickupAddress.lat,
  //       //         long: data.pickupAddress.long,
  //       //         city: pickupAddress.city ?? 'Unknown',
  //       //         state: pickupAddress.state ?? 'Unknown',
  //       //         country: pickupAddress.country ?? 'Unknown',
  //       //         postalCode: pickupAddress.postalCode ?? 'Unknown',
  //       //         purpose: 'ORDER_PICKUP',
  //       //         user: { connect: { id: customerId } },
  //       //         createdBy: userId ?? customerId,
  //       //       },
  //       //     });
  //       //   }
  //       // }
  //       // console.log('Pickup address ready:', pickupAddressRecord);
  //       // // Delivery address (similar logic)
  //       // let deliveryAddressRecord: Address | null = null;
  //       // if (data.deliveryAddress) {
  //       //   deliveryAddressRecord = await tx.address.findFirst({
  //       //     where: {
  //       //       lat: data.deliveryAddress.lat,
  //       //       long: data.deliveryAddress.long,
  //       //       purpose: 'ORDER_DELIVERY',
  //       //       userId: customerId,
  //       //     },
  //       //   });
  //       //   console.log("Delivery address for creating address inside repo .... ::", deliveryAddress);
  //       //   if (!deliveryAddressRecord) {
  //       //     deliveryAddressRecord = await tx.address.create({
  //       //       data: {
  //       //         addressLine: deliveryAddress.addressLine ?? 'Unknown',
  //       //         label: deliveryAddress.label ?? 'Unknown Home or Office',
  //       //         lat: data.deliveryAddress.lat,
  //       //         long: data.deliveryAddress.long,
  //       //         city: deliveryAddress.city ?? 'Unknown',
  //       //         state: deliveryAddress.state ?? 'Unknown',
  //       //         country: deliveryAddress.country ?? 'Unknown',
  //       //         postalCode: deliveryAddress.postalCode ?? 'Unknown',
  //       //         purpose: 'ORDER_DELIVERY',
  //       //         user: { connect: { id: customerId } },
  //       //         createdBy: userId ?? customerId,
  //       //       },
  //       //     });
  //       //   }
  //       // }
  //       const pickupAddressRecord = await upsertAddress(
  //         tx,
  //         customerId,
  //         userId,
  //         data.pickupAddress,
  //         'ORDER_PICKUP',
  //       );
  //       const deliveryAddressRecord = await upsertAddress(
  //         tx,
  //         customerId,
  //         userId,
  //         data.deliveryAddress,
  //         'ORDER_DELIVERY',
  //       );
  //       console.log('Pickup address ready:', pickupAddressRecord);
  //       console.log('Delivery address ready:', deliveryAddressRecord);
  //       console.log('Delivery created:: ');
  //       // Prepare order data
  //       const orderData: any = {
  //         trackingCode: trackingCode,
  //         status: OrderStatus.CREATED,
  //         serviceType: data.serviceType,
  //         fulfillmentType: data.fulfillmentType,
  //         weight: data.weight,
  //         height: data.height,
  //         width: data.width,
  //         length: data.length,
  //         category: data.category,
  //         isFragile: data.isFragile,
  //         shipmentType: data.shipmentType,
  //         shippingScope: data.shippingScope,
  //         pickupDate: data.pickupDate ? new Date(data.pickupDate) : null,
  //         deliveryDate: data.deliveryDate ? new Date(data.deliveryDate) : null,
  //         createdBy: userId ?? customerId,
  //         cost: data.cost,
  //         customerId: customerId,
  //         receiverId: receiverId,
  //         quantity: data.quantity,
  //         // customer: { connect: { id: customerId } },
  //         branchId: data.branchId ? data.branchId : null,
  //         // branch: data.branchId ? { connect: { id: data.branchId } } : undefined,
  //         pickupAddressId: pickupAddressRecord?.id ?? null,
  //         // pickupAddress: pickupAddress ? { connect: { id: pickupAddress.id } } : undefined,
  //         deliveryAddressId: deliveryAddressRecord.id,
  //         // deliveryAddress: { connect: { id: deliveryAddress.id } },
  //       };
  //       // Create order
  //       const order = await tx.order.create({
  //         data: orderData,
  //         include: { pickupAddress: true, deliveryAddress: true },
  //       });
  //       console.log('Order created:: ');
  //       // Create order tracking record
  //       await tx.orderTracking.create({
  //         data: {
  //           orderId: order.id,
  //           status: 'CREATED',
  //           location: pickupAddress?.addressLine ?? 'Customer Home',
  //           updatedBy: userId ?? customerId,
  //           notes: 'Order Created.',
  //         },
  //       });
  //       console.log('Log created:: ');
  //       return order;
  //     },
  //     { timeout: 60000 },
  //   );
  //   // 2️⃣ Trigger async distance & pricing calculation outside transaction
  //   // let origin: { lat: number; lon: number };
  //   // if (order.pickupAddress) {
  //   //   origin = {
  //   //     lat: Number(order.pickupAddress.lat),
  //   //     lon: Number(order.pickupAddress.long),
  //   //   };
  //   // } else {
  //   //   origin = (await this.getBranchCoordinates(data.branchId)) as any;
  //   // }
  //   // const destination = {
  //   //   lat: Number(order.deliveryAddress.lat),
  //   //   lon: Number(order.deliveryAddress.long),
  //   // };
  //   // console.log('before calculating : ', origin, destination);
  //   // console.log('before calculating second : ', this.websocketService);
  //   // console.log(
  //   //   '🧩 websocketService:',
  //   //   this.websocketService?.constructor?.name,
  //   // );
  //   // if (!this.websocketService) {
  //   //   throw new Error('🚨 websocketService is not injected!');
  //   // }
  //   // // Emit WebSocket or background job for async processing
  //   // this.websocketService.emitOrderDistanceCalculation(
  //   //   order.id,
  //   //   origin,
  //   //   destination,
  //   // );
  //   // console.log('Distance and price calculated:: ');
  //   // 3️⃣ Return immediately, transaction is complete
  //   return order;
  // }
  async getOrderCoordinates(orderId: string) {
    return this.prisma.order.findUnique({
      where: { id: orderId },
      select: {
        shippingScope: true,
        serviceType: true,
        customerId: true,
        pickupAddress: {
          select: {
            lat: true,
            long: true,
          },
        },
        deliveryAddress: {
          select: {
            lat: true,
            long: true,
          },
        },
        branch: {
          select: {
            address: {
              select: {
                lat: true,
                long: true,
              },
            },
          },
        },
      },
    });
  }
  constructor(private prisma: PrismaService) {}
  async trackOrder(orderId: string) {
    return this.prisma.orderTracking.findMany({
      where: { orderId },
    });
  }

  async findPrice(orderId: string) {
    return this.prisma.order.findUnique({
      where: { id: orderId },
      select: {
        finalPrice: true,
      },
    });
  }

  async updateRouteSegment(orderId: string, driverId: string) {
    // 1️⃣ Fetch all segments that match
    const segments = await this.prisma.orderRouteSegment.findMany({
      where: { orderId, driverId, endTime: null },
    });

    if (!segments || segments.length === 0) return null;

    // 2️⃣ Update each segment with endTime and actualDuration
    const updatedSegments = await Promise.all(
      segments.map((segment) => {
        const endTime = new Date();
        let actualDurationMin: number | null = null;

        if (segment.startTime) {
          const diffMs = endTime.getTime() - segment.startTime.getTime();
          actualDurationMin = Math.ceil(diffMs / 60000); // convert ms → minutes
        }

        return this.prisma.orderRouteSegment.update({
          where: { id: segment.id },
          data: {
            endTime,
            actualDurationMin,
          },
        });
      }),
    );

    return updatedSegments;
  }

  async createCustomer(customerData: {
    name: string;
    email: string;
    phone: string;
    userId?: string;
  }) {
    return this.prisma.$transaction(async (tx) => {
      // 1️⃣ Create the user
      const user = await tx.user.create({
        data: {
          name: customerData.name,
          email: customerData.email,
          phone: customerData.phone ?? null,
          password: '', // or generate random if needed
          isStaff: false,
          roleId: null,
          createdBy: customerData.userId || 'system',
        },
      });

      // 2️⃣ Create default user preferences
      await tx.userNotificationPreferences.create({
        data: {
          user: { connect: { id: user.id } },
          email: true,
          inApp: true,
          push: false,
        },
      });

      return user;
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
      return this.prisma.$transaction(async (tx) => {
        // 1️⃣ Create the user
        const user = await tx.user.create({
          data: {
            name: customerData.name,
            email: customerData.email,
            phone: customerData.phone ?? null,
            password: '', // or generate random password
            isStaff: false,
            roleId: null,
            createdBy: customerData.userId || 'system',
          },
        });

        // 2️⃣ Initialize user preferences
        await tx.userNotificationPreferences.create({
          data: {
            user: { connect: { id: user.id } },
            email: true,
            inApp: true,
            push: false,
          },
        });

        return user; // return the created user
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
        where: { orderId },
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
        // let pickupAddressRecord: Address | null = null;
        // if (data.pickupAddress) {
        //   // Try to find an existing address with the same lat & long
        //   pickupAddressRecord = await tx.address.findFirst({
        //     where: {
        //       lat: data.pickupAddress.lat,
        //       long: data.pickupAddress.long,
        //       purpose: 'ORDER_PICKUP',
        //       userId: customerId,
        //     },
        //   });

        //   console.log("Pickup address for creating address inside repo .... ::", pickupAddress);

        //   // If not found, create a new one
        //   if (!pickupAddressRecord) {
        //     pickupAddressRecord = await tx.address.create({
        //       data: {
        //         addressLine: pickupAddress.addressLine ?? 'Unknown',
        //         label: pickupAddress.label ?? 'Unknown Home or Office',
        //         lat: data.pickupAddress.lat,
        //         long: data.pickupAddress.long,
        //         city: pickupAddress.city ?? 'Unknown',
        //         state: pickupAddress.state ?? 'Unknown',
        //         country: pickupAddress.country ?? 'Unknown',
        //         postalCode: pickupAddress.postalCode ?? 'Unknown',
        //         purpose: 'ORDER_PICKUP',
        //         user: { connect: { id: customerId } },
        //         createdBy: userId ?? customerId,
        //       },
        //     });
        //   }
        // }

        // console.log('Pickup address ready:', pickupAddressRecord);

        // // Delivery address (similar logic)
        // let deliveryAddressRecord: Address | null = null;
        // if (data.deliveryAddress) {
        //   deliveryAddressRecord = await tx.address.findFirst({
        //     where: {
        //       lat: data.deliveryAddress.lat,
        //       long: data.deliveryAddress.long,
        //       purpose: 'ORDER_DELIVERY',
        //       userId: customerId,
        //     },
        //   });
        //   console.log("Delivery address for creating address inside repo .... ::", deliveryAddress);

        //   if (!deliveryAddressRecord) {
        //     deliveryAddressRecord = await tx.address.create({
        //       data: {
        //         addressLine: deliveryAddress.addressLine ?? 'Unknown',
        //         label: deliveryAddress.label ?? 'Unknown Home or Office',
        //         lat: data.deliveryAddress.lat,
        //         long: data.deliveryAddress.long,
        //         city: deliveryAddress.city ?? 'Unknown',
        //         state: deliveryAddress.state ?? 'Unknown',
        //         country: deliveryAddress.country ?? 'Unknown',
        //         postalCode: deliveryAddress.postalCode ?? 'Unknown',
        //         purpose: 'ORDER_DELIVERY',
        //         user: { connect: { id: customerId } },
        //         createdBy: userId ?? customerId,
        //       },
        //     });
        //   }
        // }

        const pickupAddressRecord = await upsertAddress(
          tx,
          customerId,
          userId,
          data.pickupAddress,
          'ORDER_PICKUP',
        );

        const deliveryAddressRecord = await upsertAddress(
          tx,
          customerId,
          userId,
          data.deliveryAddress,
          'ORDER_DELIVERY',
        );
        console.log('Pickup address ready:', pickupAddressRecord);
        console.log('Delivery address ready:', deliveryAddressRecord);

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
          quantity: data.quantity,
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
      { timeout: 300000 },
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

  async createOrderWithAddressess(
    data: any,
    customerId: string,
    receiverId: string,
    trackingCode: string,
    userId: string,
  ) {
    return this.prisma.$transaction(
      async (tx) => {
        const pickup = await upsertAddress(
          tx,
          customerId,
          userId,
          data.pickupAddress,
          'ORDER_PICKUP',
        );

        const delivery = await upsertAddress(
          tx,
          customerId,
          userId,
          data.deliveryAddress,
          'ORDER_DELIVERY',
        );

        const order = await tx.order.create({
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
            pickupDate: data.pickupDate ? new Date(data.pickupDate) : null,
            deliveryDate: data.deliveryDate
              ? new Date(data.deliveryDate)
              : null,
            createdBy: userId ?? customerId,
            customerId,
            receiverId,
            quantity: data.quantity,
            branchId: data.branchId ?? null,
            pickupAddressId: pickup?.id ?? null,
            deliveryAddressId: delivery.id,
          },
          include: {
            pickupAddress: true,
            deliveryAddress: true,
          },
        });

        await tx.orderTracking.create({
          data: {
            orderId: order.id,
            status: 'CREATED',
            location: pickup?.addressLine ?? 'Customer Home',
            updatedBy: userId ?? customerId,
            notes: 'Order Created.',
          },
        });

        return order;
      },
      { timeout: 300000 },
    );
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
    data: ConfirmPickUpOrderDto,
    location: string,
    updatedBy: string,
  ) {
    const result = await this.prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: data.orderId },
        data: {
          status: 'PICKED_UP',
          pickupConfirmed: true,
          actualPickupDate: new Date(),
        },
        select: {
          id: true,
          trackingCode: true,
          pickupDate: true,
          pickupDriver: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true,
            },
          },
        },
      });

      if (data.podImages && data.podImages.length > 0) {
        for (const img of data.podImages) {
          await tx.podImage.create({
            data: {
              orderId: data.orderId,
              driverId: data.driverId ?? updatedBy,
              url: img.url,
              publicId: img.publicId,
              fileName: img.fileName,
              fileType: img.fileType,
            },
          });
        }
      }

      await this.logOrderStatus(
        tx, // pass the transaction client here
        data.orderId,
        'PICKED_UP',
        location,
        updatedBy,
        'Pickup confirmed by driver',
      );

      return updatedOrder;
    });

    return result;
  }

  async validateOrder(
    orderId: string,
    officerId: string,
    location: string,
    data: any,
  ) {
    const result = await this.prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          ...data,
          status: 'PENDING_APPROVAL',
          validatedBy: officerId,
          validatedAt: new Date(),
          updatedAt: new Date(),
        },
      });

      const parcelApproval = await tx.parcelApproval.create({
        data: {
          orderId,
          status: 'PENDING',
          reason: data.reason,
          decisionBy: officerId,
          decidedAt: new Date(),
          createdBy: officerId,
        },
      });

      const orderLog = await this.logOrderStatus(
        tx, // pass the transaction client
        orderId,
        'PENDING_APPROVAL',
        location,
        officerId,
        'Order validated, pending approval',
      );

      return updatedOrder;
    });
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
    userId: string,
  ) {
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const updatedOrder = await tx.order.update({
          where: { id: order.id },
          data: {
            status: 'APPROVED',
            updatedAt: new Date(),
          },
        });

        await tx.parcelApproval.update({
          where: { orderId: order.id },
          data: {
            status: 'APPROVED',
            reason,
            decisionBy: userId,
            decidedAt: new Date(),
          },
        });

        // If `logOrderStatus` writes to the DB, ensure it uses the transaction `tx`
        await this.logOrderStatus(
          tx,
          order.id,
          'APPROVED',
          location,
          userId,
          `Order approved by Operation Manager`,
        );

        return updatedOrder;
      });
      return result;
    } catch (error) {
      console.error('Transaction failed:', error);
      throw new Error(`Order approval failed: ${error.message}`);
    }
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
      searchableFields: ['trackingCode', 'notes'],
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
          pickupAddress: true,
          deliveryAddress: true,
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
        deliveryAddress: true,
      },
    });
  }
  // Add this method
  async createSegment(orderId: string, segment: any) {
    return this.prisma.orderRouteSegment.create({
      data: {
        ...segment,
        orderId,
      },
    });
  }

  // Example: get order with addresses
  async getOrderByIdWithAddresses(orderId: string) {
    return this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        pickupAddress: true,
        deliveryAddress: true,
        branch: { include: { address: true } },
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
            branchId: true,
          },
        },
        deliveryDriver: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            branchId: true,
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
    const result = await this.prisma.$transaction(async (tx) => {
      // 1️⃣ Update order status
      const updatedOrder = await tx.order.update({
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
          height: true,
          width: true,
          length: true,
          shipmentType: true,
          shippingScope: true,
          isFragile: true,
          isUnusual: true,
          quantity: true,
          weight: true,
          finalPrice: true,
          payment: {
            select: { id: true, amount: true, status: true },
          },
          customer: {
            select: { id: true, name: true, phone: true, email: true },
          },
          receiver: {
            select: { id: true, name: true, phone: true, email: true },
          },
        },
      });

      // 2️⃣ Log status using transaction-aware method
      const logRecord = await this.logOrderStatus(
        tx, // pass the transaction client
        orderId,
        'DROPPED_OFF',
        location,
        updatedBy,
        'Dropoff confirmed.',
      );

      // Return both in one object
      return { updatedOrder, logRecord };
    });

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
          deliveryAddress: {
            select: {
              id: true,
              country: true,
              state: true,
              city: true,
              addressLine: true,
              postalCode: true,
              lat: true,
              long: true,
            },
          },
          weight: true,
          height: true,
          width: true,
          length: true,
          shipmentType: true,
          isUnusual: true,
          unusualReason: true,
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
    prismaOrTx: any,
    orderId: string,
    status: OrderStatus,
    location?: string,
    updatedBy?: string,
    notes?: string,
  ) {
    return prismaOrTx.orderTracking.create({
      data: {
        orderId,
        status,
        location: location ?? null,
        updatedBy: updatedBy ?? null,
        notes: notes ?? null,
        createdAt: new Date(),
      },
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

  async findUserWithBranch(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        branch: {
          select: {
            id: true,
          },
        },
      },
    });
  }

  async getOrdersForSorting(branchId: string) {
    return this.prisma.order.findMany({
      where: {
        dropoffConfirmed: true,
        batchId: null,
        status: {
          notIn: ['CANCELED', 'DELIVERED', 'FAILED', 'EXCEPTION', 'REJECTED'],
        },
        OR: [
          { branchId }, // orders directly assigned to the branch
          { pickupDriver: { branchId } }, // orders where the pickup driver belongs to the branch
        ],
      },
      include: {
        deliveryAddress: {
          select: {
            id: true,
            label: true,
            country: true,
            state: true,
            city: true,
            addressLine: true,
            postalCode: true,
            lat: true,
            long: true,
          },
        },
      },
    });
  }

  async getBatchOrdersForSorting(branchId: string) {
    return this.prisma.batchDispatch.findMany({
      where: {
        destinationBranchId: branchId,
        status: {
          notIn: ['COMPLETED', 'CLOSED', 'CANCELLED'],
        },
      },
      include: {
        orders: {
          select: {
            id: true,
            trackingCode: true,
            shippingScope: true,
            serviceType: true,
            category: true,
            isFragile: true,
            weight: true,
            height: true,
            width: true,
            length: true,
            shipmentType: true,
            isUnusual: true,
            unusualReason: true,
            validatedNotes: true,
            deliveryAddress: {
              select: {
                id: true,
                label: true,
                country: true,
                state: true,
                city: true,
                addressLine: true,
                postalCode: true,
                lat: true,
                long: true,
              },
            },
          },
        },
      },
    });
  }

  async addOnHold(orderIds: string[], reason: string, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Create exception records
      await tx.orderException.createMany({
        data: orderIds.map((orderId) => ({
          orderId,
          reason,
          type: 'ON_HOLD',
          createdBy: userId,
        })),
      });

      // 2. Update order statuses
      await tx.order.updateMany({
        where: { id: { in: orderIds } },
        data: { status: 'ON_HOLD' },
      });

      // 3. Add orderTracking logs for each order
      const trackingEntries = orderIds.map((orderId) => ({
        orderId,
        status: OrderStatus.ON_HOLD,
        updatedBy: userId || 'system',
        notes: `Order placed ON_HOLD. Reason: ${reason}`,
      }));

      await tx.orderTracking.createMany({ data: trackingEntries });

      return { success: true };
    });
  }

  async removeOnHold(orderIds: string[], userId: string) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Delete ON_HOLD exceptions
      await tx.orderException.deleteMany({
        where: {
          orderId: { in: orderIds },
          type: 'ON_HOLD',
        },
      });

      // 2. Update statuses back to PENDING
      await tx.order.updateMany({
        where: { id: { in: orderIds } },
        data: { status: 'PENDING' },
      });

      // 3. Add tracking logs
      const trackingEntries = orderIds.map((orderId) => ({
        orderId,
        status: OrderStatus.PENDING,
        updatedBy: userId,
        notes: 'ON_HOLD removed; order moved back to PENDING state.',
      }));

      await tx.orderTracking.createMany({ data: trackingEntries });

      return { success: true };
    });
  }

  async getOnHoldOrders(id: string) {
    return this.prisma.orderException.findMany({
      where: {
        order: {
          branchId: id,
        },
        type: 'ON_HOLD',
      },
    });
  }

  //   async getOrderForSortingByBranch(branchId: string) {
  //     return this.prisma.order.findMany({
  //       where: {
  //         branchId,
  //         dropoffConfirmed: true,
  //         status: {
  //           notIn: ['CANCELED', 'DELIVERED', 'FAILED', 'EXCEPTION', 'REJECTED'],
  //         },
  //         batchId: null,
  //       },
  //     });
  //   }

  //   async getOrderForSortingByOfficer(branchId: string) {
  //     return this.prisma.order.findMany({
  //       where: {
  //         pickupDriver: {
  //           branchId,
  //         },
  //         dropoffConfirmed: true,
  //         status: {
  //           notIn: ['CANCELED', 'DELIVERED', 'FAILED', 'EXCEPTION', 'REJECTED'],
  //         },
  //         batchId: null,
  //       },
  //     });
  //   }
}
async function upsertAddress(
  tx: any,
  customerId: string,
  userId: string | null,
  addressData: any,
  purpose: 'ORDER_PICKUP' | 'ORDER_DELIVERY',
) {
  if (!addressData) return null;

  const existing = await tx.address.findFirst({
    where: {
      lat: addressData.lat,
      long: addressData.long,
      purpose,
      userId: customerId,
    },
  });

  const dataToApply = {
    addressLine: addressData.addressLine ?? 'Unknown',
    label: addressData.label ?? 'Unknown Home or Office',
    lat: addressData.lat,
    long: addressData.long,
    city: addressData.city ?? 'Unknown',
    state: addressData.state ?? 'Unknown',
    country: addressData.country ?? 'Unknown',
    postalCode: addressData.postalCode ?? 'Unknown',
    purpose,
    user: { connect: { id: customerId } },
    createdBy: userId ?? customerId,
  };

  if (existing) {
    // Prepare update only with non-null fields that have changed
    const updates: Record<string, any> = {};

    for (const [key, value] of Object.entries(addressData)) {
      if (value !== null && value !== undefined && existing[key] !== value) {
        updates[key] = value;
      }
    }

    if (Object.keys(updates).length > 0) {
      console.log(`Updating existing ${purpose} address...`);
      return tx.address.update({
        where: { id: existing.id },
        data: updates,
      });
    }

    console.log(`No updates required for ${purpose} address.`);
    return existing;
  }

  console.log(`Creating new ${purpose} address...`);
  return tx.address.create({ data: dataToApply });
}
