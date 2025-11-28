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
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PATTERNS } from '../contracts';
import {
  CreateVehicleDto,
  UpdateVehicleDto,
  AssignVehicleDto,
  VehicleMaintenanceDto,
} from '../operations/fleet/fleet.entity';
import * as jwt from 'jsonwebtoken';
import { SanitizePipe } from '../common/sanitize.pipe';
import { ListQueryDto } from '../common/query/query.dto';

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
    let token = req.headers['authorization']?.replace('Bearer ', '') || null;

    const forwarded = (req.headers['x-forwarded-for'] as string) || '';
    const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
    let decodedUser = null;
    try {
      decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
      // decodedUser = this.jwtService.verify(token);
    } catch (err) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    console.log(dto);

    return this.fleetClient.send(PATTERNS.FLEET_ASSIGN_VEHICLE, {
      headers: { authorization: authHeader },
      user: decodedUser, // ✅ send user info
      ip,

      data: dto,
    });
  }

  // Unassign vehicle from driver
  @Patch('unassign/:id')
  async unassignVehicle(@Req() req, @Param('id') id: string) {
    const authHeader = req.headers['authorization'] || null;
    let token = req.headers['authorization']?.replace('Bearer ', '') || null;

    const forwarded = (req.headers['x-forwarded-for'] as string) || '';
    const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
    let decodedUser = null;
    try {
      decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
      // decodedUser = this.jwtService.verify(token);
    } catch (err) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }

    return this.fleetClient.send(PATTERNS.FLEET_UNASSIGN_VEHICLE, {
      headers: { authorization: authHeader },
      user: decodedUser, // ✅ send user info
      ip,

      vehicleId: id,
    });
  }

  // Get vehicles assigned to a driver
  @Get('driver/:driverId')
  async getVehiclesByDriver(@Param('driverId') driverId: string, @Req() req) {
    const authHeader = req.headers['authorization'] || null;
    let token = req.headers['authorization']?.replace('Bearer ', '') || null;

    const forwarded = (req.headers['x-forwarded-for'] as string) || '';
    const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
    let decodedUser = null;
    try {
      decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
      // decodedUser = this.jwtService.verify(token);
    } catch (err) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    return this.fleetClient.send(PATTERNS.FLEET_GET_DRIVER_VEHICLES, {
      driverId,
      headers: { authorization: authHeader },
      user: decodedUser, // ✅ send user info
      ip,
    });
  }

  // Log vehicle maintenance
  @Post('maintenance')
  async logMaintenance(@Req() req, @Body() dto: VehicleMaintenanceDto) {
    const authHeader = req.headers['authorization'] || null;
    let token = req.headers['authorization']?.replace('Bearer ', '') || null;

    const forwarded = (req.headers['x-forwarded-for'] as string) || '';
    const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
    let decodedUser = null;
    try {
      decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
      // decodedUser = this.jwtService.verify(token);
    } catch (err) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    console.log('auth: ', authHeader);

    return this.fleetClient.send(PATTERNS.FLEET_LOG_MAINTENANCE, {
      headers: { authorization: authHeader },
      user: decodedUser, // ✅ send user info
      ip,

      data: dto,
    });
  }

  @Get('maintenance')
  async getAllMaintenanceHistory(@Query() query: ListQueryDto, @Req() req) {
    const authHeader = req.headers['authorization'] || null;
    let token = req.headers['authorization']?.replace('Bearer ', '') || null;

    const forwarded = (req.headers['x-forwarded-for'] as string) || '';
    const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
    let decodedUser = null;
    try {
      decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
      // decodedUser = this.jwtService.verify(token);
    } catch (err) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }

    return this.fleetClient.send(PATTERNS.FLEET_GET_All_MAINTENANCE_HISTORY, {
      headers: { authorization: authHeader },
      user: decodedUser, // ✅ send user info
      ip,

      query,
    });
  }

  // Get vehicle maintenance history
  @Get('maintenance/:id')
  async getMaintenanceHistory(@Req() req, @Param('id') vehicleId: string) {
    const authHeader = req.headers['authorization'] || null;
    let token = req.headers['authorization']?.replace('Bearer ', '') || null;

    const forwarded = (req.headers['x-forwarded-for'] as string) || '';
    const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
    let decodedUser = null;
    try {
      decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
      // decodedUser = this.jwtService.verify(token);
    } catch (err) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }

    return this.fleetClient.send(PATTERNS.FLEET_GET_MAINTENANCE_HISTORY, {
      headers: { authorization: authHeader },
      user: decodedUser, // ✅ send user info
      ip,

      vehicleId,
    });
  }

  // Get fleet summary / analytics
  @Get('summary')
  async getFleetSummary(@Req() req) {
    const authHeader = req.headers['authorization'] || null;
    let token = req.headers['authorization']?.replace('Bearer ', '') || null;

    const forwarded = (req.headers['x-forwarded-for'] as string) || '';
    const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
    let decodedUser = null;
    try {
      decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
      // decodedUser = this.jwtService.verify(token);
    } catch (err) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }

    return this.fleetClient.send(PATTERNS.FLEET_GET_SUMMARY, {
      headers: { authorization: authHeader },
      user: decodedUser, // ✅ send user info
      ip,
    });
  }

  // Get available vehicles
  @Get('available')
  async getAvailableVehicles(@Req() req) {
    const authHeader = req.headers['authorization'] || null;
    let token = req.headers['authorization']?.replace('Bearer ', '') || null;

    const forwarded = (req.headers['x-forwarded-for'] as string) || '';
    const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
    let decodedUser = null;
    try {
      decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
      // decodedUser = this.jwtService.verify(token);
    } catch (err) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    return this.fleetClient.send(PATTERNS.FLEET_GET_AVAILABLE_VEHICLES, {
      headers: { authorization: authHeader },
      user: decodedUser, // ✅ send user info
      ip,
    });
  }

  // Retire a vehicle
  @Patch(':id/retire')
  async retireVehicle(@Param('id') vehicleId: string, @Req() req) {
    const authHeader = req.headers['authorization'] || null;
    let token = req.headers['authorization']?.replace('Bearer ', '') || null;

    const forwarded = (req.headers['x-forwarded-for'] as string) || '';
    const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
    let decodedUser = null;
    try {
      decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
      // decodedUser = this.jwtService.verify(token);
    } catch (err) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    return this.fleetClient.send(PATTERNS.FLEET_RETIRE_VEHICLE, {
      vehicleId,
      headers: { authorization: authHeader },
      user: decodedUser, // ✅ send user info
      ip,
    });
  }

  // Get fleet alerts
  @Get('alerts')
  async getFleetAlerts(@Req() req) {
    const authHeader = req.headers['authorization'] || null;
    let token = req.headers['authorization']?.replace('Bearer ', '') || null;

    const forwarded = (req.headers['x-forwarded-for'] as string) || '';
    const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
    let decodedUser = null;
    try {
      decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
      // decodedUser = this.jwtService.verify(token);
    } catch (err) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    return this.fleetClient.send(PATTERNS.FLEET_GET_ALERTS, {
      headers: { authorization: authHeader },
      user: decodedUser, // ✅ send user info
      ip,
    });
  }

  // Get driver vehicle history
  @Get('driver/:driverId/history')
  async getDriverVehicleHistory(
    @Param('driverId') driverId: string,
    @Req() req,
  ) {
    const authHeader = req.headers['authorization'] || null;
    let token = req.headers['authorization']?.replace('Bearer ', '') || null;

    const forwarded = (req.headers['x-forwarded-for'] as string) || '';
    const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
    let decodedUser = null;
    try {
      decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
      // decodedUser = this.jwtService.verify(token);
    } catch (err) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    return this.fleetClient.send(PATTERNS.FLEET_GET_DRIVER_HISTORY, {
      driverId,
      headers: { authorization: authHeader },
      user: decodedUser, // ✅ send user info
      ip,
    });
  }

  // Create a new vehicle
  @Post()
  async createVehicle(@Body() dto: CreateVehicleDto, @Req() req) {
    const authHeader = req.headers['authorization'] || null;
    let token = req.headers['authorization']?.replace('Bearer ', '') || null;

    const forwarded = (req.headers['x-forwarded-for'] as string) || '';
    const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
    let decodedUser = null;
    try {
      decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
      // decodedUser = this.jwtService.verify(token);
    } catch (err) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    return this.fleetClient.send(PATTERNS.FLEET_CREATE_VEHICLE, {
      data: dto,
      headers: { authorization: authHeader },
      user: decodedUser, // ✅ send user info
      ip,
    });
  }

  //needs Sanitize
  // Get all vehicles (with pagination)
  @Get()
  async getAllVehicles(
    @Req() req,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    console.log('=============================: fleet');
    const authHeader = req.headers['authorization'] || null;
    let token = req.headers['authorization']?.replace('Bearer ', '') || null;

    const forwarded = (req.headers['x-forwarded-for'] as string) || '';
    const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
    let decodedUser = null;
    try {
      decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
      // decodedUser = this.jwtService.verify(token);
    } catch (err) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }

    return this.fleetClient.send(PATTERNS.FLEET_GET_ALL_VEHICLES, {
      headers: { authorization: authHeader },
      user: decodedUser, // ✅ send user info
      ip,
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
    let token = req.headers['authorization']?.replace('Bearer ', '') || null;

    const forwarded = (req.headers['x-forwarded-for'] as string) || '';
    const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
    let decodedUser = null;
    try {
      decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
      // decodedUser = this.jwtService.verify(token);
    } catch (err) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }

    return this.fleetClient.send(PATTERNS.FLEET_GET_VEHICLE_BY_ID, {
      headers: { authorization: authHeader },
      user: decodedUser, // ✅ send user info
      ip,

      id,
    });
  }

  // Update a vehicle
  @Patch(':id')
  async updateVehicle(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: UpdateVehicleDto,
  ) {
    const authHeader = req.headers['authorization'] || null;
    let token = req.headers['authorization']?.replace('Bearer ', '') || null;

    const forwarded = (req.headers['x-forwarded-for'] as string) || '';
    const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
    let decodedUser = null;
    try {
      decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
      // decodedUser = this.jwtService.verify(token);
    } catch (err) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }

    return this.fleetClient.send(PATTERNS.FLEET_UPDATE_VEHICLE, {
      headers: { authorization: authHeader },
      user: decodedUser, // ✅ send user info
      ip,
      id,
      data: dto,
    });
  }

  // Delete a vehicle
  @Delete(':id')
  async deleteVehicle(@Req() req, @Param('id') id: string) {
    const authHeader = req.headers['authorization'] || null;
    let token = req.headers['authorization']?.replace('Bearer ', '') || null;

    const forwarded = (req.headers['x-forwarded-for'] as string) || '';
    const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
    let decodedUser = null;
    try {
      decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
      // decodedUser = this.jwtService.verify(token);
    } catch (err) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }

    return this.fleetClient.send(PATTERNS.FLEET_DELETE_VEHICLE, {
      headers: { authorization: authHeader },
      user: decodedUser, // ✅ send user info
      ip,
      id,
    });
  }
}
