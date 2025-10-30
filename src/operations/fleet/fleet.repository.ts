import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service'; // Your Prisma client service
import { Vehicle, FleetLog, User, Role } from '@prisma/client';
import {
  CreateVehicleDto,
  UpdateVehicleDto,
  AssignVehicleDto,
  VehicleMaintenanceDto,
  VehicleMaintenanceQueryDto,
} from './fleet.entity';

@Injectable()
export class VehicleRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ---------------- Vehicle Management ----------------
  async createVehicle(data: CreateVehicleDto): Promise<Vehicle> {
    const { driverId, status, ...vehicleData } = data;
    console.log('vehicleData: ', vehicleData);

    return this.prisma.vehicle.create({
      data: {
        ...vehicleData,
        status: status || 'ACTIVE',
        driver: driverId ? { connect: { id: driverId } } : undefined,
      },
    });
  }
  async findUserById(
    id: string,
  ): Promise<(User & { role: Role | null }) | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });
  }

  async getAllVehicles(
    page = 1,
    pageSize = 10,
    status?: string,
    search?: string,
  ): Promise<{
    vehicles: Partial<Vehicle>[];
    pagination: {
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    };
  }> {
    const skip = (page - 1) * pageSize;
    const where: any = {};
    if (status) where.status = status;
    if (search) where.plateNumber = { contains: search, mode: 'insensitive' };

    const [vehicles, total] = await Promise.all([
      this.prisma.vehicle.findMany({
        where,
        skip,
        take: pageSize,
        include: { driver: true },
      }),
      this.prisma.vehicle.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    return {
      vehicles,
      pagination: {
        total,
        page,
        pageSize,
        totalPages,
      },
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
