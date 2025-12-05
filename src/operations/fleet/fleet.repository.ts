import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service'; // Your Prisma client service
import { Vehicle, FleetLog, User, Role } from '@prisma/client';
import {
  CreateVehicleDto,
  UpdateVehicleDto,
  AssignVehicleDto,
  VehicleMaintenanceDto,
  VehicleMaintenanceQueryDto,
  CreateVehicleTypeDto,
} from './fleet.entity';
import { ListQueryDto } from '../../common/query/query.dto';
import { PrismaQueryFeature } from '../../common/query/prisma-query-feature';

@Injectable()
export class VehicleRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ---------------- Vehicle Management ----------------
  async createVehicle(data: CreateVehicleDto): Promise<Vehicle> {
    const { driverId,vehicleTypeId, status, ...vehicleData } = data;
    console.log('vehicleData: ', vehicleData);

    return this.prisma.vehicle.create({
      data: {
        ...vehicleData,
        vehicleType: vehicleTypeId ? { connect: { id: vehicleTypeId } } : undefined,
        status: status || 'ACTIVE',
        driver: driverId ? { connect: { id: driverId } } : undefined,
      },
    });
  }

  async createVehicleType(data: CreateVehicleTypeDto, userId: string) {
    return this.prisma.vehicleType.create({
      data: {
        name: data.name,
        description: data.description,
      },
    });
  }

  async findVehicleType(payload: ListQueryDto) {
    const feature = new PrismaQueryFeature({
      search: payload.search,
      filter: payload.filter,
      sort: payload.sort,
      page: payload.page,
      pageSize: payload.pageSize,
      searchableFields: ['name', 'description'],
      hasNotDate: true,
    });

    const query = feature.getQuery();

    // 1️⃣ Fetch branches with manager & staff count
    const [vehicleTypes, totalVehicleTypes] = await Promise.all([
      this.prisma.vehicleType.findMany({
        ...query,
        where: query.where || {},
        select: {
          id: true,
          name: true,
          description: true,
        },
      }),
      this.prisma.vehicleType.count({ where: query.where || {} }),
    ]);

    return {
      vehicleTypes,
      pagination: feature.getPagination(totalVehicleTypes),
    };
  }
  async findUserById(
    id: string,
  ): Promise<(User & { role: Role | null }) | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });
  }

  async getAllVehicles(payload: ListQueryDto) {
    const feature = new PrismaQueryFeature({
      search: payload.search,
      filter: payload.filter,
      sort: payload.sort,
      page: payload.page,
      pageSize: payload.pageSize,
      searchableFields: ['plateNumber'],
      hasNotDate: true,
    });

    const query = feature.getQuery();

    const results = await Promise.all([
      this.prisma.vehicle.findMany({
        ...query,

        where: query.where || {},
        include: { batchDispatches: true, driver: true, fleetLogs: true },
      }),
      this.prisma.vehicle.count({ where: query.where || {} }),
    ]);

    const models = results[0] || [];
    const total = results[1] || 0;
    return {
      models,
      pagination: feature.getPagination(total),
    };
  }

  async getVehicleById(id: string): Promise<Vehicle | null> {
    return this.prisma.vehicle.findUnique({
      where: { id },
      include: { driver: true },
    });
  }

  async updateVehicle(
    id: string,
    data: Partial<UpdateVehicleDto>,
  ): Promise<Vehicle> {
    return this.prisma.vehicle.update({ where: { id }, data });
  }

  async deleteVehicle(id: string): Promise<Vehicle> {
    return this.prisma.vehicle.delete({ where: { id } });
  }

  // ---------------- Vehicle Assignment ----------------
  async assignVehicle(data: AssignVehicleDto): Promise<Vehicle> {
    return this.prisma.vehicle.update({
      where: { id: data.vehicleId },
      data: { driverId: data.driverId, status: 'ACTIVE' },
    });
  }

  async unassignVehicle(vehicleId: string): Promise<Vehicle> {
    return this.prisma.vehicle.update({
      where: { id: vehicleId },
      data: { driverId: null, status: 'INACTIVE' },
    });
  }

  async getVehiclesByDriver(driverId: string): Promise<Vehicle[]> {
    return this.prisma.vehicle.findMany({ where: { driverId } });
  }

  // ---------------- Vehicle Maintenance ----------------
  async logMaintenance(data: VehicleMaintenanceDto): Promise<FleetLog> {
    return this.prisma.fleetLog.create({
      data: {
        vehicleId: data.vehicleId,
        maintenance: data.maintenance,
        cost: data.cost,
      },
    });
  }

  async getMaintenanceHistory(
    vehicleId: string,
    query?: VehicleMaintenanceQueryDto,
  ): Promise<FleetLog[]> {
    const where: any = { vehicleId };
    if (query?.fromDate) where.date = { gte: query.fromDate };
    if (query?.toDate) where.date = { ...where.date, lte: query.toDate };

    return this.prisma.fleetLog.findMany({ where, orderBy: { date: 'desc' } });
  }
  async getAllMaintenanceHistory(payload: ListQueryDto) {
    const feature = new PrismaQueryFeature({
      search: payload.search,
      filter: payload.filter,
      sort: payload.sort,
      page: payload.page,
      pageSize: payload.pageSize,
      searchableFields: ['maintenance', 'vehicle.plateNumber'],
      hasNotDate: true,
    });

    const query = feature.getQuery();
    if (!query.orderBy || query.orderBy.length === 0) {
      query.orderBy = [{ date: 'desc' }];
    }
    console.log('quest1: ', query);

    const results = await Promise.all([
      this.prisma.fleetLog.findMany({
        ...query,

        where: query.where || {},
        include: { vehicle: true },
      }),
      this.prisma.fleetLog.count({ where: query.where || {} }),
    ]);

    const models = results[0] || [];
    const total = results[1] || 0;
    return {
      models,
      pagination: feature.getPagination(total),
    };
  }

  // ---------------- Fleet Analytics & Reporting ----------------
  async getFleetSummary(): Promise<any> {
    const totalVehicles = await this.prisma.vehicle.count();
    const activeVehicles = await this.prisma.vehicle.count({
      where: { status: 'ACTIVE' },
    });
    const inMaintenance = await this.prisma.vehicle.count({
      where: { status: 'MAINTENANCE' },
    });
    const inactive = await this.prisma.vehicle.count({
      where: { status: 'INACTIVE' },
    });

    return { totalVehicles, activeVehicles, inMaintenance, inactive };
  }

  async getAvailableVehicles(): Promise<Vehicle[]> {
    return this.prisma.vehicle.findMany({
      where: { status: 'ACTIVE', driverId: null },
    });
  }

  // ---------------- Optional / Advanced Features ----------------
  async getVehicleHistory(vehicleId: string): Promise<any> {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: vehicleId },
      include: { fleetLogs: true, driver: true },
    });
    return vehicle;
  }

  async retireVehicle(vehicleId: string): Promise<Vehicle> {
    return this.prisma.vehicle.update({
      where: { id: vehicleId },
      data: { status: 'INACTIVE', driverId: null },
    });
  }

  async getFleetAlerts(): Promise<FleetLog[]> {
    // Example: get vehicles with maintenance logged in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return this.prisma.fleetLog.findMany({
      where: { date: { gte: thirtyDaysAgo } },
      orderBy: { date: 'desc' },
    });
  }

  async getDriverVehicleHistory(driverId: string): Promise<any> {
    return this.prisma.vehicle.findMany({
      where: { driverId },
      include: { fleetLogs: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findUser(userId: string): Promise<User> {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });
  }
}
