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
  CreateVehicleTypeDto,
} from './fleet.entity';
import { IResponse } from '../../common/types';
import { handleCatch } from '../../common/handleCatch';
import { CheckPermission } from '../../common/decorator/check-permission.decorator';
import { PermissionGuard } from '../../common/permission.guard';
import { PermissionActions } from '../../contracts/permission-actions.enum';
import { RateLimitGuard } from '../../common/rate-limit.guard';
import { ListQueryDto } from 'src/common/query/query.dto';

@Controller()
export class FleetMessageController {
  constructor(private readonly usecases: FleetUseCasesImp) {}

  // Create a new vehicle
  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Fleet', PermissionActions.CREATE)
  @MessagePattern(PATTERNS.FLEET_CREATE_VEHICLE)
  async createVehicle(@Payload() payload: { data: CreateVehicleDto }) {
    const data = await this.usecases.createVehicle(payload.data);
    return IResponse.success('Vehicles created successfully', data, null);
  }


    @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Fleet', PermissionActions.CREATE)
  @MessagePattern(PATTERNS.FLEET_CREATE_VEHICLE_TYPE)
  async createVehicleType(@Payload() payload: { data: CreateVehicleTypeDto , user: any}) {
    const userId = payload.user?.sub
    const data = await this.usecases.createVehicleType(payload.data, userId);
    return IResponse.success('Vehicles Type created successfully', data, null);


  }

    @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Fleet', PermissionActions.CREATE)
  @MessagePattern(PATTERNS.FLEET_GET_ALL_VEHICLES_TYPE)
  async getVehicleType(@Payload() payload: { query: ListQueryDto;  user: any}) {
    const userId = payload.user?.sub
    const data = await this.usecases.getVehicleTypes(payload.query);
    return IResponse.success('Vehicles Type fetched successfully', data, null);


  }
  // Get all vehicles (with pagination)
  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Fleet', PermissionActions.READ)
  @MessagePattern(PATTERNS.FLEET_GET_ALL_VEHICLES)
  async getAllVehicles(@Payload() payload: any) {
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
  }

  // Get a vehicle by ID
  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Fleet', PermissionActions.CREATE)
  @MessagePattern(PATTERNS.FLEET_GET_VEHICLE_BY_ID)
  async getVehicleById(@Payload() payload: { id: string }) {
    const data = await this.usecases.getVehicleById(payload.id);
    return IResponse.success('Vehicle fetched successfully', data, null);
  }

  // Update vehicle details
  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Fleet', PermissionActions.UPDATE)
  @MessagePattern(PATTERNS.FLEET_UPDATE_VEHICLE)
  async updateVehicle(
    @Payload() payload: { id: string; data: UpdateVehicleDto },
  ) {
    const data = await this.usecases.updateVehicle(payload.id, payload.data);
    return IResponse.success('Vehicle updated successfully', data, null);
  }

  // Delete a vehicle
  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Fleet', PermissionActions.DELETE)
  @MessagePattern(PATTERNS.FLEET_DELETE_VEHICLE)
  async deleteVehicle(@Payload() payload: { id: string }) {
    await this.usecases.deleteVehicle(payload.id);
    return IResponse.success('Vehicle deleted successfully', null, null);
  }

  // Assign vehicle to a driver
  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Fleet', PermissionActions.CREATE)
  @MessagePattern(PATTERNS.FLEET_ASSIGN_VEHICLE)
  async assignVehicle(@Payload() payload: { data: AssignVehicleDto }) {
    const vehicle = await this.usecases.assignVehicle(payload.data);
    return IResponse.success('Driver assigned successfully', vehicle, null);
  }

  // Unassign vehicle from a driver
  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Fleet', PermissionActions.CREATE)
  @MessagePattern(PATTERNS.FLEET_UNASSIGN_VEHICLE)
  async unassignVehicle(@Payload() payload: { vehicleId: string }) {
    const vehicle = await this.usecases.unassignVehicle(payload.vehicleId);
    return IResponse.success('Driver unassigned successfully', vehicle, null);
  }

  // Get all vehicles assigned to a driver
  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Fleet', PermissionActions.READ)
  @MessagePattern(PATTERNS.FLEET_GET_DRIVER_VEHICLES)
  async getVehiclesByDriver(@Payload() payload: { driverId: string }) {
    const vehicles = await this.usecases.getVehiclesByDriver(payload.driverId);
    return IResponse.success('Vehicles fetched successfully', vehicles, null);
  }

  // Log vehicle maintenance
  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Fleet', PermissionActions.CREATE)
  @MessagePattern(PATTERNS.FLEET_LOG_MAINTENANCE)
  async logVehicleMaintenance(
    @Payload() payload: { data: VehicleMaintenanceDto },
  ) {
    const fleetLog = await this.usecases.logVehicleMaintenance(payload.data);
    return IResponse.success('fleetLog added successfully', fleetLog, null);
  }

  // Get vehicle maintenance history
  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Fleet', PermissionActions.READ)
  @MessagePattern(PATTERNS.FLEET_GET_MAINTENANCE_HISTORY)
  async getMaintenanceHistory(
    @Payload()
    payload: {
      vehicleId: string;
      query?: VehicleMaintenanceQueryDto;
    },
  ) {
    const fleetLogs = await this.usecases.getVehicleMaintenanceHistory(
      payload.vehicleId,
      payload.query,
    );
    return IResponse.success('fleetLog fetched successfully', fleetLogs, null);
  }

  // Get fleet summary / analytics
  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Fleet', PermissionActions.READ)
  @MessagePattern(PATTERNS.FLEET_GET_SUMMARY)
  async getFleetSummary() {
    const fleetSummary = await this.usecases.getFleetSummary();
    return IResponse.success('Fleet Summary!', fleetSummary, null);
  }

  // Get available vehicles
  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Fleet', PermissionActions.READ)
  @MessagePattern(PATTERNS.FLEET_GET_AVAILABLE_VEHICLES)
  async getAvailableVehicles() {
    const availableVehicle = await this.usecases.getAvailableVehicles();
    return IResponse.success(
      'Available Vehicles Fetched Successfully.',
      availableVehicle,
      null,
    );
  }

  // Get full vehicle history
  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Fleet', PermissionActions.READ)
  @MessagePattern(PATTERNS.FLEET_GET_VEHICLE_HISTORY)
  async getVehicleHistory(@Payload() payload: { vehicleId: string }) {
    const vehicleHistory = await this.usecases.getVehicleHistory(
      payload.vehicleId,
    );
    return IResponse.success(
      'Vehicle History Fetched Successfully.',
      vehicleHistory,
      null,
    );
  }

  // Retire a vehicle
  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Fleet', PermissionActions.READ)
  @MessagePattern(PATTERNS.FLEET_RETIRE_VEHICLE)
  async retireVehicle(@Payload() payload: { vehicleId: string }) {
    const retireVehicle = await this.usecases.retireVehicle(payload.vehicleId);
    return IResponse.success(
      'Retire Vehicle Successfully.',
      retireVehicle,
      null,
    );
  }

  // Get fleet alerts
  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Fleet', PermissionActions.READ)
  @MessagePattern(PATTERNS.FLEET_GET_ALERTS)
  async getFleetAlerts() {
    const alerts = await this.usecases.getFleetAlerts();
    return IResponse.success(
      'Fleet Alerts Fetched Successfully.',
      alerts,
      null,
    );
  }

  // Get driver vehicle history
  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Fleet', PermissionActions.READ)
  @MessagePattern(PATTERNS.FLEET_GET_DRIVER_HISTORY)
  async getDriverVehicleHistory(@Payload() payload: { driverId: string }) {
    const vehicleHistory = await this.usecases.getDriverVehicleHistory(
      payload.driverId,
    );
    return IResponse.success(
      'Driver Vehicle History Fetched Successfully.',
      vehicleHistory,
      null,
    );
  }
}
