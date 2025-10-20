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