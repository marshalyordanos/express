import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Inject,
  Delete,
  Req,
  Query,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PATTERNS } from '../contracts';
import {
  CreateVehicleDto,
  UpdateVehicleDto,
  AssignVehicleDto,
  VehicleMaintenanceDto,
} from '../operations/fleet/fleet.entity';
import { firstValueFrom } from 'rxjs';

@Controller('fleet')
export class FleetGatewayController {
  constructor(
    @Inject('FLEET_SERVICE') private readonly fleetClient: ClientProxy,
  ) {}

  // Create a new vehicle
  @Post()
  async createVehicle(@Body() dto: CreateVehicleDto) {
    return this.fleetClient.send(PATTERNS.FLEET_CREATE_VEHICLE, { data: dto });
  }

  // Get all vehicles (with pagination)
  @Get()
  async getAllVehicles(
    @Req() req,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    const authHeader = req.headers['authorization'] || null;

    return this.fleetClient.send(PATTERNS.FLEET_GET_ALL_VEHICLES, {
      headers: { authorization: authHeader },
      page: Number(page),
      pageSize: Number(pageSize),
      search: search || null,
      status: status || null,
    });
  }

  // Get a vehicle by ID
  @Get(':id')
  async getVehicleById(@Param('id') id: string) {
    return this.fleetClient.send(PATTERNS.FLEET_GET_VEHICLE_BY_ID, { id });
  }

  // Update a vehicle
  @Patch(':id')
  async updateVehicle(@Param('id') id: string, @Body() dto: UpdateVehicleDto) {
    return this.fleetClient.send(PATTERNS.FLEET_UPDATE_VEHICLE, {
      id,
      data: dto,
    });
  }

  // Delete a vehicle
  @Delete(':id')
  async deleteVehicle(@Param('id') id: string) {
    return this.fleetClient.send(PATTERNS.FLEET_DELETE_VEHICLE, { id });
  }

  // Assign vehicle to driver
  @Patch(':id/assign')
  async assignVehicle(@Param('id') id: string, @Body() dto: AssignVehicleDto) {
    return this.fleetClient.send(PATTERNS.FLEET_ASSIGN_VEHICLE, {
      vehicleId: id,
      ...dto,
    });
  }

  // Unassign vehicle from driver
  @Patch(':id/unassign')
  async unassignVehicle(@Param('id') id: string) {
    return this.fleetClient.send(PATTERNS.FLEET_UNASSIGN_VEHICLE, {
      vehicleId: id,
    });
  }

  // Get vehicles assigned to a driver
  @Get('driver/:driverId')
  async getVehiclesByDriver(@Param('driverId') driverId: string) {
    return this.fleetClient.send(PATTERNS.FLEET_GET_DRIVER_VEHICLES, {
      driverId,
    });
  }

  // Log vehicle maintenance
  @Post(':id/maintenance')
  async logMaintenance(
    @Param('id') vehicleId: string,
    @Body() dto: VehicleMaintenanceDto,
  ) {
    return this.fleetClient.send(PATTERNS.FLEET_LOG_MAINTENANCE, {
      vehicleId,
      ...dto,
    });
  }

  // Get vehicle maintenance history
  @Get(':id/maintenance')
  async getMaintenanceHistory(@Param('id') vehicleId: string) {
    return this.fleetClient.send(PATTERNS.FLEET_GET_MAINTENANCE_HISTORY, {
      vehicleId,
    });
  }

  // Get latest maintenance record
  @Get(':id/maintenance/latest')
  async getLatestMaintenance(@Param('id') vehicleId: string) {
    return this.fleetClient.send(PATTERNS.FLEET_GET_LATEST_MAINTENANCE, {
      vehicleId,
    });
  }

  // Get fleet summary / analytics
  @Get('summary')
  async getFleetSummary() {
    return this.fleetClient.send(PATTERNS.FLEET_GET_SUMMARY, {});
  }

  // Get fleet status summary
  @Get('status-summary')
  async getStatusSummary() {
    return this.fleetClient.send(PATTERNS.FLEET_GET_STATUS_SUMMARY, {});
  }

  // Get available vehicles
  @Get('available')
  async getAvailableVehicles() {
    return this.fleetClient.send(PATTERNS.FLEET_GET_AVAILABLE_VEHICLES, {});
  }

  // Retire a vehicle
  @Patch(':id/retire')
  async retireVehicle(@Param('id') vehicleId: string) {
    return this.fleetClient.send(PATTERNS.FLEET_RETIRE_VEHICLE, { vehicleId });
  }

  // Get fleet alerts
  @Get('alerts')
  async getFleetAlerts() {
    return this.fleetClient.send(PATTERNS.FLEET_GET_ALERTS, {});
  }

  // Get driver vehicle history
  @Get('driver/:driverId/history')
  async getDriverVehicleHistory(@Param('driverId') driverId: string) {
    return this.fleetClient.send(PATTERNS.FLEET_GET_DRIVER_HISTORY, {
      driverId,
    });
  }
}
