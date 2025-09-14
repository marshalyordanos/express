import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { FleetUsecase } from './fleet.usecase';
import { VehicleRepository } from './fleet.repository';
import {
  CreateVehicleDto,
  UpdateVehicleDto,
  AssignVehicleDto,
  VehicleMaintenanceDto,
  VehicleMaintenanceQueryDto,
} from './fleet.entity';
import { Vehicle, FleetLog } from '@prisma/client';
import { IPagination } from 'src/common/types';

@Injectable()
export class FleetUseCasesImp implements FleetUsecase {
  constructor(private readonly vehicleRepo: VehicleRepository) {}

  // Vehicle Management
  async createVehicle(data: CreateVehicleDto): Promise<Vehicle> {
    return this.vehicleRepo.createVehicle(data);
  }

  async getAllVehicles(
    page = 1,
    pageSize = 10,
    status?: string,
    search?: string,
  ): Promise<{ vehicles: Partial<Vehicle>[]; pagination: IPagination }> {
    return this.vehicleRepo.getAllVehicles(page, pageSize, status, search);
  }

  async getVehicleById(id: string): Promise<Vehicle | null> {
    return this.vehicleRepo.getVehicleById(id);
  }

  async updateVehicle(
    id: string,
    data: Partial<UpdateVehicleDto>,
  ): Promise<Vehicle> {
    return this.vehicleRepo.updateVehicle(id, data);
  }

  async deleteVehicle(id: string): Promise<Vehicle> {
    return this.vehicleRepo.deleteVehicle(id);
  }

  // Vehicle Assignment
  async assignVehicle(data: AssignVehicleDto): Promise<Vehicle> {
    return this.vehicleRepo.assignVehicle(data);
  }

  async unassignVehicle(vehicleId: string): Promise<Vehicle> {
    return this.vehicleRepo.unassignVehicle(vehicleId);
  }

  async getVehiclesByDriver(driverId: string): Promise<Vehicle[]> {
    return this.vehicleRepo.getVehiclesByDriver(driverId);
  }

  // Vehicle Maintenance
  async logVehicleMaintenance(data: VehicleMaintenanceDto): Promise<FleetLog> {
    return this.vehicleRepo.logMaintenance(data);
  }

  async getVehicleMaintenanceHistory(
    vehicleId: string,
    query?: VehicleMaintenanceQueryDto,
  ): Promise<FleetLog[]> {
    return this.vehicleRepo.getMaintenanceHistory(vehicleId, query);
  }

  async getLatestVehicleMaintenance(
    vehicleId: string,
  ): Promise<FleetLog | null> {
    return this.vehicleRepo.getLatestMaintenance(vehicleId);
  }

  // Fleet Analytics & Reporting
  async getFleetSummary(): Promise<any> {
    return this.vehicleRepo.getFleetSummary();
  }

  async getVehicleStatusSummary(): Promise<{ [status: string]: number }> {
    return this.vehicleRepo.getVehicleStatusSummary();
  }

  async getAvailableVehicles(): Promise<Vehicle[]> {
    return this.vehicleRepo.getAvailableVehicles();
  }

  // Optional / Advanced Features
  async getVehicleHistory(vehicleId: string): Promise<any> {
    return this.vehicleRepo.getVehicleHistory(vehicleId);
  }

  async retireVehicle(vehicleId: string): Promise<Vehicle> {
    return this.vehicleRepo.retireVehicle(vehicleId);
  }

  async getFleetAlerts(): Promise<FleetLog[]> {
    return this.vehicleRepo.getFleetAlerts();
  }

  async getDriverVehicleHistory(driverId: string): Promise<any> {
    return this.vehicleRepo.getDriverVehicleHistory(driverId);
  }
}
