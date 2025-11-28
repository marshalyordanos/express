import { Injectable, Logger } from '@nestjs/common';
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
import { IPagination } from '../../common/types';
import { AppLogger } from '../../common/app-logger.service';
import { json } from 'stream/consumers';
import { ListQueryDto } from 'src/common/query/query.dto';

@Injectable()
export class FleetUseCasesImp implements FleetUsecase {
  constructor(
    private readonly vehicleRepo: VehicleRepository,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext('OperationsService', 'FleetUseCasesImp');
  }

  // Vehicle Management
  async createVehicle(data: CreateVehicleDto): Promise<Vehicle> {
    try {
      this.logger.log(`Creating vehicle with data: ${JSON.stringify(data)}`);

      if (data.driverId) {
        const existingUser = await this.vehicleRepo.findUserById(data.driverId);
        if (!existingUser) {
          this.logger.warn(`Driver not found: ${data.driverId}`);
          throw new RpcException('Driver not found');
        }
      }

      const vehicle = await this.vehicleRepo.createVehicle(data);
      this.logger.log(`Vehicle created successfully with ID: ${vehicle.id}`);
      return vehicle;
    } catch (error) {
      this.logger.error(
        `Error creating vehicle: ${error.message}`,
        error.stack,
      );
      throw new RpcException(error.message || 'Failed to create vehicle');
    }
  }

  async getAllVehicles(
    page = 1,
    pageSize = 10,
    status?: string,
    search?: string,
  ): Promise<{ vehicles: Partial<Vehicle>[]; pagination: IPagination }> {
    try {
      this.logger.log(
        `Fetching vehicles with page: ${page}, pageSize: ${pageSize}, status: ${status}, search: ${search}`,
      );

      const result = await this.vehicleRepo.getAllVehicles(
        page,
        pageSize,
        status,
        search,
      );
      this.logger.log(`Fetched ${result.vehicles.length} vehicles`);
      return result;
    } catch (error) {
      this.logger.error(
        `Error fetching vehicles: ${error.message}`,
        error.stack,
      );
      throw new RpcException(error.message || 'Failed to fetch vehicles');
    }
  }

  async getVehicleById(id: string): Promise<Vehicle | null> {
    try {
      this.logger.log(`Fetching vehicle by ID: ${id}`);

      const vehicle = await this.vehicleRepo.getVehicleById(id);
      if (!vehicle) {
        this.logger.warn(`Vehicle not found: ${id}`);
        throw new RpcException(`Vehicle with ID ${id} not found`);
      }

      this.logger.log(`Vehicle retrieved successfully: ${vehicle.id}`);
      return vehicle;
    } catch (error) {
      this.logger.error(
        `Error fetching vehicle by ID: ${id} and error : ${error.message}`,
        error.stack,
      );
      throw new RpcException(error.message || 'Failed to fetch vehicle');
    }
  }

  async updateVehicle(
    id: string,
    data: Partial<UpdateVehicleDto>,
  ): Promise<Vehicle> {
    try {
      this.logger.log(
        `Updating vehicle ID: ${id} with data: ${JSON.stringify(data)}`,
      );

      const existingVehicle = await this.vehicleRepo.getVehicleById(id);
      if (!existingVehicle) {
        this.logger.warn(`Vehicle not found: ${id}`);
        throw new RpcException(`Vehicle with ID ${id} not found`);
      }

      const updatedVehicle = await this.vehicleRepo.updateVehicle(id, data);
      this.logger.log(`Vehicle updated successfully: ${updatedVehicle.id}`);
      return updatedVehicle;
    } catch (error) {
      this.logger.error(
        `Error updating vehicle ID: ${id} and error : ${error.message}`,
        error.stack,
      );
      throw new RpcException(error.message || 'Failed to update vehicle');
    }
  }

  async deleteVehicle(id: string): Promise<Vehicle> {
    try {
      this.logger.log(`Deleting vehicle ID: ${id}`);

      const existingVehicle = await this.vehicleRepo.getVehicleById(id);
      if (!existingVehicle) {
        this.logger.warn(`Vehicle not found: ${id}`);
        throw new RpcException(`Vehicle with ID ${id} not found`);
      }

      const deletedVehicle = await this.vehicleRepo.deleteVehicle(id);
      this.logger.log(`Vehicle deleted successfully: ${deletedVehicle.id}`);
      return deletedVehicle;
    } catch (error) {
      this.logger.error(
        `Error deleting vehicle ID: ${id} and error : ${error.message}`,
        error.stack,
      );
      throw new RpcException(error.message || 'Failed to delete vehicle');
    }
  }

  // Vehicle Assignment
  async assignVehicle(data: AssignVehicleDto): Promise<Vehicle> {
    try {
      this.logger.log(
        `Assigning vehicle ${data.vehicleId} to driver ${data.driverId}`,
      );

      const user = await this.vehicleRepo.findUserById(data.driverId);
      if (!user) {
        this.logger.warn(`User not found: ${data.driverId}`);
        throw new RpcException(`User ${data.driverId} not found`);
      }

      if (!user.role || user.role.name !== 'DRIVER') {
        this.logger.warn(
          `User ${data.driverId} is not assigned to DRIVER role`,
        );
        throw new RpcException('First assign the user to DRIVER role!');
      }

      const vehicle = await this.vehicleRepo.assignVehicle(data);
      this.logger.log(
        `Vehicle ${vehicle.id} assigned to driver ${user.id} successfully`,
      );
      return vehicle;
    } catch (error) {
      this.logger.error(
        `Error assigning vehicle ${data.vehicleId} to driver ${data.driverId} and error : ${error.message}`,
        error.stack,
      );
      throw new RpcException(error.message || 'Failed to assign vehicle');
    }
  }

  async unassignVehicle(vehicleId: string): Promise<Vehicle> {
    try {
      this.logger.log(`Unassigning vehicle ${vehicleId}`);

      const vehicle = await this.vehicleRepo.getVehicleById(vehicleId);
      if (!vehicle) {
        this.logger.warn(`Vehicle not found: ${vehicleId}`);
        throw new RpcException(`Vehicle ${vehicleId} not found`);
      }

      const result = await this.vehicleRepo.unassignVehicle(vehicleId);
      this.logger.log(`Vehicle ${vehicleId} unassigned successfully`);
      return result;
    } catch (error) {
      this.logger.error(
        `Error unassigning vehicle ${vehicleId} and error : ${error.message}`,
        error.stack,
      );
      throw new RpcException(error.message || 'Failed to unassign vehicle');
    }
  }

  async getVehiclesByDriver(driverId: string): Promise<Vehicle[]> {
    try {
      this.logger.log(`Fetching vehicles for driver ${driverId}`);

      const user = await this.vehicleRepo.findUserById(driverId);
      if (!user) {
        this.logger.warn(`Driver not found: ${driverId}`);
        throw new RpcException(`Driver ${driverId} not found`);
      }

      const vehicles = await this.vehicleRepo.getVehiclesByDriver(driverId);
      this.logger.log(
        `Fetched ${vehicles.length} vehicles for driver ${driverId}`,
      );
      return vehicles;
    } catch (error) {
      this.logger.error(
        `Error fetching vehicles for driver ${driverId} and error : ${error.message}`,
        error.stack,
      );
      throw new RpcException(error.message || 'Failed to fetch vehicles');
    }
  }

  // Vehicle Maintenance
  async logVehicleMaintenance(data: VehicleMaintenanceDto): Promise<FleetLog> {
    try {
      this.logger.log(
        `Logging maintenance for vehicle ${data.vehicleId}`,
        JSON.stringify(data),
      );

      const vehicle = await this.vehicleRepo.getVehicleById(data.vehicleId);
      if (!vehicle) {
        this.logger.warn(`Vehicle not found: ${data.vehicleId}`);
        throw new RpcException(`Vehicle ${data.vehicleId} not found`);
      }

      const log = await this.vehicleRepo.logMaintenance(data);
      this.logger.log(
        `Maintenance logged for vehicle ${data.vehicleId}, log ID: ${log.id}`,
      );
      return log;
    } catch (error) {
      this.logger.error(
        `Error logging maintenance for vehicle ${data.vehicleId} and error : ${error.message}`,
        error.stack,
      );
      throw new RpcException(
        error.message || 'Failed to log vehicle maintenance',
      );
    }
  }

  async getVehicleMaintenanceHistory(
    vehicleId: string,
    query?: VehicleMaintenanceQueryDto,
  ): Promise<FleetLog[]> {
    try {
      this.logger.log(`Fetching maintenance history for vehicle ${vehicleId}`);

      const vehicle = await this.vehicleRepo.getVehicleById(vehicleId);
      if (!vehicle) {
        this.logger.warn(`Vehicle not found: ${vehicleId}`);
        throw new RpcException(`Vehicle ${vehicleId} not found`);
      }

      const history = await this.vehicleRepo.getMaintenanceHistory(
        vehicleId,
        query,
      );
      this.logger.log(
        `Fetched ${history.length} maintenance records for vehicle ${vehicleId}`,
      );
      return history;
    } catch (error) {
      this.logger.error(
        `Error fetching maintenance history for vehicle ${vehicleId} and error : ${error.message}`,
        error.stack,
      );
      throw new RpcException(
        error.message || 'Failed to fetch vehicle maintenance history',
      );
    }
  }
  async getVehicleAllMaintenanceHistory(query?: ListQueryDto) {
    try {
      const history = await this.vehicleRepo.getAllMaintenanceHistory(query);
      this.logger.log(
        `✅ Retrieved ${history?.pagination.total || 0} customers`,
      );

      return history;
    } catch (error) {
      this.logger.error(
        `Error fetching maintenance history for vehicle and error : ${error.message}`,
        error.stack,
      );
      throw new RpcException(
        error.message || 'Failed to fetch vehicle maintenance history',
      );
    }
  }

  // Fleet Analytics & Reporting
  async getFleetSummary(): Promise<any> {
    try {
      this.logger.log('Fetching fleet summary');
      const summary = await this.vehicleRepo.getFleetSummary();
      this.logger.log('Fleet summary fetched successfully');
      return summary;
    } catch (error) {
      this.logger.error(
        `Error fetching fleet summary: ${error.message}`,
        error.stack,
      );
      throw new RpcException(error.message || 'Failed to fetch fleet summary');
    }
  }

  async getAvailableVehicles(): Promise<Vehicle[]> {
    try {
      this.logger.log('Fetching available vehicles');
      const vehicles = await this.vehicleRepo.getAvailableVehicles();
      this.logger.log(`Fetched ${vehicles.length} available vehicles`);
      return vehicles;
    } catch (error) {
      this.logger.error(
        `Error fetching available vehicles: ${error.message}`,
        error.stack,
      );
      throw new RpcException(
        error.message || 'Failed to fetch available vehicles',
      );
    }
  }

  async getVehicleHistory(vehicleId: string): Promise<any> {
    try {
      this.logger.log(`Fetching history for vehicle ${vehicleId}`);
      const vehicle = await this.vehicleRepo.getVehicleById(vehicleId);
      if (!vehicle) {
        this.logger.warn(`Vehicle not found: ${vehicleId}`);
        throw new RpcException(`Vehicle ${vehicleId} not found`);
      }
      const history = await this.vehicleRepo.getVehicleHistory(vehicleId);
      this.logger.log(
        `Fetched ${history.length || 0} history records for vehicle ${vehicleId}`,
      );
      return history;
    } catch (error) {
      this.logger.error(
        `Error fetching history for vehicle ${vehicleId} and error : ${error.message}`,
        error.stack,
      );
      throw new RpcException(
        error.message || 'Failed to fetch vehicle history',
      );
    }
  }

  async retireVehicle(vehicleId: string): Promise<Vehicle> {
    try {
      this.logger.log(`Retiring vehicle ${vehicleId}`);
      const vehicle = await this.vehicleRepo.getVehicleById(vehicleId);
      if (!vehicle) {
        this.logger.warn(`Vehicle not found: ${vehicleId}`);
        throw new RpcException(`Vehicle ${vehicleId} not found`);
      }
      const retired = await this.vehicleRepo.retireVehicle(vehicleId);
      this.logger.log(`Vehicle ${vehicleId} retired successfully`);
      return retired;
    } catch (error) {
      this.logger.error(
        `Error retiring vehicle ${vehicleId} and error : ${error.message}`,
        error.stack,
      );
      throw new RpcException(error.message || 'Failed to retire vehicle');
    }
  }

  async getFleetAlerts(): Promise<FleetLog[]> {
    try {
      this.logger.log('Fetching fleet alerts');
      const alerts = await this.vehicleRepo.getFleetAlerts();
      this.logger.log(`Fetched ${alerts.length} fleet alerts`);
      return alerts;
    } catch (error) {
      this.logger.error(
        `Error fetching fleet alerts: ${error.message}`,
        error.stack,
      );
      throw new RpcException(error.message || 'Failed to fetch fleet alerts');
    }
  }

  async getDriverVehicleHistory(driverId: string): Promise<any> {
    try {
      this.logger.log(`Fetching vehicle history for driver ${driverId}`);
      const user = await this.vehicleRepo.findUserById(driverId);
      if (!user) {
        this.logger.warn(`Driver not found: ${driverId}`);
        throw new RpcException(`Driver ${driverId} not found`);
      }
      const history = await this.vehicleRepo.getDriverVehicleHistory(driverId);
      this.logger.log(`Fetched vehicle history for driver ${driverId}`);
      return history;
    } catch (error) {
      this.logger.error(
        `Error fetching vehicle history for driver ${driverId} and error : ${error.message}`,
        error.stack,
      );
      throw new RpcException(
        error.message || 'Failed to fetch driver vehicle history',
      );
    }
  }
}
