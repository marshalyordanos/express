import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { MapsService } from './maps.service'; // adjust import path
type LatLon = { lat: number; lon: number };
type Stop = { orderId: string; lat: number; lon: number; [k: string]: any };
type Route = {
  routeId: string;
  driverId: string;
  stops: (Stop & {
    seq?: number;
    visited?: boolean;
    eta?: number;
    distanceKm?: number;
  })[];
  orderedStopIds: string[]; // same as originalOptimizedOrder below (for quick lookup)
  originalOptimizedOrder: string[]; // preserved optimized order (guaranteed)
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
   * Compute optimized route for driver.
   *
   * Returns a Route object which includes:
   * - ordered stops (seq),
   * - orderedStopIds (for quick mapping)
   * - originalOptimizedOrder (persisted order used for recalculation priority)
   * - geometry, distanceMeters, durationSec from ORS
   *
   * Reasoning:
   * - We compute a TSP-like tour (nearest + 2-opt) locally using matrix to avoid too many ORS calls.
   * - We then call ORS once to get route geometry / official duration & distance.
   * - We store originalOptimizedOrder so recalculation preserves intended priority.
   */
  async computeOptimizedRoute(
    driverId: string,
    driverLocation: LatLon,
    stops: Stop[],
  ): Promise<Route> {
    if (!stops || stops.length === 0) {
      return this.emptyRoute(driverId, driverLocation);
    }

    // Build points list: driver first, then stops
    const points = [
      { id: '__driver', lat: driverLocation.lat, lon: driverLocation.lon },
      ...stops.map((s) => ({ id: s.orderId, lat: s.lat, lon: s.lon })),
    ];

    // 1) compute distance matrix (meters) via your MapsService
    const matrixObj = await this.mapsService.computeMatrix(
      points.map((p) => ({ lat: p.lat, lon: p.lon })),
    );
    const distances = matrixObj.distances;
    if (!distances || distances.length === 0) {
      throw new Error('Failed to compute distance matrix');
    }

    // 2) Solve local TSP: nearest neighbor + 2-opt refinement
    const tour = this.solveTspNearest2Opt(distances, 0); // indices into points

    // 3) Build ordered stops excluding driver (index 0)
    const orderedPointIndices = tour.slice(1); // removes driver index
    const orderedStops = orderedPointIndices.map((idx, seq) => {
      const p = points[idx];
      const originalStop = stops.find((s) => s.orderId === p.id) ?? null;
      return {
        orderId: p.id,
        lat: p.lat,
        lon: p.lon,
        seq: seq + 1,
        visited: false,
        meta: originalStop ? { ...originalStop } : undefined,
      };
    });

    // Keep the optimized order for deterministic behavior during recalculation
    const originalOptimizedOrder = orderedStops.map((s) => s.orderId);

    // 4) Build final directions (single ORS call only) - driver -> stop1 -> stop2 -> ...
    const orderedPointsForDirections = [
      { lat: points[tour[0]].lat, lon: points[tour[0]].lon }, // driver
      ...orderedStops.map((s) => ({ lat: s.lat, lon: s.lon })),
    ];

    let directionsResult: any;
    try {
      // Single ORS directions call (fast enough for the optimized route)
      directionsResult = await this.mapsService.getDirectionsOrdered(
        orderedPointsForDirections,
      );
    } catch (err) {
      // If ORS fails, return best-effort route using matrix distances
      const approxDistance = this.sumTourDistanceMeters(distances, tour);
      this.logger.warn('ORS directions failed — returning approximation', err);
      return {
        routeId: `route:${driverId}:${Date.now()}`,
        driverId,
        stops: orderedStops,
        orderedStopIds: orderedStops.map((s) => s.orderId),
        originalOptimizedOrder,
        geometry: null,
        distanceMeters: approxDistance,
        durationSec: null,
        segments: [],
        generatedAt: Date.now(),
        strategy: 'matrix+nearest-2opt',
      };
    }

    // 5) Return canonical Route object
    return {
      routeId: `route:${driverId}:${Date.now()}`,
      driverId,
      stops: orderedStops,
      orderedStopIds: orderedStops.map((s) => s.orderId),
      originalOptimizedOrder,
      geometry: directionsResult.geometry,
      distanceMeters: directionsResult.distance,
      durationSec: directionsResult.duration,
      segments: directionsResult.segments,
      generatedAt: Date.now(),
      strategy: 'matrix+nearest-2opt',
    };
  }

  /**
   * Recalculate route only when driver deviates significantly.
   *
   * Improvements:
   * - Distance-to-next-stop check (fast and stable) -> avoid false positives.
   * - If recalculation needed, compute optimized route for remaining stops only (using computeOptimizedRoute).
   * - Recalculation uses TSP + one ORS call, then returns new route.
   *
   * Decision rules:
   * - If driver is within threshold meters of next stop -> no recalculation.
   * - If driver deviated more than threshold -> recompute route from current location for remaining stops.
   */
  async recalculateRouteIfDeviation(
    driverId: string,
    driverLocation: LatLon,
    currentRoute: RouteLike,
    deviationThresholdMeters = 300,
  ): Promise<{ route: RouteLike; recalculated: boolean }> {
    try {
      // find next unvisited stop (respect original optimized order)
      const nextStop = currentRoute.stops.find((s) => !s.visited);
      if (!nextStop) {
        // nothing to do — route already completed or no stops
        return { route: currentRoute, recalculated: false };
      }

      // compute distance to next stop using Haversine locally (cheap+robust)
      const distanceToNext =
        this.haversineKm(
          driverLocation.lat,
          driverLocation.lon,
          nextStop.lat,
          nextStop.lon,
        ) * 1000; // meters

      // If driver is close enough to next stop, do not recalc
      if (distanceToNext <= deviationThresholdMeters) {
        return { route: currentRoute, recalculated: false };
      }

      this.logger.warn(
        `Driver ${driverId} deviated ${Math.round(distanceToNext)}m from next stop ${nextStop.orderId}. Recalculating route.`,
      );

      // Build remaining stops list in original optimized order to preserve priority
      const remainingIds = (
        currentRoute.originalOptimizedOrder ||
        currentRoute.orderedStopIds ||
        []
      ).filter(
        (id) => !currentRoute.stops.find((s) => s.orderId === id)?.visited,
      );

      const remainingStops: Stop[] = remainingIds.map((id) => {
        const s = currentRoute.stops.find((st) => st.orderId === id);
        return {
          orderId: s.orderId,
          lat: s.lat,
          lon: s.lon,
          ...(s.meta ? { meta: s.meta } : {}),
        };
      });

      // compute new optimized route from current position for remaining stops
      const newRoute = await this.computeOptimizedRoute(
        driverId,
        driverLocation,
        remainingStops,
      );

      // mark earlier stops appropriately (visited flags remain unchanged for those already visited)
      // newRoute.stops are unvisited by default; if some were visited, keep that info (unlikely since we filtered)
      return { route: newRoute, recalculated: true };
    } catch (err) {
      this.logger.error(
        `Error in route deviation check: ${(err as Error).message}`,
      );
      return { route: currentRoute, recalculated: false };
    }
  }

  // ----------------- Helpers -----------------

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

    // 2-opt improvement (bounded but effective)
    let improved = true;
    while (improved) {
      improved = false;
      for (let i = 1; i < n - 1; i++) {
        for (let k = i + 1; k < n; k++) {
          const delta = this.calc2OptDelta(distances, tour, i, k);
          if (delta < -1e-6) {
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
    const d = tour[k + 1] ?? tour[0];
    const dab = distances[a]?.[b] ?? Infinity;
    const cdd = distances[c]?.[d] ?? Infinity;
    const dac = distances[a]?.[c] ?? Infinity;
    const cbd = distances[b]?.[d] ?? Infinity;
    return dac + cbd - (dab + cdd);
  }

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
      originalOptimizedOrder: [],
      geometry: null,
      distanceMeters: 0,
      durationSec: 0,
      segments: [],
      generatedAt: Date.now(),
      strategy: 'none',
    };
  }

  // Haversine helper (km)
  private haversineKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371;
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}
