import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  AssignDriverForBatch,
  AssignDriverForPickup,
  BatchDispatchDto,
} from './dispatch.entity';
import { DispatchStatus, ShippingScope, ServiceType } from '@prisma/client';

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
            vehicles: true,
          },
        },
      },
    });
  }

  async confirmDispatch(batchIds: string[]) {
    return this.prisma.batchDispatch.updateMany({
      where: { id: { in: batchIds } },
      data: { status: 'READY' },
    });
  }
  async collectBatchByCargoOfficer(batchIds: string[], officerId: string) {
    return this.prisma.batchDispatch.updateMany({
      where: { id: { in: batchIds } },
      data: { officerId, status: 'COLLECTED' },
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

  async deliverBatchToAirport(batchIds: string[]) {
    return this.prisma.batchDispatch.updateMany({
      where: { id: { in: batchIds } },
      data: { status: 'IN_TRANSIT' },
    });
  }

  async recieveBatchFromAirport(batchIds: string[]) {
    return this.prisma.batchDispatch.updateMany({
      where: { id: { in: batchIds } },
      data: { status: 'OUT_FOR_BRANCH_TRANSFER' },
    });
  }

  async assignDriverForDelivery(data: AssignDriverForPickup) {
    return this.prisma.order.update({
      where: { id: data.orderId },
      data: { driverId: data.driverId, status: 'OUT_FOR_DELIVERY' },
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
          vehicleId: dto.vehicleId,
          awbNumber: dto.awbNumber,
          weight: dto.weight,
          orders: {
            connect: dto.orders.map((id) => ({ id })),
          },
        },
        include: {
          orders: true,
          driver: true,
          vehicle: true,
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
      console.log('Result in transaction :', result);

      return batch;
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
          vehicle: true,
        },
      });

      // Update order statuses
      const result = await tx.order.updateMany({
        where: { id: { in: newOrderIds } },
        data: { status: 'DISPATCHED' },
      });
      console.log('Result in transaction :', result);

      return updatedBatch;
    });
  }

  async findBatchById(batchId: string) {
    return this.prisma.batchDispatch.findUnique({
      where: { id: batchId },
      include: { orders: true },
    });
  }

  async getBatches(params: {
    status?: DispatchStatus;
    scope?: ShippingScope;
    serviceType?: ServiceType;
    fragile?: boolean;
    unusual?: boolean;
    search?: string;
    page: number;
    pageSize: number;
  }) {
    console.log('params', params);

    const {
      status,
      scope,
      serviceType,
      fragile,
      unusual,
      search,
      page,
      pageSize,
    } = params;

    console.log('scope', scope);

    const skip = (page - 1) * pageSize;

    const where: any = {};

    if (status) where.status = status;
    if (scope) where.scope = scope;
    if (serviceType) where.serviceType = serviceType;
    if (fragile !== undefined) where.isFragile = fragile;
    if (unusual !== undefined) where.orders = { some: { isUnusual: unusual } };

    if (search) {
      where.OR = [
        { batchCode: { contains: search, mode: 'insensitive' } },
        { origin: { contains: search, mode: 'insensitive' } },
        { destination: { contains: search, mode: 'insensitive' } },
        { awbNumber: { contains: search, mode: 'insensitive' } },
        {
          orders: {
            some: { trackingCode: { contains: search, mode: 'insensitive' } },
          },
        },
      ];
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.batchDispatch.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: { orders: true, driver: true, vehicle: true, createdBy: true },
      }),
      this.prisma.batchDispatch.count({ where }),
    ]);

    return { data, total };
  }
}
