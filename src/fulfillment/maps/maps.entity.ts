import { IsNotEmpty, IsString } from "class-validator";

export class NavigationUpdateDto {
  driverId: string;
  currentLat: number;
  currentLon: number;
  destinationLat: number;
  destinationLon: number;
}

export class NavigationResponseDto {
  driverId: string;
  geometry: string;
  distanceMeters: number;
  durationSec: number;
  steps?: any[];
}

export interface RouteCache {
  optimizationJobId: string;
  routeId: string;
  stops: any[];
  totalDistance: number;
  totalDuration: number;
  lastUpdated: number;
}

export class OrderIdDto {
  @IsNotEmpty({ message: 'orderId is required' })
  @IsString({ message: 'orderId must be a string' })
  orderId: string;
}