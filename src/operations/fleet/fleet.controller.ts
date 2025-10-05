import { Controller, UseGuards } from '@nestjs/common';
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
import { CheckPermission } from '../../common/decorator/check-permission.decorator';
import { PermissionGuard } from '../../common/permission.guard';
import { PermissionActions } from '../../contracts/permission-actions.enum';

@Controller()
export class FleetMessageController {
  constructor(private readonly usecases: FleetUseCasesImp) {}

  // Create a new vehicle
  // @Public()
  @UseGuards(PermissionGuard)
  @CheckPermission('Fleet', PermissionActions.CREATE)
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
  @UseGuards(PermissionGuard)
  @CheckPermission('Fleet', PermissionActions.READ)
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
  @UseGuards(PermissionGuard)
  @CheckPermission('Fleet', PermissionActions.CREATE)
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
  // @Public()
  @UseGuards(PermissionGuard)
  @CheckPermission('Fleet', PermissionActions.UPDATE)
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
  // @Public()
  @UseGuards(PermissionGuard)
  @CheckPermission('Fleet', PermissionActions.DELETE)
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
  // @Public()
  @UseGuards(PermissionGuard)
  @CheckPermission('Fleet', PermissionActions.CREATE)
  @MessagePattern(PATTERNS.FLEET_ASSIGN_VEHICLE)
  async assignVehicle(@Payload() payload: { data: AssignVehicleDto }) {
    try {
      console.log(payload.data);
      const vehicle = await this.usecases.assignVehicle(payload.data);
      return IResponse.success('Driver assigned successfully', vehicle, null);
    } catch (error) {
      handleCatch(error);
    }
  }

  // Unassign vehicle from a driver
  // @Public()
  @UseGuards(PermissionGuard)
  @CheckPermission('Fleet', PermissionActions.CREATE)
  @MessagePattern(PATTERNS.FLEET_UNASSIGN_VEHICLE)
  async unassignVehicle(@Payload() payload: { vehicleId: string }) {
    try {
      const vehicle = await this.usecases.unassignVehicle(payload.vehicleId);
      return IResponse.success('Driver unassigned successfully', vehicle, null);
    } catch (error) {
      handleCatch(error);
    }
  }

  // Get all vehicles assigned to a driver
  @UseGuards(PermissionGuard)
  @CheckPermission('Fleet', PermissionActions.READ)
  @MessagePattern(PATTERNS.FLEET_GET_DRIVER_VEHICLES)
  async getVehiclesByDriver(@Payload() payload: { driverId: string }) {
    try {
      return this.usecases.getVehiclesByDriver(payload.driverId);
    } catch (error) {
      handleCatch(error);
    }
  }

  // Log vehicle maintenance
  @UseGuards(PermissionGuard)
  @CheckPermission('Fleet', PermissionActions.CREATE)
  @MessagePattern(PATTERNS.FLEET_LOG_MAINTENANCE)
  async logVehicleMaintenance(
    @Payload() payload: { data: VehicleMaintenanceDto },
  ) {
    try {
      const fleetLog = await this.usecases.logVehicleMaintenance(payload.data);
      return IResponse.success('fleetLog added successfully', fleetLog, null);
    } catch (error) {
      handleCatch(error);
    }
  }

  // Get vehicle maintenance history
  @UseGuards(PermissionGuard)
  @CheckPermission('Fleet', PermissionActions.READ)
  @MessagePattern(PATTERNS.FLEET_GET_MAINTENANCE_HISTORY)
  async getMaintenanceHistory(
    @Payload()
    payload: {
      vehicleId: string;
      query?: VehicleMaintenanceQueryDto;
    },
  ) {
    try {
      const fleetLogs = await this.usecases.getVehicleMaintenanceHistory(
        payload.vehicleId,
        payload.query,
      );
      return IResponse.success(
        'fleetLog fetched successfully',
        fleetLogs,
        null,
      );
    } catch (error) {
      handleCatch(error);
    }
  }

  // Get fleet summary / analytics
  @UseGuards(PermissionGuard)
  @CheckPermission('Fleet', PermissionActions.READ)
  @MessagePattern(PATTERNS.FLEET_GET_SUMMARY)
  async getFleetSummary() {
    try {
      const fleetSummary = await this.usecases.getFleetSummary();
      return IResponse.success('Fleet Summary!', fleetSummary, null);
    } catch (error) {
      handleCatch(error);
    }
  }

  // Get available vehicles
  @UseGuards(PermissionGuard)
  @CheckPermission('Fleet', PermissionActions.READ)
  @MessagePattern(PATTERNS.FLEET_GET_AVAILABLE_VEHICLES)
  async getAvailableVehicles() {
    try {
      return this.usecases.getAvailableVehicles();
    } catch (error) {
      handleCatch(error);
    }
  }

  // Get full vehicle history
  @UseGuards(PermissionGuard)
  @CheckPermission('Fleet', PermissionActions.READ)
  @MessagePattern(PATTERNS.FLEET_GET_VEHICLE_HISTORY)
  async getVehicleHistory(@Payload() payload: { vehicleId: string }) {
    try {
      return this.usecases.getVehicleHistory(payload.vehicleId);
    } catch (error) {
      handleCatch(error);
    }
  }

  // Retire a vehicle
  @UseGuards(PermissionGuard)
  @CheckPermission('Fleet', PermissionActions.READ)
  @MessagePattern(PATTERNS.FLEET_RETIRE_VEHICLE)
  async retireVehicle(@Payload() payload: { vehicleId: string }) {
    try {
      return this.usecases.retireVehicle(payload.vehicleId);
    } catch (error) {
      handleCatch(error);
    }
  }

  // Get fleet alerts
  @UseGuards(PermissionGuard)
  @CheckPermission('Fleet', PermissionActions.READ)
  @MessagePattern(PATTERNS.FLEET_GET_ALERTS)
  async getFleetAlerts() {
    try {
      return this.usecases.getFleetAlerts();
    } catch (error) {
      handleCatch(error);
    }
  }

  // Get driver vehicle history
  @UseGuards(PermissionGuard)
  @CheckPermission('Fleet', PermissionActions.READ)
  @MessagePattern(PATTERNS.FLEET_GET_DRIVER_HISTORY)
  async getDriverVehicleHistory(@Payload() payload: { driverId: string }) {
    try {
      return this.usecases.getDriverVehicleHistory(payload.driverId);
    } catch (error) {
      handleCatch(error);
    }
  }
}
