import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PATTERNS } from '../../contracts';
import { FleetUseCasesImp } from './fleet.usecase.impl';
import {
  CreateVehicleDto,
  UpdateVehicleDto,
  AssignVehicleDto,
  VehicleMaintenanceDto,
  VehicleMaintenanceQueryDto,
} from './fleet.entity';
import { IResponse } from '../../common/types';
import { handleCatch } from '../../common/handleCatch';
import { Public } from '../../common/decorator/public.decorator';

@Controller()
export class FleetMessageController {
  constructor(private readonly usecases: FleetUseCasesImp) {}

  // Create a new vehicle
  @MessagePattern(PATTERNS.FLEET_CREATE_VEHICLE)
  async createVehicle(@Payload() payload: { data: CreateVehicleDto }) {
    try {
      const data = await this.usecases.createVehicle(payload.data);
      return IResponse.success('Vehicles created successfully', data, null);
    } catch (error) {
      console.log('==========: payload:Error ');

      handleCatch(error);
    }
  }

  // Get all vehicles (with pagination)
  @MessagePattern(PATTERNS.FLEET_GET_ALL_VEHICLES)
  async getAllVehicles(@Payload() payload: any) {
    try {
      console.log('=============================: fleet2');

      const { page = 1, pageSize = 10, search, status } = payload;
      const result = await this.usecases.getAllVehicles(
        page,
        pageSize,
        status,
        search,
      );
      return IResponse.success(
        'Vehicles fetched successfully',
        result.vehicles,
        result.pagination,
      );
    } catch (error) {
      handleCatch(error);
    }
  }

  // Get a vehicle by ID
  @MessagePattern(PATTERNS.FLEET_GET_VEHICLE_BY_ID)
  async getVehicleById(@Payload() payload: { id: string }) {
    try {
      const data = await this.usecases.getVehicleById(payload.id);
      return IResponse.success('Vehicle fetched successfully', data, null);
    } catch (error) {
      handleCatch(error);
    }
  }

  // Update vehicle details
  @MessagePattern(PATTERNS.FLEET_UPDATE_VEHICLE)
  async updateVehicle(
    @Payload() payload: { id: string; data: UpdateVehicleDto },
  ) {
    try {
      const data = await this.usecases.updateVehicle(payload.id, payload.data);
      return IResponse.success('Vehicle updated successfully', data, null);
    } catch (error) {
      handleCatch(error);
    }
  }

  // Delete a vehicle
  @MessagePattern(PATTERNS.FLEET_DELETE_VEHICLE)
  async deleteVehicle(@Payload() payload: { id: string }) {
    try {
      await this.usecases.deleteVehicle(payload.id);
      return IResponse.success('Vehicle deleted successfully', null, null);
    } catch (error) {
      handleCatch(error);
    }
  }

  // Assign vehicle to a driver
  @MessagePattern(PATTERNS.FLEET_ASSIGN_VEHICLE)
  async assignVehicle(@Payload() payload: AssignVehicleDto) {
    try {
      return this.usecases.assignVehicle(payload);
    } catch (error) {
      handleCatch(error);
    }
  }

  // Unassign vehicle from a driver
  @MessagePattern(PATTERNS.FLEET_UNASSIGN_VEHICLE)
  async unassignVehicle(@Payload() payload: { vehicleId: string }) {
    try {
      return this.usecases.unassignVehicle(payload.vehicleId);
    } catch (error) {
      handleCatch(error);
    }
  }

  // Get all vehicles assigned to a driver
  @MessagePattern(PATTERNS.FLEET_GET_DRIVER_VEHICLES)
  async getVehiclesByDriver(@Payload() payload: { driverId: string }) {
    try {
      return this.usecases.getVehiclesByDriver(payload.driverId);
    } catch (error) {
      handleCatch(error);
    }
  }

  // Log vehicle maintenance
  @MessagePattern(PATTERNS.FLEET_LOG_MAINTENANCE)
  async logVehicleMaintenance(@Payload() payload: VehicleMaintenanceDto) {
    try {
      return this.usecases.logVehicleMaintenance(payload);
    } catch (error) {
      handleCatch(error);
    }
  }

  // Get vehicle maintenance history
  @MessagePattern(PATTERNS.FLEET_GET_MAINTENANCE_HISTORY)
  async getMaintenanceHistory(
    @Payload()
    payload: {
      vehicleId: string;
      query?: VehicleMaintenanceQueryDto;
    },
  ) {
    try {
      return this.usecases.getVehicleMaintenanceHistory(
        payload.vehicleId,
        payload.query,
      );
    } catch (error) {
      handleCatch(error);
    }
  }

  // Get latest maintenance record
  @MessagePattern(PATTERNS.FLEET_GET_LATEST_MAINTENANCE)
  async getLatestMaintenance(@Payload() payload: { vehicleId: string }) {
    try {
      return this.usecases.getLatestVehicleMaintenance(payload.vehicleId);
    } catch (error) {
      handleCatch(error);
    }
  }

  // Get fleet summary / analytics
  @MessagePattern(PATTERNS.FLEET_GET_SUMMARY)
  async getFleetSummary() {
    try {
      return this.usecases.getFleetSummary();
    } catch (error) {
      handleCatch(error);
    }
  }

  // Get vehicle status summary
  @MessagePattern(PATTERNS.FLEET_GET_STATUS_SUMMARY)
  async getVehicleStatusSummary() {
    try {
      return this.usecases.getVehicleStatusSummary();
    } catch (error) {
      handleCatch(error);
    }
  }

  // Get available vehicles
  @MessagePattern(PATTERNS.FLEET_GET_AVAILABLE_VEHICLES)
  async getAvailableVehicles() {
    try {
      return this.usecases.getAvailableVehicles();
    } catch (error) {
      handleCatch(error);
    }
  }

  // Get full vehicle history
  @MessagePattern(PATTERNS.FLEET_GET_VEHICLE_HISTORY)
  async getVehicleHistory(@Payload() payload: { vehicleId: string }) {
    try {
      return this.usecases.getVehicleHistory(payload.vehicleId);
    } catch (error) {
      handleCatch(error);
    }
  }

  // Retire a vehicle
  @MessagePattern(PATTERNS.FLEET_RETIRE_VEHICLE)
  async retireVehicle(@Payload() payload: { vehicleId: string }) {
    try {
      return this.usecases.retireVehicle(payload.vehicleId);
    } catch (error) {
      handleCatch(error);
    }
  }

  // Get fleet alerts
  @MessagePattern(PATTERNS.FLEET_GET_ALERTS)
  async getFleetAlerts() {
    try {
      return this.usecases.getFleetAlerts();
    } catch (error) {
      handleCatch(error);
    }
  }

  // Get driver vehicle history
  @MessagePattern(PATTERNS.FLEET_GET_DRIVER_HISTORY)
  async getDriverVehicleHistory(@Payload() payload: { driverId: string }) {
    try {
      return this.usecases.getDriverVehicleHistory(payload.driverId);
    } catch (error) {
      handleCatch(error);
    }
  }
}
