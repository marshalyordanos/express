import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LocationType, SegmentType } from '@prisma/client';
import { parse } from 'path';

@Injectable()
export class RouteSegmentHelperRepository {
  constructor(private prisma: PrismaService) {}
  
  async getOrderById(orderId: string) {
    return this.prisma.order.findUnique({
      where: { id: orderId },
      include: { routeSegments: true },
    });
  }
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
            // 'IN_TRANSIT',
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
        pickupConfirmed: false,
        status: {
          in: ['OUT_FOR_DELIVERY', 'ASSIGNED'],
        },
        NOT: {
          status: {
            in: [
              'CREATED',
              'DISPATCHED',
              'PENDING',
              'FAILED',
              'DROPPED_OFF',
              'SUCCESS',
              'IN_TRANSIT',
              'COLLECTED',
              'PENDING_APPROVAL',
              'APPROVED',
              'REJECTED',
              'VALIDATED',
              'DELIVERED',
              'PICKED_UP',
              'CANCELED',
              'EXCEPTION',
            ],
          },
        },
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
        status: { in: ['READY_FOR_PICKUP', 'ASSIGNED', 'OUT_FOR_DELIVERY'] },
        pickupConfirmed: false,
        NOT: {
          status: {
            in: [
              'CREATED',
              'DISPATCHED',
              'PENDING',
              'FAILED',
              'DROPPED_OFF',
              'SUCCESS',
              'IN_TRANSIT',
              'COLLECTED',
              'PENDING_APPROVAL',
              'APPROVED',
              'REJECTED',
              'VALIDATED',
              'DELIVERED',
              'PICKED_UP',
              'CANCELED',
              'EXCEPTION',
            ],
          },
        },
      },
      include: {
        pickupAddress: true,
        deliveryAddress: true,
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
    });
  }

  // 1. Create or Update Active Segment
  async upsertActiveSegment(data: {
    driverId: string;
    orderId?: string; // optional — can be null for inter-order segments
    fromLat: number;
    fromLon: number;
    fromType: LocationType;
    toLat: any;
    toLon: any;
    toType: LocationType;
    segmentType: SegmentType;
    estimatedDistanceKm: number;
    estimatedDurationMin: number;
    sequence: number;
    startNow?: boolean;
  }) {
    const { driverId, orderId, startNow = false } = data;

    // Find current active segment for this driver
    const active = await this.prisma.orderRouteSegment.findFirst({
      where: {
        driverId,
        status: { in: ['PLANNED', 'IN_PROGRESS'] },
        endTime: null,
        sequence: data.sequence - 1,
        ...(orderId ? { orderId } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    if (active) {
      // Just update destination if changed (e.g. rerouting)
      return this.prisma.orderRouteSegment.update({
        where: { id: active.id },
        data: {
          toLat: parseFloat(data.toLat),
          toLon: parseFloat(data.toLon),
          toType: data.toType,
          segmentType: data.segmentType,
          estimatedDistanceKm: data.estimatedDistanceKm,
          estimatedDurationMin: data.estimatedDurationMin + 10,
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
        toLat: parseFloat(data.toLat),
        toLon: parseFloat(data.toLon),
        estimatedDistanceKm: data.estimatedDistanceKm + 10,
        estimatedDurationMin: data.estimatedDurationMin,
        status: startNow ? 'IN_PROGRESS' : 'PLANNED',
        startTime: startNow ? new Date() : null,
        sequence: data.sequence, // will be filled by optimizer if used
      },
    });
  }

  // 2. Complete Current Active Segment
  async completeCurrentSegment(
    driverId: string,
    actualEndLocation: { lat: number; lon: number },
    orderId?: string | null,
    actualDistanceKm?: number,
  ) {
    const segment = await this.prisma.orderRouteSegment.findFirst({
      where: {
        driverId,
        ...(orderId ? { orderId } : {}),
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
}
