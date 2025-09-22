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
  // constructor(
  //   @Inject('FLEET_SERVICE') private readonly fleetClient: ClientProxy,
  // ) {}

  // I Get an error because of that i changed to this way you can uncomment yours and comment mine
  constructor(
    @Inject('USER_SERVICE') private readonly fleetClient: ClientProxy,
  ) {}

  // Assign vehicle to driver
  @Patch('assign-to-driver')
  async assignVehicle(@Req() req, @Body() dto: AssignVehicleDto) {
    const authHeader = req.headers['authorization'] || null;
    console.log(dto);

    return this.fleetClient.send(PATTERNS.FLEET_ASSIGN_VEHICLE, {
      headers: { authorization: authHeader },

      data: dto,
    });
  }

  // Unassign vehicle from driver
  @Patch('unassign/:id')
  async unassignVehicle(@Req() req, @Param('id') id: string) {
    const authHeader = req.headers['authorization'] || null;

    return this.fleetClient.send(PATTERNS.FLEET_UNASSIGN_VEHICLE, {
      headers: { authorization: authHeader },

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
  @Post('maintenance')
  async logMaintenance(@Req() req, @Body() dto: VehicleMaintenanceDto) {
    const authHeader = req.headers['authorization'] || null;
    console.log('auth: ', authHeader);

    return this.fleetClient.send(PATTERNS.FLEET_LOG_MAINTENANCE, {
      headers: { authorization: authHeader },

      data: dto,
    });
  }

  // Get vehicle maintenance history
  @Get('maintenance/:id')
  async getMaintenanceHistory(@Req() req, @Param('id') vehicleId: string) {
    const authHeader = req.headers['authorization'] || null;

    return this.fleetClient.send(PATTERNS.FLEET_GET_MAINTENANCE_HISTORY, {
      headers: { authorization: authHeader },

      vehicleId,
    });
  }

  // Get fleet summary / analytics
  @Get('summary')
  async getFleetSummary(@Req() req) {
    const authHeader = req.headers['authorization'] || null;

    return this.fleetClient.send(PATTERNS.FLEET_GET_SUMMARY, {
      headers: { authorization: authHeader },
    });
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

  // Create a new vehicle
  @Post()
  async createVehicle(@Body() dto: CreateVehicleDto) {
    return this.fleetClient.send(PATTERNS.FLEET_CREATE_VEHICLE, { data: dto });
  }

  // Get all vehicles (with pagination)
  @Get()
  async getAllVehicles(
    @Req() req: Request,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    console.log('=============================: fleet');
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
  async getVehicleById(@Req() req, @Param('id') id: string) {
    const authHeader = req.headers['authorization'] || null;

    return this.fleetClient.send(PATTERNS.FLEET_GET_VEHICLE_BY_ID, {
      headers: { authorization: authHeader },

      id,
    });
  }

  // Update a vehicle
  @Patch(':id')
  async updateVehicle(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateVehicleDto,
  ) {
    const authHeader = req.headers['authorization'] || null;

    return this.fleetClient.send(PATTERNS.FLEET_UPDATE_VEHICLE, {
      headers: { authorization: authHeader },
      id,
      data: dto,
    });
  }

  // Delete a vehicle
  @Delete(':id')
  async deleteVehicle(@Req() req: Request, @Param('id') id: string) {
    const authHeader = req.headers['authorization'] || null;

    return this.fleetClient.send(PATTERNS.FLEET_DELETE_VEHICLE, {
      headers: { authorization: authHeader },
      id,
    });
  }
}
