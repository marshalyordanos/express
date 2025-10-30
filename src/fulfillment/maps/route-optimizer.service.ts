import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { MapsService } from './maps.service'; // adjust import path
type LatLon = { lat: number; lon: number };
type Stop = { orderId: string; lat: number; lon: number; [k: string]: any };
type Route = {
  routeId: string;
  driverId: string;
  stops: any[];
  orderedStopIds: string[];
  geometry: any | null;
  distanceMeters: number;
  durationSec: number | null;
  segments: any[];
  generatedAt: number;
  strategy: string;
};

type RouteLike = Partial<Route> & { stops: any[]; geometry?: any };


@Injectable()
export class RouteOptimizerService {
  private readonly logger = new Logger(RouteOptimizerService.name);

  constructor(
    @Inject(forwardRef(() => MapsService))
    private readonly mapsService: MapsService,
  ) {}

  /**
   * Main entry: compute optimized route for driver.
   * - driverLocation: current driver lat/lon
   * - stops: array of stops (orderId, lat, lon, optional metadata)
   *
   * Returns a route object: { routeId, driverLocation, stops: ordered stops with seq, orderedStopIds, geometry, distanceMeters, durationSec, generatedAt }
   */
  async computeOptimizedRoute(
    driverId: string,
    driverLocation: LatLon,
    stops: Stop[],
  ): Promise<Route> {
    // if no stops, return trivial route
    if (!stops || stops.length === 0) {
      return this.emptyRoute(driverId, driverLocation);
    }

    // Build points list: first is driver, then stops
    const points = [
      { id: '__driver', lat: driverLocation.lat, lon: driverLocation.lon },
      ...stops.map((s) => ({ id: s.orderId, lat: s.lat, lon: s.lon })),
    ];
    // 1) obtain matrix (distances in meters)
    const matrixObj = await this.mapsService.computeMatrix(
      points.map((p) => ({ lat: p.lat, lon: p.lon })),
    );
    const distances = matrixObj.distances;
    if (!distances || distances.length === 0) {
      throw new Error('Failed to compute distance matrix');
    }
    // 2) Solve TSP-like ordering starting at index 0 (driver)
    const tour = this.solveTspNearest2Opt(distances, 0); // returns array of indices

    console.log("Routes tour ::: ", tour);
    
    // Build ordered stops excluding driver (index 0)
    const orderedPointIndices = tour.slice(1); // indices of stops in desired visiting order
    const orderedStops = orderedPointIndices.map((idx, seq) => {
      const p = points[idx];
      const originalStop = stops.find((s) => s.orderId === p.id) ?? null;
      return {
        orderId: p.id,
        lat: p.lat,
        lon: p.lon,
        seq: seq + 1,
        meta: originalStop ? { ...originalStop } : undefined,
      };
    });

    console.log("Computed orders stops::::" , orderedStops);
    
    this.logger.debug(
      `Computed ordered stops: ${JSON.stringify(orderedStops)}`,
    );
    // 3) Build final directions for this ordered route: driver -> stop1 -> stop2 -> ...
    const orderedPointsForDirections = [
      { lat: points[tour[0]].lat, lon: points[tour[0]].lon }, // driver
      ...orderedStops.map((s) => ({ lat: s.lat, lon: s.lon })),
    ];
    console.log("FInal stops ::::", orderedPointsForDirections);
    
    this.logger.debug(
      `Computed ordered points for directions: ${JSON.stringify(
        orderedPointsForDirections,
      )}`,
    );

    let directionsResult: any;
    try {
      directionsResult = await this.mapsService.getDirectionsOrdered(
        orderedPointsForDirections,
      );
      console.log("Direction results :::: ", directionsResult);
      
      this.logger.debug(
        `Computed directions: ${JSON.stringify(directionsResult)}`,
      );
    } catch (err) {
      // If directions fail, still return the ordered stops with distance approximated by matrix sum
      this.logger.warn(
        'Directions request failed, will return route without geometry: ' +
          (err as Error).message,
      );
      const approxDistance = this.sumTourDistanceMeters(distances, tour);
      this.logger.debug(`Approximated distance: ${approxDistance}`);
      return {
        routeId: `route:${driverId}:${Date.now()}`,
        driverId,
        stops: orderedStops,
        orderedStopIds: orderedStops.map((s) => s.orderId),
        geometry: null,
        distanceMeters: approxDistance,
        durationSec: null,
        segments: [],
        generatedAt: Date.now(),
        strategy: 'matrix+nearest-2opt',
      };
    }

    // 4) Return the route object
    return {
      routeId: `route:${driverId}:${Date.now()}`,
      driverId,
      stops: orderedStops,
      orderedStopIds: orderedStops.map((s) => s.orderId),
      geometry: directionsResult.geometry,
      distanceMeters: directionsResult.distance,
      durationSec: directionsResult.duration,
      segments: directionsResult.segments,
      generatedAt: Date.now(),
      strategy: 'matrix+nearest-2opt',
    };
  }

    /** ==================== NEW: Detect deviation and recalculate route ==================== */
  async recalculateRouteIfDeviation(
    driverId: string,
    driverLocation: LatLon,
    currentRoute: RouteLike,
    deviationThresholdMeters = 100, // customize threshold
  ): Promise<{ route: any; recalculated: boolean }> {
    try {
      // 1️⃣ Get driver distance from the existing route line
      const distanceFromRoute = await this.mapsService.calculateDistanceFromRoute(
        driverLocation,
        currentRoute.geometry,
      );

      this.logger.debug(
        `Driver ${driverId} is ${distanceFromRoute.toFixed(
          1,
        )}m from current route`,
      );

      // 2️⃣ If the driver is still near the route, do nothing
      if (distanceFromRoute < deviationThresholdMeters) {
        return { route: currentRoute, recalculated: false };
      }

      this.logger.warn(
        `Driver ${driverId} deviated ${distanceFromRoute.toFixed(
          1,
        )}m — recalculating route...`,
      );

      // 3️⃣ Recalculate new optimized route from current position to remaining stops
      const remainingStops = currentRoute.stops.filter((s) => !s.visited);
      const newRoute = await this.computeOptimizedRoute(
        driverId,
        driverLocation,
        remainingStops,
      );

      this.logger.log(
        `✅ Recalculated new route for driver ${driverId}, total stops: ${remainingStops.length}`,
      );

      return { route: newRoute, recalculated: true };
    } catch (err) {
      this.logger.error(`Error in route deviation check: ${(err as Error).message}`);
      return { route: currentRoute, recalculated: false };
    }
  }

  // ----------------- TSP helper: Nearest Neighbor + 2-opt -----------------

  private solveTspNearest2Opt(distances: number[][], startIdx = 0): number[] {
    const n = distances.length;
    if (n <= 1) return [0];

    const visited = new Array(n).fill(false);
    const tour: number[] = [startIdx];
    visited[startIdx] = true;

    // nearest neighbor
    for (let step = 1; step < n; step++) {
      const last = tour[tour.length - 1];
      let next = -1;
      let best = Infinity;
      for (let i = 0; i < n; i++) {
        if (visited[i]) continue;
        const d = distances[last]?.[i] ?? Infinity;
        if (d < best) {
          best = d;
          next = i;
        }
      }
      if (next === -1) break;
      tour.push(next);
      visited[next] = true;
    }

    // 2-opt improvement
    let improved = true;
    // limit iterations to avoid long loops: (n^2) attempts but break earlier if not improved
    while (improved) {
      improved = false;
      for (let i = 1; i < n - 1; i++) {
        for (let k = i + 1; k < n; k++) {
          const delta = this.calc2OptDelta(distances, tour, i, k);
          if (delta < -1e-6) {
            // perform 2-opt swap: reverse tour[i..k]
            const segment = tour.slice(i, k + 1).reverse();
            tour.splice(i, k - i + 1, ...segment);
            improved = true;
          }
        }
      }
    }

    return tour;
  }

  private calc2OptDelta(
    distances: number[][],
    tour: number[],
    i: number,
    k: number,
  ) {
    const a = tour[i - 1];
    const b = tour[i];
    const c = tour[k];
    const d = tour[k + 1] ?? tour[0]; // if k is last, connect back to start (though we don't close route)
    const dab = distances[a]?.[b] ?? Infinity;
    const cdd = distances[c]?.[d] ?? Infinity;
    const dac = distances[a]?.[c] ?? Infinity;
    const cbd = distances[b]?.[d] ?? Infinity;
    return dac + cbd - (dab + cdd);
  }

  // Sum distances along the tour (in meters). If distances matrix is partial, best-effort.
  private sumTourDistanceMeters(distances: number[][], tour: number[]) {
    let s = 0;
    for (let i = 0; i < tour.length - 1; i++) {
      s += distances[tour[i]]?.[tour[i + 1]] ?? 0;
    }
    return s;
  }

  private emptyRoute(driverId: string, driverLocation: LatLon) {
    return {
      routeId: `route:${driverId}:empty:${Date.now()}`,
      driverId,
      stops: [],
      orderedStopIds: [],
      geometry: null,
      distanceMeters: 0,
      durationSec: 0,
      segments: [],
      generatedAt: Date.now(),
      strategy: 'none',
    };
  }
}
