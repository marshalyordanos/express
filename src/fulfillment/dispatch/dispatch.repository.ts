import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AssignDriverForPickup, BatchDispatchDto } from './dispatch.entity';
import {
  DispatchStatus,
  ShippingScope,
  ServiceType,
  OrderStatus,
  Prisma,
} from '@prisma/client';
import { ListQueryDto } from '../../common/query/query.dto';
import { PrismaQueryFeature } from '../../common/query/prisma-query-feature';

@Injectable()
export class DispatchRepository {
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
            // vehicles: true,
          },
        },
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

  async collectBatchByCargoOfficer(batchIds: string[], officerId: string) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Update batch status only for batches assigned to this officer
      const updatedBatches = await tx.batchDispatch.updateMany({
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
      return { updatedBatches, updateOrderStatus, orderLogs };
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
  ) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Update batch status
      const updatedBatches = await tx.batchDispatch.updateMany({
        where: { id: { in: batchIds } },
        data: { status: 'IN_TRANSIT' },
      });

      // 2. Create BatchHandover record
      const handover = await tx.batchHandover.create({
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

      await this.logBatchOrdersStatus(
        tx,
        batchIds,
        'IN_TRANSIT',
        options.location,
        handedById,
        options.notes,
      );

      return { updatedBatches, handover };
    });
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
      data: { driverId: data.driverId, status: 'OUT_FOR_DELIVERY' },
    });
  }
  // 1. Assign order to driver (no pickup yet)
  async assignOrder(orderId: string, driverId: string) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Update the order → assign to driver
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { status: 'ASSIGNED', driverId },
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
  async deliverOrder(trackingCode: string, driverId: string, notes?: string) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { trackingCode } });

      const updatedOrder = await tx.order.update({
        where: { trackingCode },
        data: { status: 'DELIVERED', deliveryDate: new Date(), notes },
      });

      await tx.orderTracking.create({
        data: {
          orderId: order.id,
          status: 'DELIVERED',
          updatedBy: driverId,
          location: order.deliveryAddress,
          notes: notes || 'Order delivered to customer successfully.',
        },
      });

      // Optional: store POD
      // if (podUrl) {
      //   await tx.payment.update({
      //     where: { orderId: order.id },
      //     data: { transactionId: podUrl }, // or another field for POD
      //   });
      // }

      return updatedOrder;
    });
  }

  async completeDelivery(data: AssignDriverForPickup) {
    return this.prisma.order.update({
      where: { id: data.orderId },
      data: { driverId: data.driverId, status: 'DELIVERED' },
    });
  }
  async findOrderById(orderId: string) {
    return this.prisma.order.findUnique({
      where: { id: orderId },
    });
  }
  async findUserById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findBatches(batchIds: string[]) {
    return this.prisma.batchDispatch.findMany({
      where: { id: { in: batchIds } },
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

  async findOrdersByIds(orderIds: string[]) {
    return await this.prisma.order.findMany({
      where: { id: { in: orderIds } },
    });
  }

  async createBatchDispatch(dto: BatchDispatchDto, batchCode: string) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Create the batch and connect orders
      const batch = await tx.batchDispatch.create({
        data: {
          batchCode,
          scope: dto.scope as any,
          serviceType: dto.serviceType as any,
          category: dto.category,
          isFragile: dto.isFragile ?? false,
          origin: dto.origin,
          destination: dto.destination,
          status: 'PENDING',
          notes: dto.notes,
          createdById: dto.createdById,
          driverId: dto.driverId,
          // vehicleId: dto.vehicleId,
          awbNumber: dto.awbNumber,
          weight: dto.weight,
          shipmentDate: new Date(dto.shipmentDate),
          orders: {
            connect: dto.orders.map((id) => ({ id })),
          },
        },
        include: {
          orders: true,
          driver: true,
          // vehicle: true,
          createdBy: true,
        },
      });

      // 2. Update each connected order's status to DISPATCHED
      const result = await tx.order.updateMany({
        where: {
          id: { in: dto.orders },
        },
        data: {
          status: 'DISPATCHED',
        },
      });
      const orderLogs = await this.logBatchOrdersStatus(
        tx,
        [batch.id],
        'DISPATCHED',
        dto.origin,
        dto.createdById,
        dto.notes,
      );
      console.log('Result in transaction :', result);

      return { batch, orderLogs, result };
    });
  }

  async addOrdersToBatch(
    batchId: string,
    newOrderIds: string[],
    updateData?: Partial<BatchDispatchDto>,
  ) {
    return this.prisma.$transaction(async (tx) => {
      // Update batch info if provided
      const updatedBatch = await tx.batchDispatch.update({
        where: { id: batchId },
        data: {
          ...updateData,
          orders: { connect: newOrderIds.map((id) => ({ id })) },
        },
        include: {
          orders: true,
          driver: true,
          // vehicle: true,
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
        'PICKED_UP',
        updatedBatch.origin,
        updatedBatch.createdById,
        updatedBatch.notes,
      );

      return {
        batch: updatedBatch,
        ordersLog,
        result,
      };
    });
  }

  async findBatchById(batchId: string) {
    return this.prisma.batchDispatch.findUnique({
      where: { id: batchId },
      include: { orders: true },
    });
  }

  async getBatches(payload: ListQueryDto) {
    console.log('params', payload);

    const feature = new PrismaQueryFeature({
      search: payload.search,
      filter: payload.filter,
      sort: payload.sort,
      page: payload.page,
      pageSize: payload.pageSize,
      searchableFields: ['batchCode', 'origin', 'destination', 'awbNumber'],
    });

    const query = feature.getQuery();
    console.log('quest1: ', query);

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
      total,
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

  async createScan(data: {
    orderId: string;
    scannedBy: string;
    valid: boolean;
    notes?: string;
    batchId?: string;
    location: string;
  }) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Create the scan record
      const scan = await tx.orderScan.create({
        data,
      });

      // 2. Create a corresponding tracking log
      await tx.orderTracking.create({
        data: {
          orderId: data.orderId,
          location: data.location,
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
        destination: branchId, // assuming destination is branchId
        status: statuses
          ? { in: statuses.map((s) => s as DispatchStatus) }
          : undefined,
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
}
