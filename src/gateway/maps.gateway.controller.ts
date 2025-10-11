import { Controller, Get, Query } from "@nestjs/common";
import { MapsService } from "../fulfillment/maps/maps.usecase.impl";
import { DriverLocationService } from "../fulfillment/maps/driver-location.service";



@Controller('maps')
export class MapGatewayController {

    constructor(private readonly mapsService: DriverLocationService) {}
   
     @Get('nearby-drivers')
     async nearbyDrivers(
       @Query('lat') lat: string,
       @Query('lon') lon: string,
       @Query('radius') radius: string,
     ) {
        console.log('lat', lat, 'lon', lon, 'radius', radius);
        
       return this.mapsService.findNearbyDrivers(
         parseFloat(lat),
         parseFloat(lon),
         parseFloat(radius),
       );
     }
}