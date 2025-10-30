import { Injectable } from '@nestjs/common';
import { ListQueryDto } from '../../common/query/query.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { DriverStatus, DriverType, OptimizationStatus, OptimizationType } from '@prisma/client';

@Injectable()
export class MapsRepository {
  constructor(private prisma: PrismaService) {}
  async createDriverLocation(body: any): Promise<any> {
    return this.prisma.$transaction(async (tx) => {
      const driverLocationLog = await tx.driverLocationLog.create({
        data: {
          driverId: body.driverId,
          latitude: body.latitude,
          longitude: body.longitude,
          speed: body.speed,
          heading: body.heading,
        },
        include: { driver: true },
      });
      const driver = await tx.driver.update({
        where: { userId: body.driverId },
        data: {
          currentLat: body.latitude,
          currentLon: body.longitude,
          updatedAt: new Date(),
        },
      });
    });
  }
  async createDriver(body: any): Promise<any> {
    return this.prisma.driver.create({
      data: {
        user: { connect: { id: body.userId } },
        vehicles: { connect: { id: body.vehicleId } },
        status: DriverStatus.OFFLINE,
        type: DriverType.INTERNAL,
      },
    });
  }

  async updateOptimizationJobStatus(jobId: string, status: OptimizationStatus) {
  return this.prisma.optimizationJob.update({
    where: { id: jobId },
    data: { status },
  });
}

 /** ================== OPTIMIZATION JOB ================== */
  async createOptimizationJob(data: {
    driverId: string;
    jobCode: string;
    type: OptimizationType | string;
    status: OptimizationStatus | string;
    optimizedOrder: any;
    totalDistance: number;
    totalDuration: number;
  }) {
    return this.prisma.optimizationJob.create({
      data: {
        jobCode: data.jobCode,
        type: data.type as OptimizationType,
        status: data.status as OptimizationStatus,
        optimizedOrder: data.optimizedOrder,
        totalDistance: data.totalDistance,
        totalDuration: data.totalDuration,
        driver: { connect: { id: data.driverId } }, 
      },
    });
  }

    /** ================== LOCATION ================== */
  async upsertLocationFromCoords(data: {
  latitude: number;
  longitude: number;
  mapServiceResult?: {
    name?: string;
    address?: string;
    city?: string;
    country?: string;
  };
}) {
  const { latitude, longitude, mapServiceResult } = data;
  const name = mapServiceResult?.name;
  const address = mapServiceResult?.address;
  const city = mapServiceResult?.city;
  const country = mapServiceResult?.country;

  // Try to find existing location by coordinates
  const existing = await this.prisma.location.findFirst({
    where: { latitude, longitude },
  });

  if (existing) {
    // Update existing
    return this.prisma.location.update({
      where: { id: existing.id },
      data: { name, address, city, country },
    });
  }

  // Create new if not found
  return this.prisma.location.create({
    data: { latitude, longitude, name, address, city, country },
  });
}


  async findAddressByCoords(lat: string, long: string) {
    return this.prisma.address.findFirst({
      where: { lat, long },
    });
  }


/** ================== UPDATE ROUTE ================== */
async findRouteByOriginDest(originId: string, destinationId: string) {
  return this.prisma.route.findFirst({
    where: { originId, destinationId },
  });
}

async updateRoute(routeId: string, data: { distanceKm?: number; durationMin?: number; completed?: boolean }) {
  return this.prisma.route.update({
    where: { id: routeId },
    data,
  });
}

  async upsertLocation(data: { latitude: number; longitude: number; name?: string }) {
  let loc = await this.prisma.location.findFirst({
    where: { latitude: data.latitude, longitude: data.longitude },
  });
  if (loc) {
    return this.prisma.location.update({
      where: { id: loc.id },
      data: { name: data.name },
    });
  }
  return this.prisma.location.create({ data });
}

   /** ================== ROUTE ================== */
  async createRoute(data: {
    originId: string;
    destinationId: string;
    distanceKm: number;
    durationMin: number;
    routePath: any;
    optimized: boolean;
    trafficAware: boolean;
    optimizationJobId: string;
  }) {
    return this.prisma.route.create({ data:{
      originId: data.originId,
      destinationId: data.destinationId,
      distanceKm: data.distanceKm,
      durationMin: data.durationMin,
      routePath: data.routePath,
      optimized: data.optimized,
      trafficAware: data.trafficAware,
      optimizationJobs: { connect: { id: data.optimizationJobId } },
    } });
  }

  /** ================== LINK ORDERS TO OPTIMIZATION ================== */
  async linkOrdersToOptimizationJob(optimizationJobId: string, orderIds: string[]) {
    return this.prisma.order.updateMany({
      where: { id: { in: orderIds } },
      data: { optimizationJobId },
    });
  }
  async getDrivers(payload: ListQueryDto): Promise<any> {
    throw new Error('Method not implemented.');
  }
  async getDriverById(id: string): Promise<any> {
    throw new Error('Method not implemented.');
  }

  async findUserById(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
    });
  }

  // get driver location by driverId
  async findDriverById(driverId: string) {
    // find the User with driver relation
    const driver = await this.prisma.driver.findUnique({
      where: { userId: driverId },
      select: {
        id: true,
        currentLon: true,
        currentLat: true,
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!driver || !driver.user) {
      throw new Error(`Driver not found: ${driverId}`);
    }

    // return lat/lon in format your RouteOptimizer expects
    return {
      id: driver.id,
      lat: driver.currentLat,
      lon: driver.currentLon,
    };
  }
  async findOrdersByDriverId(driverId: string) {
    const orders = await this.prisma.order.findMany({
      where: {
        OR: [{ pickupDriverId: driverId }, { deliveryDriverId: driverId }],
        status: {
          in: ['ASSIGNED', 'OUT_FOR_DELIVERY'], 
        },
      },
      select: {
        id: true,
        pickupAddress: {
          select: { lat: true, long: true },
        },
        deliveryAddress: {
          select: { lat: true, long: true },
        },
        fulfillmentType: true, // pickup/delivery
      },
    });

    // map each order to a stop depending on fulfillment type
    const stops = orders.map((o) => {
      let lat: any, lon: any;
      if (o.fulfillmentType === 'PICKUP') {
        lat = o.pickupAddress?.lat;
        lon = o.pickupAddress?.long;
      } else {
        lat = o.deliveryAddress?.lat;
        lon = o.deliveryAddress?.long;
      }
      if (lat == null || lon == null) {
        throw new Error(`Order ${o.id} missing coordinates`);
      }
      return {
        orderId: o.id,
        lat,
        lon,
      };
    });

    return stops;
  }
}
