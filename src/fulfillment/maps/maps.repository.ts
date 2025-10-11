import { Injectable } from '@nestjs/common';
import { ListQueryDto } from '../../common/query/query.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { connect } from 'http2';
import { DriverStatus, DriverType } from '@prisma/client';

@Injectable()
export class MapsRepository {
  constructor(private prisma: PrismaService) {}
  async createDriverLocation(body: any): Promise<any> {
    return this.prisma.$transaction(async (tx) => {
      const driverLocationLog= await tx.driverLocationLog.create({
        data: {
          driverId: body.driverId,
          latitude: body.latitude,
          longitude: body.longitude,
          speed: body.speed,
          heading: body.heading,
        },
        include: { driver: true },
      });
      const driver= await tx.driver.update({
        where: { userId: body.driverId },
        data: {
          currentLat: body.latitude,
          currentLon: body.longitude,
          updatedAt: new Date(),
        },
      })
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
}
