import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { PATTERNS } from '../contracts';
import { ClientProxy } from '@nestjs/microservices';

@Controller('maps')
export class MapGatewayController {
  constructor(
    @Inject('FULFILLMENT_SERVICE') private readonly mapClient: ClientProxy,
  ) {}

  // constructor(private readonly mapsService: DriverLocationService) {}

  //  @Get('nearby-drivers')
  //  async nearbyDrivers(
  //    @Query('lat') lat: string,
  //    @Query('lon') lon: string,
  //    @Query('radius') radius: string,
  //  ) {
  //     console.log('lat', lat, 'lon', lon, 'radius', radius);

  //    return this.mapsService.findNearbyDrivers(
  //      parseFloat(lat),
  //      parseFloat(lon),
  //      parseFloat(radius),
  //    );
  //  }

  @Post('route/:driverId/driver-stop')
  async markStopVisited(@Param('driverId') driverId: string,  @Body('orderId') orderId: string,  @Req() req) {
    const authHeader = req.headers['authorization'] || null;
    return this.mapClient.send(PATTERNS.MAP_MARK_STOP_VISITED, {
      driverId,
      orderId,
      headers: { authorization: authHeader },
    });
  }
  @Get('/route/:driverId/status')
  async getRouteStatus(@Param('driverId') driverId: string, @Req() req) {
    const authHeader = req.headers['authorization'] || null;
    return this.mapClient.send(PATTERNS.MAP_GET_CURRENT_ROUTE_STATUS, {
      driverId,
      headers: { authorization: authHeader },
    });
  }

    @Get('route/:driverId')
  async getRoute(@Param('driverId') driverId: string, @Req() req) {
    const authHeader = req.headers['authorization'] || null;
    return this.mapClient.send(PATTERNS.MAP_GET_ROUTE, {
      driverId,
      headers: { authorization: authHeader },
    });
  }

}
