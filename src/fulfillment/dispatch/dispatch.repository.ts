import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  AssignDriverForPickup,
  AssignmentRequestUpsertDto,
  BatchDispatchDto,
  CreateDriver,
} from './dispatch.entity';
import {
  DispatchStatus,
  LocationType,
  OrderStatus,
  Prisma,
  SegmentType,
} from '@prisma/client';
import { ListQueryDto } from '../../common/query/query.dto';
import { PrismaQueryFeature } from '../../common/query/prisma-query-feature';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class DispatchRepository {
  async findOrderUnique(orderId: string) {
    return await this.prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        trackingCode: true,
        pickupDriverId: true,
        deliveryDriverId: true,
        pickupConfirmed: true,
        actualDeliveryAt: true,
        status: true,
        customerId: true,
      },
    });
  }
  async driverCancelOrder(
    updateData: any,
    orderId: string,
    actionTaken: string,
    reason: string,
    userId: string,
  ) {
    return await this.prisma.$transaction(async (tx) => {
      // Update order
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          ...updateData,
          updatedAt: new Date(),
        },
      });

      // Create Exception Log
      await tx.orderException.create({
        data: {
          orderId,
          reason,
          type: actionTaken,
          createdAt: new Date(),
          createdBy: userId,
        },
      });

      return { message: actionTaken, updatedOrder };
    });
  }

  constructor(private prisma: PrismaService) {}

  async findExcludedDrivers(
    orderId: string,
    winnerDriverId: string,
  ): Promise<string[]> {
    const losers = await this.prisma.driverAssignmentRequest.findMany({
      where: {
        orderId,
        driverId: { not: winnerDriverId },
        status: 'EXPIRED', // only include drivers who were expired
      },
      select: {
        driverId: true,
      },
    });

    // return array of driverIds
    return losers.map((l) => l.driverId);
  }
  async findRouteSegmentByOrderId(orderId: string) {
    return this.prisma.orderRouteSegment.findMany({
      where: {
        orderId,
      },
    });
  }

  async findDriverLocation(driverUserId: string) {
    console.log('Looking for driver with userId:', driverUserId);

    return this.prisma.driverLocationLog.findFirst({
      where: {
        driver: {
          userId: driverUserId, // relation filter
        },
      },
      orderBy: { timestamp: 'desc' }, // newest first
      // select: {
      //   lat: true,
      //   lon: true,
      //   speed: true,
      //   heading: true,
      //   status: true,
      //   timestamp: true,
      //   driverId: true,
      // },
    });
  }

  // async assignDriverForPickup(
  //   driverId: string,
  //   orderId: string,
  //   userId: string,
  // ) {
  //   return this.prisma.order.update({
  //     where: { id: orderId },
  //     data: {
  //       pickupDriverId: driverId,
  //       status: 'ASSIGNED', // or maybe 'PICKUP_ASSIGNED' if you want to differentiate stages
  //       pickupAssignedBy: userId,
  //       pickupAssignedAt: new Date(),
  //     },
  //     select: {
  //       id: true,
  //       trackingCode: true,
  //       // status: true,
  //       // serviceType: true,
  //       // fulfillmentType: true,
  //       pickupAddress: {
  //         select: { addressLine: true, city: true },
  //       },
  //       // deliveryAddress: {
  //       //   select: { addressLine: true, city: true },
  //       // },
  //       pickupDate: true,
  //       // deliveryDate: true,
  //       pickupDriver: {
  //         select: {
  //           id: true,
  //           name: true,
  //           phone: true,
  //           email: true,
  //         },
  //       },
  //     },
  //   });
  // }

  // async assignDriverWithRouteSegment(
  //   driverId: string,
  //   orderId: string,
  //   origin: { id?: string; lat?: number; lon?: number },
  //   destination: { id?: string; lat?: number; lon?: number },
  //   distanceMeters: number,
  //   etaMinutes: number,
  //   userId: string,
  // ) {
  //   return this.prisma.$transaction(async (tx) => {
  //     // 1️⃣ Assign driver in order table
  //     const updatedOrder = await tx.order.update({
  //       where: { id: orderId },
  //       data: {
  //         pickupDriverId: driverId,
  //         status: 'ASSIGNED',
  //         pickupAssignedBy: userId,
  //         pickupAssignedAt: new Date(),
  //       },
  //       select: {
  //         id: true,
  //         trackingCode: true,
  //         pickupAddress: { select: { lat: true, long: true, addressLine: true } },
  //         pickupDate: true,
  //         pickupDriverId: true,
  //       },
  //     });

  //     // 2️⃣ Create route segment (driver → pickup)
  //     const routeSegment = await tx.orderRouteSegment.create({
  //       data: {
  //         orderId,
  //         driverId,
  //         originId: origin.id || null,
  //         originLat: origin.lat || null,
  //         originLon: origin.lon || null,
  //         destinationId: destination.id || null,
  //         destinationLat: destination.lat || null,
  //         destinationLon: destination.lon || null,
  //         distanceKm: distanceMeters,
  //         estimatedDurationMin: etaMinutes,
  //         sequence: 1,
  //         createdAt: new Date(),
  //       },
  //     });

  //     return { updatedOrder, routeSegment };
  //   });
  // }

  async assignDriverOnly(driverId: string, orderId: string, userId: string) {
    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        pickupDriverId: driverId,
        status: 'ASSIGNED',
        pickupAssignedBy: userId,
        pickupAssignedAt: new Date(),
      },
      select: {
        id: true,
        trackingCode: true,
        pickupDriverId: true,
        pickupDate: true,
        pickupAddress: { select: { lat: true, long: true, addressLine: true } },
      },
    });
  }

  //   async upsertRouteSegment(
  //   driverId: string,
  //   orderId: string,
  //   origin: { lat: number; lon: number },
  //   destination: { id: string; lat?: number; lon?: number },
  //   distanceMeters: number,
  //   etaMinutes: number,
  //   isStart: boolean = false
  // ) {
  //   // Check if segment exists
  //   const existingSegment = await this.prisma.orderRouteSegment.findFirst({
  //     where: { driverId, orderId },
  //   });

  //   if (existingSegment) {
  //     // Update existing segment, but do NOT overwrite startTime if already set
  //     return this.prisma.orderRouteSegment.update({
  //       where: { id: existingSegment.id },
  //       data: {
  //         originLat: origin.lat,
  //         originLon: origin.lon,
  //         destinationId: destination.id,
  //         destinationLat: destination.lat || null,
  //         destinationLon: destination.lon || null,
  //         distanceKm: distanceMeters,
  //         estimatedDurationMin: etaMinutes + 10,
  //         sequence: 1,
  //         updatedAt: new Date(),
  //         startTime: existingSegment.startTime || (isStart ? new Date() : null),
  //       },
  //     });
  //   } else {
  //     // Create new segment
  //     return this.prisma.orderRouteSegment.create({
  //       data: {
  //         orderId,
  //         driverId,
  //         originLat: origin.lat,
  //         originLon: origin.lon,
  //         destinationId: destination.id,
  //         destinationLat: destination.lat || null,
  //         destinationLon: destination.lon || null,
  //         distanceKm: distanceMeters,
  //         estimatedDurationMin: etaMinutes + 10,
  //         sequence: 1,
  //         createdAt: new Date(),
  //         startTime: isStart ? new Date() : null,
  //       },
  //     });
  //   }
  // }

  // 1. Create or Update Active Segment
  async upsertActiveSegment(data: {
    driverId: string;
    orderId?: string; // optional — can be null for inter-order segments
    fromLat: number;
    fromLon: number;
    fromType: LocationType;
    toLat: number;
    toLon: number;
    toType: LocationType;
    segmentType: SegmentType;
    estimatedDistanceKm: number;
    estimatedDurationMin: number;
    startNow?: boolean;
  }) {
    const { driverId, orderId, startNow = false } = data;

    // Find current active segment for this driver
    const active = await this.prisma.orderRouteSegment.findFirst({
      where: {
        driverId,
        status: { in: ['PLANNED', 'IN_PROGRESS'] },
        endTime: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (active) {
      // Just update destination if changed (e.g. rerouting)
      return this.prisma.orderRouteSegment.update({
        where: { id: active.id },
        data: {
          toLat: data.toLat,
          toLon: data.toLon,
          toType: data.toType,
          segmentType: data.segmentType,
          estimatedDistanceKm: data.estimatedDistanceKm,
          estimatedDurationMin: data.estimatedDurationMin,
          status: startNow ? 'IN_PROGRESS' : active.status,
          startTime: startNow ? new Date() : active.startTime,
        },
      });
    }

    // Create brand new segment
    return this.prisma.orderRouteSegment.create({
      data: {
        orderId: orderId || null,
        driverId,
        segmentType: data.segmentType,
        fromType: data.fromType,
        toType: data.toType,
        fromLat: data.fromLat,
        fromLon: data.fromLon,
        toLat: data.toLat,
        toLon: data.toLon,
        estimatedDistanceKm: data.estimatedDistanceKm,
        estimatedDurationMin: data.estimatedDurationMin,
        status: startNow ? 'IN_PROGRESS' : 'PLANNED',
        startTime: startNow ? new Date() : null,
        sequence: null, // will be filled by optimizer if used
      },
    });
  }

  // 2. Complete Current Active Segment
  async completeCurrentSegment(
    driverId: string,
    actualEndLocation: { lat: number; lon: number },
    actualDistanceKm?: number,
  ) {
    const segment = await this.prisma.orderRouteSegment.findFirst({
      where: {
        driverId,
        status: 'IN_PROGRESS',
        endTime: null,
      },
    });

    if (!segment || !segment.startTime) return null;

    const actualDurationMin = Math.round(
      (new Date().getTime() - segment.startTime.getTime()) / 60000,
    );

    return this.prisma.orderRouteSegment.update({
      where: { id: segment.id },
      data: {
        status: 'COMPLETED',
        endTime: new Date(),
        toLat: actualEndLocation.lat,
        toLon: actualEndLocation.lon,
        actualDistanceKm: actualDistanceKm || segment.estimatedDistanceKm,
        actualDurationMin,
      },
    });
  }

  async confirmDispatch(batchIds: string[], officerId: string) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Update the batch statuses and store officerId
      const updatedBatches = await tx.batchDispatch.updateMany({
        where: { id: { in: batchIds } },
        data: {
          status: 'READY',
          officerId, // record the officer who will responsible
        },
      });

      return updatedBatches;
    });
  }

  async findDriverById(driverId: string) {
    const driver = await this.prisma.driver.findUnique({
      where: { userId: driverId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            branchId: true,
          },
        },
        // assignedOrders: {
        //   where: {
        //     status: { notIn: ['DELIVERED', 'CANCELED'] },
        //   },
        //   select: {
        //     id: true,
        //     trackingCode: true,
        //     status: true,
        //     pickupAddress: {
        //       select: { addressLine: true, city: true },
        //     },
        //     deliveryAddress: {
        //       select: { addressLine: true, city: true },
        //     },
        //   },
        // },
      },
    });

    if (!driver) {
      throw new Error(`Driver with ID ${driverId} not found`);
    }

    return driver;
  }

  async collectBatchByCargoOfficer(batchIds: string[], officerId: string) {
    return this.prisma.$transaction(
      async (tx) => {
        // 1. Update batch status only for batches assigned to this officer
        const collectedBatch = await tx.batchDispatch.updateMany({
          where: {
            id: { in: batchIds },
            officerId, // filter by assigned officer
          },
          data: { status: 'COLLECTED' },
        });

        // 2. Update order status
        const updateOrderStatus = await tx.order.updateMany({
          where: { batchId: { in: batchIds } },
          data: { status: 'DISPATCHED' },
        });
        // 3. Create order tracking/logging for all orders in these batches
        const orders = await tx.order.findMany({
          where: { batchId: { in: batchIds } },
          select: { id: true },
        });

        const orderLogs = orders.map((o) => ({
          orderId: o.id,
          status: 'COLLECTED',
          updatedBy: officerId,
          notes: 'Batch collected by cargo officer',
        }));

        if (orderLogs.length > 0) {
          await this.logBatchOrdersStatus(
            tx,
            batchIds,
            'COLLECTED',
            undefined,
            officerId,
            'Batch collected by cargo officer',
          );
        }
        return collectedBatch;
      },
      {
        timeout: 60000,
      },
    );
  }

  async getDeliveredAndOnGoingDispatches(userId: string): Promise<any> {
    return this.prisma.batchDispatch.findMany({
      where: {
        officerId: userId,
        NOT: {
          status: { in: ['PENDING', 'READY'] },
        },
      },
      select: {
        id: true,
        status: true,
        _count: {
          select: { orders: true },
        },
        awbNumber: true,
        serviceType: true,
        shipmentDate: true,
        scope: true,
        destinationId: true,
        originId: true,
      },
    });
  }

  async cancelDispatch(batchIds: string[]) {
    return this.prisma.batchDispatch.updateMany({
      where: { id: { in: batchIds } },
      data: { status: 'CANCELLED' },
    });
  }

  async confirmPickupByCargoOfficer(batchIds: string[]) {
    return this.prisma.batchDispatch.updateMany({
      where: { id: { in: batchIds } },
      data: { status: 'PICKEDUP' },
    });
  }

  async handoverBatchToAirport(
    batchIds: string[],
    handedById: string,
    options?: {
      method?: string;
      reference?: string;
      notes?: string;
      location: string;
    },
    podImages?: {
      url: string;
      publicId?: string;
      fileName?: string;
      fileType?: string;
    }[],
  ) {
    return this.prisma.$transaction(
      async (tx) => {
        // 1. Update batch status
        const handOveredBatch = await tx.batchDispatch.updateMany({
          where: { id: { in: batchIds } },
          data: { status: 'IN_TRANSIT' },
        });

        // 2. Create BatchHandover record
        await tx.batchHandover.create({
          data: {
            handedById,
            method: options?.method,
            reference: options?.reference,
            notes: options?.notes,
            batches: {
              connect: batchIds.map((id) => ({ id })),
            },
          },
        });

        if (podImages && podImages.length > 0) {
          for (const img of podImages) {
            await tx.podImage.create({
              data: {
                driverId: handedById,
                orderId: null,
                url: img.url,
                publicId: img.publicId,
                fileName: img.fileName,
                fileType: img.fileType,
              },
            });
          }
        }

        await this.logBatchOrdersStatus(
          tx,
          batchIds,
          'IN_TRANSIT',
          options.location,
          handedById,
          options.notes,
        );

        return handOveredBatch;
      },
      { timeout: 60000 },
    );
  }

  async receiveFromAirport(
    batchIds: string[],
    data: {
      receivedById: string;
      method?: string;
      reference?: string;
      notes?: string;
      location: string;
    },
  ) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Update batch statuses
      await tx.batchDispatch.updateMany({
        where: { id: { in: batchIds } },
        data: { status: 'OUT_FOR_BRANCH_TRANSFER' },
      });

      await this.logBatchOrdersStatus(
        tx,
        batchIds,
        'PICKED_UP',
        data.location,
        data.receivedById,
        data.notes,
      );

      // 2. Create handover record
      return tx.batchHandover.create({
        data: {
          handedById: data.receivedById,
          method: data.method,
          reference: data.reference,
          notes: data.notes,
          batches: {
            connect: batchIds.map((id) => ({ id })),
          },
        },
      });
    });
  }

  async assignDriverForDelivery(data: AssignDriverForPickup) {
    return this.prisma.order.update({
      where: { id: data.orderId },
      data: { deliveryDriverId: data.driverId, status: 'OUT_FOR_DELIVERY' },
    });
  }
  // 1. Assign order to driver (no pickup yet)
  async assignOrder(orderId: string, driverId: string, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Update the order → assign to driver
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'ASSIGNED',
          deliveryDriverId: driverId,
          deliveryAssignedAt: new Date(),
          deliveryAssignedBy: userId,
        },
        include: { batch: true }, // include to get batch info
      });

      console.log('batches for order :', updatedOrder);

      // 2. If the order has a batch and it's not closed → close it
      if (updatedOrder.batchId) {
        const batch = await tx.batchDispatch.findUnique({
          where: { id: updatedOrder.batchId },
        });

        if (batch && batch.status !== DispatchStatus.COMPLETED) {
          await tx.batchDispatch.update({
            where: { id: updatedOrder.batchId },
            data: { status: 'COMPLETED' },
          });
        }
      }

      // 3. Log status update
      // await this.logBatchOrdersStatus(
      //   tx,
      //   orderId,
      //   'ASSIGNED',
      //   driverId,
      //   'Order assigned to driver',
      // );

      // 4. Add tracking log
      await tx.orderTracking.create({
        data: {
          orderId,
          status: 'ASSIGNED',
          updatedBy: driverId,
          notes: 'Order assigned to driver for last mile delivery.',
        },
      });

      return updatedOrder;
    });
  }

  // 2. Driver collects order from branch
  async lastMileDelivery(orderId: string, driverId: string, notes?: string) {
    return this.prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { status: 'OUT_FOR_DELIVERY' },
      });

      await tx.orderTracking.create({
        data: {
          orderId,
          status: 'OUT_FOR_DELIVERY',
          updatedBy: driverId,
          notes,
        },
      });

      return updatedOrder;
    });
  }

  // 3. Deliver order to customer
  //  async deliverOrder(
  //   orderId: string,
  //   driverId: string,
  //   notes?: string,
  //   podImages?: {
  //     url: string;
  //     publicId: string;
  //     fileName: string;
  //     fileType: string;
  //   }[],
  // ) {
  //   return this.prisma.$transaction(async (tx) => {
  //     // 🔹 1. Fetch order including delivery address
  //     const order = await tx.order.findUnique({
  //       where: { id: orderId },
  //       include: {
  //         deliveryAddress: true,
  //       },
  //     });

  //     if (!order) {
  //       throw new RpcException(`Order with ID ${orderId} not found.`);
  //     }

  //     // 🔹 2. Ensure it's still in valid state
  //     if (order.status === 'DELIVERED') {
  //       throw new RpcException(
  //         `Order ${orderId} is already marked as delivered.`,
  //       );
  //     }

  //     // 🔹 3. Insert POD images if provided
  //     const savedPodImages = [];
  //     if (podImages && podImages.length > 0) {
  //       for (const img of podImages) {
  //         const pod = await tx.podImage.create({
  //           data: {
  //             driverId,
  //             orderId,
  //             url: img.url,
  //             publicId: img.publicId,
  //             fileName: img.fileName,
  //             fileType: img.fileType,
  //           },
  //         });
  //         savedPodImages.push(pod);
  //       }
  //     }

  //     // 🔹 4. Update order status
  //     const updatedOrder = await tx.order.update({
  //       where: { id: orderId },
  //       data: {
  //         status: 'DELIVERED',
  //         deliveryDate: new Date(),
  //         notes: notes || 'Order delivered successfully.',
  //       },
  //       include: {
  //         deliveryAddress: true,
  //         deliveryDriver: true,
  //         customer: true,
  //       },
  //     });

  //     // 🔹 5. Log delivery completion in tracking
  //     await tx.orderTracking.create({
  //       data: {
  //         orderId,
  //         status: 'DELIVERED',
  //         updatedBy: driverId,
  //         location: updatedOrder.deliveryAddress?.addressLine || 'Unknown location',
  //         notes: notes || 'Order delivered to customer successfully.',
  //       },
  //     });

  //     return { order: updatedOrder, podImages: savedPodImages };
  //   });
  // }
  async deliverOrderWithPodImages(
    orderId: string,
    driverId: string,
    notes?: string,
    podImages?: {
      url: string;
      publicId?: string;
      fileName?: string;
      fileType?: string;
    }[],
  ) {
    return this.prisma.$transaction(async (tx) => {
      // 1️⃣ Fetch order
      const order = await tx.order.findUnique({ where: { id: orderId } });
      if (!order) throw new RpcException(`Order ${orderId} not found`);
      if (order.status === 'DELIVERED')
        throw new RpcException('Already delivered');

      // 2️⃣ Insert POD images
      if (podImages && podImages.length > 0) {
        for (const img of podImages) {
          await tx.podImage.create({
            data: {
              orderId,
              driverId,
              url: img.url,
              publicId: img.publicId,
              fileName: img.fileName,
              fileType: img.fileType,
            },
          });
        }
      }

      // 3️⃣ Update order
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { status: 'DELIVERED', deliveryDate: new Date(), notes },
        include: {
          deliveryAddress: true,
        },
      });

      //     // 🔹 4. Log delivery completion in tracking
      await tx.orderTracking.create({
        data: {
          orderId,
          status: 'DELIVERED',
          updatedBy: driverId,
          location:
            updatedOrder.deliveryAddress?.addressLine || 'Unknown location',
          notes: notes || 'Order delivered to customer successfully.',
        },
      });

      return updatedOrder;
    });
  }

  async completeDelivery(data: AssignDriverForPickup) {
    return this.prisma.order.update({
      where: { id: data.orderId },
      data: { deliveryDriverId: data.driverId, status: 'DELIVERED' },
    });
  }
  async findOrderById(orderId: string) {
    return this.prisma.order.findUnique({
      where: { id: orderId },
      include: { pickupAddress: true },
    });
  }
  async findUserById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findBatches(batchIds: string[], officerId?: string) {
    return this.prisma.batchDispatch.findMany({
      where: {
        id: { in: batchIds },
        ...(officerId && { officerId }), // only include if provided
      },
    });
  }

  async removeDriverFromOrder(orderId: string) {
    return this.prisma.order.update({
      where: { id: orderId },
      data: { deliveryDriverId: null },
    });
  }

  async changeDriverForOrder(orderId: string, driverId: string) {
    return this.prisma.order.update({
      where: { id: orderId },
      data: { deliveryDriverId: driverId },
    });
  }

  async findOrdersByIds(orderIds: string[]) {
    return await this.prisma.order.findMany({
      where: { id: { in: orderIds } },
      include: { deliveryAddress: true, pickupAddress: true },
    });
  }

  async createBatchDispatch(
    dto: BatchDispatchDto,
    batchCode: string,
    userId: string,
  ) {
    return this.prisma.$transaction(
      async (tx) => {
        // Create batch and connect orders
        const batch = await tx.batchDispatch.create({
          data: {
            batchCode,
            scope: dto.scope as any,
            serviceType: dto.serviceType as any,
            category: dto.category,
            isFragile: dto.isFragile ?? false,
            originBranchId: dto.originId, // use originId directly
            destinationBranchId: dto.destinationId, // use destinationId directly
            status: 'PENDING',
            notes: dto.notes,
            createdById: userId,
            driverId: dto.driverId,
            vehicleId: dto.vehicleId,
            awbNumber: dto.awbNumber,
            weight: dto.weight,
            shipmentDate: new Date(dto.shipmentDate),
            orders: {
              connect: dto.orders.map((id) => ({ id })),
            },
          },
          include: {
            orders: {
              select: {
                id: true,
                trackingCode: true,
                status: true,
                serviceType: true,
                fulfillmentType: true,
                category: true,
                isFragile: true,
                shipmentType: true,
                shippingScope: true,
                deliveryAddress: {
                  select: { addressLine: true, city: true },
                },
              },
            },
            createdBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            origin: {
              select: {
                id: true,
                addressLine: true,
                city: true,
                country: true,
              },
            },
            destination: {
              select: {
                id: true,
                addressLine: true,
                city: true,
                country: true,
              },
            },
          },
        });

        // Update each connected order's status
        await tx.order.updateMany({
          where: { id: { in: dto.orders } },
          data: { status: 'DISPATCHED' },
        });

        // Optional: log batch order status
        const orderLogs = await this.logBatchOrdersStatus(
          tx,
          [batch.id],
          'DISPATCHED',
          batch.origin.addressLine || 'Unknown location',
          userId,
          dto.notes,
        );

        return { batch, orderLogs };
      },
      { timeout: 60000 },
    );
  }

  async addOrdersToBatch(
    batchId: string,
    newOrderIds: string[],
    updateData?: Partial<BatchDispatchDto>,
  ) {
    return this.prisma.$transaction(
      async (tx) => {
        const batchUpdate: any = { ...updateData };
        // Connect origin/destination if included in updateData
        if (updateData?.originId) {
          batchUpdate.originBranch = { connect: { id: updateData.originId } };
          delete batchUpdate.originId;
        }
        if (updateData?.destinationId) {
          batchUpdate.destinationBranch = {
            connect: { id: updateData.destinationId },
          };
          delete batchUpdate.destinationId;
        }

        // Update batch and connect new orders
        const updatedBatch = await tx.batchDispatch.update({
          where: { id: batchId },
          data: {
            ...batchUpdate,
            orders: { connect: newOrderIds.map((id) => ({ id })) },
          },
          include: {
            orders: {
              select: {
                id: true,
                trackingCode: true,
                status: true,
                serviceType: true,
                fulfillmentType: true,
                category: true,
                isFragile: true,
                shipmentType: true,
                shippingScope: true,
                deliveryAddress: {
                  select: { addressLine: true, city: true },
                },
              },
            },
            // createdBy: {
            //   select: {
            //     id: true,
            //     name: true,
            //     email: true,
            //   },
            // },
            origin: {
              select: {
                id: true,
                addressLine: true,
                city: true,
                country: true,
              },
            },
            destination: {
              select: {
                id: true,
                addressLine: true,
                city: true,
                country: true,
              },
            },
          },
        });

        // Update order statuses
        const result = await tx.order.updateMany({
          where: { id: { in: newOrderIds } },
          data: { status: 'DISPATCHED' },
        });

        const ordersLog = await this.logBatchOrdersStatus(
          tx,
          [batchId],
          'DISPATCHED',
          updatedBatch.origin.addressLine, // use originId for logs
          updatedBatch.createdById,
          updatedBatch.notes,
        );

        return {
          batch: updatedBatch,
          ordersLog,
          result,
        };
      },
      { timeout: 60000 },
    );
  }

  async findBatchById(batchId: string) {
    return this.prisma.batchDispatch.findUnique({
      where: { id: batchId },
      include: {
        orders: {
          include: {
            deliveryAddress: true,
          },
        },
        origin: true,
      },
    });
  }

  async getBatches(payload: ListQueryDto) {
    const feature = new PrismaQueryFeature({
      search: payload.search,
      filter: payload.filter,
      sort: payload.sort,
      page: payload.page,
      pageSize: payload.pageSize,
      searchableFields: ['batchCode', 'origin', 'destination', 'awbNumber'],
    });

    const query = feature.getQuery();

    // 🔹 If there's a search term, extend query.where.OR with trackingCode search
    if (payload.search) {
      query.where = {
        ...query.where,
        OR: [
          ...(query.where?.OR || []),
          {
            orders: {
              some: {
                trackingCode: { contains: payload.search, mode: 'insensitive' },
              },
            },
          },
        ],
      };
    }

    const results = await Promise.all([
      this.prisma.batchDispatch.findMany({
        ...query,
        where: query.where || {},
        include: {
          orders: true,
          driver: true,
          // vehicle: true,
          createdBy: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.batchDispatch.count({ where: query.where || {} }),
    ]);

    const batches = results[0] || [];
    const total = results[1] || 0;
    return {
      batches,
      pagination: feature.getPagination(total),
    };
  }

  async getOrdersCancelledByDriver(payload: ListQueryDto) {
    const feature = new PrismaQueryFeature({
      search: payload.search,
      filter: payload.filter,
      sort: payload.sort,
      page: payload.page,
      pageSize: payload.pageSize,
      searchableFields: ['reason', 'type', 'orderId'],
    });

    const query = feature.getQuery();

    const where: any = {
      AND: [
        query.where || {},
        {
          type: { In: ['Delivery driver canceled', 'Pickup driver canceled'] }, // If you want only driver-cancel type
        },
      ],
    };

    const [rows, total] = await Promise.all([
      this.prisma.orderException.findMany({
        ...query,
        where,
        select: {
          id: true,
          type: true,
          reason: true,
          createdBy: true,
          createdAt: true,
          order: {
            select: {
              id: true,
              trackingCode: true,
              serviceType: true,
              weight: true,
              length: true,
              width: true,
              height: true,
              shippingScope: true,
              shipmentType: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),

      this.prisma.orderException.count({ where }),
    ]);

    return {
      orders: rows,
      pagination: feature.getPagination(total),
    };
  }

  // New method for batch handover logging
  private async logBatchOrdersStatus(
    tx: Prisma.TransactionClient, // 👈 use transaction client
    batchIds: string | string[],
    status: OrderStatus,
    location?: string,
    updatedBy?: string,
    notes?: string,
  ) {
    // Ensure batchIds is always an array
    const ids = Array.isArray(batchIds) ? batchIds : [batchIds];

    // 1. Find all orders under these batch IDs
    const orders = await tx.order.findMany({
      where: { batchId: { in: ids } },
      select: { id: true },
    });

    if (orders.length === 0) {
      throw new Error(`No orders found for batchIds: ${ids.join(', ')}`);
    }

    // 2. Prepare tracking logs for each order
    const trackingLogs = orders.map((order) => ({
      orderId: order.id,
      status,
      location,
      updatedBy,
      notes,
    }));

    // 3. Create logs in bulk
    await tx.orderTracking.createMany({
      data: trackingLogs,
    });

    return { message: `Tracking logs created for ${orders.length} orders.` };
  }

  async createScan(
    data: {
      orderId: string;
      scannedBy: string;
      valid: boolean;
      notes?: string;
      batchId?: string;
    },
    location: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Create the scan record
      const scan = await tx.orderScan.create({
        data,
      });

      console.log('location: ', location);

      // 2. Create a corresponding tracking log
      await tx.orderTracking.create({
        data: {
          orderId: data.orderId,
          location: location,
          status: data.valid ? 'SUCCESS' : 'EXCEPTION',
          updatedBy: data.scannedBy,
          notes:
            data.notes ??
            (data.valid
              ? 'Order scanned successfully'
              : 'Order scan failed/invalid'),
        },
      });

      return scan;
    });
  }

  async findByTrackingCode(trackingCode: string) {
    return this.prisma.order.findUnique({
      where: { trackingCode },
      include: { deliveryAddress: true },
    });
  }

  // 1️⃣ Find all orders by batch IDs
  async findOrdersByBatchIds(batchIds: string[]) {
    return this.prisma.order.findMany({
      where: { batchId: { in: batchIds } },
      select: {
        id: true,
        trackingCode: true,
        batchId: true,
        branchId: true,
        serviceType: true,
        weight: true,
        length: true,
        width: true,
        height: true,
        deliveryAddress: true,
        shippingScope: true,
        shipmentType: true,
      },
    });
  }

  // 2️⃣ Find all scanned orders by officer for specific batches
  async findScannedOrdersByOfficer(officerId: string, batchIds: string[]) {
    return this.prisma.orderScan.findMany({
      where: {
        scannedBy: officerId,
        batchId: { in: batchIds },
      },
      include: {
        order: true, // include the order details to validate trackingCode, etc.
      },
    });
  }

  // 3️⃣ Find batches by branch ID with optional statuses
  async findBatchesByBranchId(
    branchId: string,
    statuses?: DispatchStatus[] | string[],
  ) {
    return this.prisma.batchDispatch.findMany({
      where: {
        destination: {
          branchId: branchId, // check the branch linked to the address
        },
        status: statuses
          ? { in: statuses.map((s) => s as DispatchStatus) }
          : undefined,
      },
      include: {
        origin: true,
        destination: true,
        orders: true,
      },
    });
  }

  async findBranchById(branchId: string) {
    return this.prisma.branch.findUnique({ where: { id: branchId } });
  }

  async confirmBatchHandoverAutomatic(
    officerId: string,
    handoverMethod?: string,
    reference?: string,
    notes?: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Find all batches where this officer is collecting from airport and status is IN_TRANSIT
      const batches = await tx.batchDispatch.findMany({
        where: {
          officerId,
          status: 'IN_TRANSIT',
        },
      });

      if (batches.length === 0)
        throw new Error('No batches available for confirmation');

      const batchIds = batches.map((b) => b.id);

      // 2. Find all valid scanned orders for these batches
      const validOrders = await tx.orderScan.findMany({
        where: {
          scannedBy: officerId,
          valid: true,
          order: {
            batchId: { in: batchIds },
          },
        },
        select: { orderId: true, batchId: true },
      });

      // 3. Update order statuses
      await tx.order.updateMany({
        where: { id: { in: validOrders.map((o) => o.orderId) } },
        data: { status: 'VALIDATED' },
      });

      // 4. Update batch statuses
      await tx.batchDispatch.updateMany({
        where: { id: { in: batchIds } },
        data: { status: 'ARRIVED_AT_DESTINATION' },
      });

      await this.logBatchOrdersStatus(
        tx,
        batchIds,
        'VALIDATED',
        'At airport',
        officerId,
        notes,
      );

      // 5. Create handover record
      const handover = await tx.batchHandover.create({
        data: {
          handedById: officerId,
          method: handoverMethod,
          reference,
          notes,
          batches: {
            connect: batchIds.map((id) => ({ id })),
          },
        },
      });

      return { handover, confirmedOrders: validOrders.map((o) => o.orderId) };
    });
  }

  async createDriver(data: CreateDriver) {
    return this.prisma.$transaction(async (tx) => {
      // Step 1: Create driver
      const driver = await tx.driver.create({
        data: {
          user: { connect: { id: data.userId } },
          vehicleId: data.vehicleId,
          status: data.status,
          type: data.type,
          currentLat: data.currentLat,
          currentLon: data.currentLong,
          updatedAt: new Date(),
        },
      });

      // Step 2: Create location log
      await tx.driverLocationLog.create({
        data: {
          driverId: driver.id,
          latitude: data.currentLat,
          longitude: data.currentLong,
          speed: 0,
          heading: 0,
        },
      });

      // Step 3: Update vehicle
      await tx.vehicle.update({
        where: { id: data.vehicleId },
        data: { driverId: driver.id },
      });

      return driver;
    });
  }

  async findVehicleById(vehicleId: string) {
    return await this.prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });
  }

  async findDriver(payload: ListQueryDto) {
    // Start building dynamic filters
    const where: any = {
      AND: [],
    };

    // Apply general search (text)
    if (payload.search) {
      where.AND.push({
        OR: [
          { user: { name: { contains: payload.search, mode: 'insensitive' } } },
          {
            user: { email: { contains: payload.search, mode: 'insensitive' } },
          },
          {
            user: { phone: { contains: payload.search, mode: 'insensitive' } },
          },
          {
            vehicles: {
              some: {
                plateNumber: { contains: payload.search, mode: 'insensitive' },
              },
            },
          },
          {
            vehicles: {
              some: {
                model: { contains: payload.search, mode: 'insensitive' },
              },
            },
          },
        ],
      });
    }

    let filters: any = {};
    if (typeof payload.filter === 'string') {
      try {
        filters = JSON.parse(payload.filter);
      } catch {
        filters = {};
      }
    } else if (typeof payload.filter === 'object' && payload.filter !== null) {
      filters = payload.filter;
    }

    // Apply optional filters
    if (filters.status) {
      where.AND.push({ status: filters.status });
    }
    if (filters.type) {
      where.AND.push({ type: filters.type });
    }
    if (filters.vehicleStatus) {
      where.AND.push({
        vehicles: { some: { status: filters.vehicleStatus } },
      });
    }
    if (filters.userId) {
      where.AND.push({ userId: filters.userId });
    }
    if (filters.vehicleId) {
      where.AND.push({
        vehicles: { some: { id: filters.vehicleId } },
      });
    }

    const feature = new PrismaQueryFeature({
      search: payload.search,
      filter: payload.filter,
      sort: payload.sort,
      page: payload.page,
      pageSize: payload.pageSize,
      searchableFields: [
        'user.name',
        'user.email',
        'user.phone',
        'vehicles.plateNumber',
        'vehicles.model',
      ],
    });

    // Construct Prisma query
    const query = {
      ...feature.getQuery(),
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
        vehicles: {
          select: { id: true, plateNumber: true, model: true, status: true },
        },
      },
    };

    // Run queries in parallel transaction
    const [drivers, total] = await this.prisma.$transaction([
      this.prisma.driver.findMany(query),
      this.prisma.driver.count({ where }),
    ]);

    return {
      drivers,
      pagination: feature.getPagination(total),
    };
  }

  // Create or update assignment request
  async upsertAssignmentRequest(data: any) {
    return this.prisma.driverAssignmentRequest.upsert({
      where: {
        orderId_driverId: {
          orderId: data.orderId,
          driverId: data.driverId,
        },
      },
      create: {
        order: { connect: { id: data.orderId } },
        driver: { connect: { id: data.driverId } },
        status: data.status,
        sentAt: data.sentAt,
        expiresAt: data.expiresAt,
        acceptedAt: data.acceptedAt,
      },
      update: {
        status: data.status,
        sentAt: data.sentAt,
        expiresAt: data.expiresAt,
        acceptedAt: data.acceptedAt,
      },
    });
  }

  async expirePendingRequests(orderId: string) {
    return this.prisma.driverAssignmentRequest.updateMany({
      where: {
        orderId,
        status: 'PENDING',
        expiresAt: { lt: new Date() },
      },
      data: { status: 'EXPIRED' },
    });
  }

  async markAccepted(orderId: string, driverId: string) {
    return this.prisma.driverAssignmentRequest.update({
      where: { orderId_driverId: { orderId, driverId } },
      data: {
        status: 'ACCEPTED',
        acceptedAt: new Date(),
      },
    });
  }

  async expireOtherDrivers(orderId: string, driverId: string) {
    return this.prisma.driverAssignmentRequest.updateMany({
      where: {
        orderId,
        driverId: { not: driverId },
        status: 'PENDING',
      },
      data: {
        status: 'EXPIRED',
      },
    });
  }

  async assignOrderAtomic(orderId: string, driverId: string) {
    return this.prisma.order.updateMany({
      where: {
        id: orderId,
        deliveryDriverId: null,
      },
      data: {
        deliveryDriverId: driverId,
        deliveryAssignedAt: new Date(),
        deliveryAssignedBy: driverId,
        status: 'ASSIGNED',
      },
    });
  }

  async expireAllExpiredPending() {
    return this.prisma.driverAssignmentRequest.updateMany({
      where: {
        status: 'PENDING',
        expiresAt: { lt: new Date() },
      },
      data: {
        status: 'EXPIRED',
      },
    });
  }

  // ──────────────────────────────────────────────────────────────
  // Find the next pending task for this driver (pickup or delivery)
  // ──────────────────────────────────────────────────────────────
  // DispatchRepository.ts
  // async findNextPendingOrderForDriver(driverId: string) {
  //   return this.prisma.order.findFirst({
  //     where: {
  //       OR: [{ pickupDriverId: driverId }, { deliveryDriverId: driverId }],
  //       status: {
  //         in: [
  //           'ASSIGNED',
  //           'READY_FOR_PICKUP',
  //           'PICKUP_ATTEMPTED',
  //           'PICKED_UP',
  //           'IN_TRANSIT',
  //           'OUT_FOR_DELIVERY',
  //           'DROPOFF_ATTEMPTED',
  //         ],
  //       },
  //       // Not yet fully delivered
  //       AND: [
  //         { status: { not: 'DELIVERED' } },
  //         { status: { not: 'CANCELED' } },
  //         { status: { not: 'FAILED' } },
  //       ],
  //     },
  //     orderBy: [
  //       { pickupAssignedAt: 'asc' }, // oldest pickup first
  //       { deliveryAssignedAt: 'asc' }, // then oldest delivery
  //       { createdAt: 'asc' },
  //     ],
  //     select: {
  //       id: true,
  //       fulfillmentType: true,
  //       status: true,
  //       pickupAddress: {
  //         select: { lat: true, long: true },
  //       },
  //       deliveryAddress: {
  //         select: { lat: true, long: true },
  //       },
  //       pickupAddressId: true,
  //       deliveryAddressId: true,
  //     },
  //   });
  // }

  // // ──────────────────────────────────────────────────────────────
  // // Get the default/home branch for a driver (you probably already have this logic somewhere)
  // // ──────────────────────────────────────────────────────────────
  // async getDefaultBranchForDriver(driverId: string) {
  //   const driverUser = await this.prisma.user.findUnique({
  //     where: { id: driverId },
  //     select: {
  //       branchId: true,
  //       branch: {
  //         select: {
  //           address: {
  //             select: { lat: true, long: true, id: true },
  //           },
  //         },
  //       },
  //     },
  //   });

  //   if (driverUser?.branch?.address) {
  //     const addr = driverUser.branch.address;
  //     return {
  //       id: addr.id,
  //       lat: parseFloat(addr.lat!),
  //       lon: parseFloat(addr.long!),
  //     };
  //   }

  //   // Fallback: main branch
  //   const mainBranchAddr = await this.prisma.address.findFirst({
  //     where: { purpose: 'BRANCH_LOCATION', branch: { isNot: null } },
  //     orderBy: { createdAt: 'asc' },
  //     select: { id: true, lat: true, long: true },
  //   });

  //   if (!mainBranchAddr || !mainBranchAddr.lat || !mainBranchAddr.long) {
  //     throw new Error('No branch location configured');
  //   }

  //   return {
  //     id: mainBranchAddr.id,
  //     lat: parseFloat(mainBranchAddr.lat),
  //     lon: parseFloat(mainBranchAddr.long),
  //   };
  // }

  async findNextPendingOrderForDriver(driverId: string) {
    return this.prisma.order.findFirst({
      where: {
        OR: [{ pickupDriverId: driverId }, { deliveryDriverId: driverId }],
        status: {
          in: [
            'ASSIGNED',
            'READY_FOR_PICKUP',
            'PICKUP_ATTEMPTED',
            'PICKED_UP',
            'IN_TRANSIT',
            'OUT_FOR_DELIVERY',
            'DROPOFF_ATTEMPTED',
          ],
        },
        AND: [
          { status: { not: 'DELIVERED' } },
          { status: { not: 'CANCELED' } },
          { status: { not: 'FAILED' } },
        ],
      },
      orderBy: [
        { pickupAssignedAt: 'asc' },
        { deliveryAssignedAt: 'asc' },
        { createdAt: 'asc' },
      ],
      select: {
        id: true,
        fulfillmentType: true,
        status: true,
        pickupAddress: { select: { lat: true, long: true } },
        deliveryAddress: { select: { lat: true, long: true } },
        pickupAddressId: true,
        deliveryAddressId: true,
        pickupConfirmed: true,
      },
    });
  }

  async getDefaultBranchForDriver(driverId: string) {
    const driverUser = await this.prisma.user.findUnique({
      where: { id: driverId },
      select: {
        branch: {
          select: {
            address: { select: { lat: true, long: true, id: true } },
          },
        },
      },
    });

    if (driverUser?.branch?.address) {
      const a = driverUser.branch.address;
      return { id: a.id, lat: parseFloat(a.lat!), lon: parseFloat(a.long!) };
    }

    const main = await this.prisma.address.findFirst({
      where: { purpose: 'BRANCH_LOCATION' },
      select: { id: true, lat: true, long: true },
    });

    if (!main) return null;
    return {
      id: main.id,
      lat: parseFloat(main.lat!),
      lon: parseFloat(main.long!),
    };
  }

  async getAllPendingOrdersForDriver(driverId: string) {
    return this.prisma.order.findMany({
      where: {
        OR: [{ pickupDriverId: driverId }, { deliveryDriverId: driverId }],
        status: { in: ['READY_FOR_PICKUP', 'PICKED_UP', 'OUT_FOR_DELIVERY'] },
        NOT: { status: 'DELIVERED' },
      },
      include: {
        pickupAddress: { select: { lat: true, long: true } },
        deliveryAddress: { select: { lat: true, long: true } },
      },
    });
  }

  async getOrderForSmartNextDestinationLevel2(driverId: string) {
    return await this.prisma.order.findMany({
      where: {
        OR: [{ pickupDriverId: driverId }, { deliveryDriverId: driverId }],
        status: { in: ['READY_FOR_PICKUP', 'PICKED_UP', 'OUT_FOR_DELIVERY'] },
        NOT: { status: 'DELIVERED' },
      },
      include: {
        pickupAddress: true,
        deliveryAddress: true,
      },
    });
  }
}
