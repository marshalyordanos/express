import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { PATTERNS } from '../contracts';
import { ClientProxy } from '@nestjs/microservices';
import * as jwt from 'jsonwebtoken';
import { OrderIdDto } from '../fulfillment/maps/maps.entity';

@Controller('maps')
export class MapGatewayController {
  constructor(
    @Inject('FULFILLMENT_SERVICE') private readonly mapClient: ClientProxy,
  ) {}

  // constructor(private readonly mapsService: DriverLocationService) {}
  
  @Get('nearby-drivers')
  async nearbyDrivers(
    @Query('lat') lat: string,
    @Query('lon') lon: string,
    @Query('radius') radius: string,
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
    console.log('lat', lat, 'lon', lon, 'radius', radius);

    return this.mapClient.send(PATTERNS.MAP_NEARBY_DRIVERS, {
      lat: parseFloat(lat),
      lon: parseFloat(lon),
      radius: parseFloat(radius),
      headers: { authorization: authHeader },
      user: decodedUser, // ✅ send user info
      ip,
    });
  }

  
  @Post('route/:driverId/driver-stop')
  async markStopVisited(
    @Param('driverId') driverId: string,
    @Body() dto: OrderIdDto,
    @Req() req,
  ) {

    const { orderId } = dto;
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
    return this.mapClient.send(PATTERNS.MAP_MARK_STOP_VISITED, {
      driverId,
      orderId,
      headers: { authorization: authHeader },
      user: decodedUser, // ✅ send user info
      ip,
    });
  }
  @Get('/route/:driverId/status')
  async getRouteStatus(@Param('driverId') driverId: string, @Req() req) {
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
    return this.mapClient.send(PATTERNS.MAP_GET_CURRENT_ROUTE_STATUS, {
      driverId,
      headers: { authorization: authHeader },
      user: decodedUser, // ✅ send user info
      ip,
    });
  }

  @Get('route/:driverId')
  async getRoute(@Param('driverId') driverId: string, @Req() req) {
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
    return this.mapClient.send(PATTERNS.MAP_GET_ROUTE, {
      driverId,
      headers: { authorization: authHeader },
      user: decodedUser, // ✅ send user info
      ip,
    });
  }
}
