import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import axios from 'axios';

type LatLon = { id?: string; lat: number; lon: number };

@Injectable()
export class MapsService {
  // constructor(private logger: Logger) {}
  private readonly logger = new Logger(MapsService.name);
  async reverseGeocode(
    lat: number,
    lon: number,
  ): Promise<{
    name?: string;
    address?: string;
    city?: string;
    country?: string;
    postalCode?: string;
    addressLine?: string;
    state?: string;
  }> {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`;

      const response = await axios.get(url, {
        headers: { 'User-Agent': 'CourierApp/1.0' },
        timeout: 5000,
      });

      const data = response.data || {};
      const address = data.address || {};

      console.log("Data for address to be created inside mapservice for data:::::", data);
      console.log("Data for address to be created inside mapservice for address:::::", address);

      
      // Use the best available fields
      return {
        name: data.name || address.road || undefined,
        address:
          [address.house_number, address.road, address.suburb]
            .filter(Boolean)
            .join(', ') || undefined,
        city:
          address.city ||
          address.town ||
          address.village ||
          address.county ||
          undefined,
        country: address.country || undefined,
        postalCode: address.postcode || undefined,
        addressLine: address.road || undefined,
        state: address.state || undefined
      };
    } catch (err) {
      this.logger.warn(
        `Reverse geocode failed for ${lat},${lon}: ${(err as Error).message} ${err?.response?.data}  ::: ${err}`,
      );
      return {};
    }
  }

  async calculateDistance(
    origin: LatLon,
    destination: LatLon,
  ): Promise<number> {
    const o = { lat: Number(origin.lat), lon: Number(origin.lon) };
    const d = { lat: Number(destination.lat), lon: Number(destination.lon) };

    if ([o.lat, o.lon, d.lat, d.lon].some((v) => Number.isNaN(v))) {
      throw new RpcException('Invalid coordinates (not numbers)');
    }

    try {
      return await this.callOpenRouteService(o, d);
    } catch (err) {
      console.warn(
        'ORS routing failed, falling back to Haversine:',
        err?.message ?? err,
      );
      return Number(this.haversineKm(o.lat, o.lon, d.lat, d.lon).toFixed(2));
    }
  }

  private async callOpenRouteService(
    origin: LatLon,
    destination: LatLon,
  ): Promise<number> {
    const apiKey = process.env.OPENROUTESERVICE_API_KEY;
    const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${origin.lon},${origin.lat}&end=${destination.lon},${destination.lat}`;

    // const response = await fetch(url);
    // const data = await response.json();
    const response = await axios.get(url, {
      headers: { 'User-Agent': 'CourierApp/1.0' },
      timeout: 5000,
    });

    const data = response.data || {};
    // const address = data.address || {};
    // If non-2xx, bubble useful message
    if (!response.status || response.status < 200 || response.status > 299) {
      throw new Error(
        `ORS API error: ${data?.error?.message ?? response.statusText}`,
      );
    }

    // 1) Try common "routes[0].summary.distance" (some ORS versions)
    const routeDistanceMeters =
      data?.routes?.[0]?.summary?.distance ??
      // 2) Try GeoJSON "features[0].properties.summary.distance"
      data?.features?.[0]?.properties?.summary?.distance ??
      // 3) Try "features[0].properties.segments[0].distance"
      data?.features?.[0]?.properties?.segments?.[0]?.distance ??
      // 4) If distance field not present, try to sum geometry coordinates (LineString)
      (data?.features?.[0]?.geometry?.coordinates
        ? this.sumCoordinatesDistanceKm(data.features[0].geometry.coordinates) *
          1000 // returned as km, convert to meters to unify
        : undefined);

    if (routeDistanceMeters == null || Number.isNaN(routeDistanceMeters)) {
      // final defensive: if geometry present but our summation returned NaN, throw for fallback above
      console.error(
        'ORS: no distance in response and no usable geometry:',
        JSON.stringify(data?.features?.[0]?.properties ?? data, null, 2),
      );
      throw new Error('ORS: no valid route distance found');
    }

    const distanceKm = Number(routeDistanceMeters) / 1000; // convert meters -> km
    return Number(distanceKm.toFixed(2));
  }

  /**
   * Compute matrix (distances and durations) for given points using ORS matrix endpoint.
   * Points must be [{lat, lon}, ...] and returned distances are in meters, durations in seconds.
   * Falls back to pairwise calculateDistance() if ORS matrix fails.
   */
  async computeMatrix(
    points: LatLon[],
  ): Promise<{ distances: number[][]; durations?: number[][] }> {
    if (!Array.isArray(points) || points.length === 0) {
      return { distances: [] };
    }

    // Build coordinates for ORS: [[lon, lat], ...]
    const coords = points.map((p) => [Number(p.lon), Number(p.lat)]);

    // Defensive validation
    if (coords.some(([lon, lat]) => Number.isNaN(lon) || Number.isNaN(lat))) {
      throw new RpcException('Invalid coordinates for matrix (not numbers)');
    }

    // ORS matrix endpoint
    const apiKey = process.env.OPENROUTESERVICE_API_KEY;
    const url = 'https://api.openrouteservice.org/v2/matrix/driving-car';

    try {
      const body = {
        locations: coords,
        metrics: ['distance', 'duration'],
        units: 'm', // distances in meters
      };

      const response = await axios.post(url, body, {
        headers: {
          Authorization: apiKey ?? '',
          'Content-Type': 'application/json; charset=utf-8',
          Accept: 'application/json, application/geo+json',
        },
      });

      const data = response.data;

      const distances = data?.distances || data?.distances_matrix || null;
      const durations = data?.durations || null;

      if (!distances || !Array.isArray(distances)) {
        throw new Error('ORS Matrix returned no distances array');
      }

      // Ensure 2D numeric arrays
      return { distances, durations };
    } catch (err: any) {
      if (err.response) {
        console.error(
          `ORS Matrix error: ${err.response.status} ${JSON.stringify(err.response.data)}`,
        );
      } else {
        console.error(`ORS Matrix request failed: ${err.message}`);
      }

      // Fallback: compute distances manually
      const fallback = await this.computePairwiseMatrix(points);
      return fallback;
    }
  }

  async calculateDistanceFromRoute(
    driverLocation: { lat: number; lon: number },
    routeGeometry: any,
  ): Promise<number> {
    if (!routeGeometry || !routeGeometry.coordinates) return Infinity;

    const { lat, lon } = driverLocation;
    const [driverLon, driverLat] = [Number(lon), Number(lat)];

    let minDist = Infinity;

    for (const [lon2, lat2] of routeGeometry.coordinates) {
      const d = this.calculateHaversineDistance(
        { lat: driverLat, lon: driverLon },
        { lat: lat2, lon: lon2 },
      );
      if (d < minDist) minDist = d;
    }

    return minDist; // in meters
  }

  private calculateHaversineDistance(a: LatLon, b: LatLon): number {
    const R = 6371000; // Earth radius in meters
    const dLat = ((b.lat - a.lat) * Math.PI) / 180;
    const dLon = ((b.lon - a.lon) * Math.PI) / 180;
    const lat1 = (a.lat * Math.PI) / 180;
    const lat2 = (b.lat * Math.PI) / 180;

    const hav =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.atan2(Math.sqrt(hav), Math.sqrt(1 - hav));
  }

  /**
   * Get directions for an ordered sequence of points (driver -> stop1 -> stop2 -> ...).
   * Returns { geometry (encoded polyline or geojson), distance (meters), duration (seconds) }.
   */
  async getDirectionsOrdered(points: LatLon[]): Promise<{
    geometry: string | any;
    distance: number;
    duration: number;
    segments: any[];
  }> {
    if (!Array.isArray(points) || points.length < 2) {
      return { geometry: null, distance: 0, duration: 0, segments: [] };
    }

    const apiKey = process.env.OPENROUTESERVICE_API_KEY;
    const url = 'https://api.openrouteservice.org/v2/directions/driving-car';

    // Build coordinates as [[lon,lat], ...]
    const coordinates = points.map((p) => [Number(p.lon), Number(p.lat)]);

    // Validate numbers
    if (
      coordinates.some(([lon, lat]) => Number.isNaN(lon) || Number.isNaN(lat))
    ) {
      throw new RpcException(
        'Invalid coordinates for directions (not numbers)',
      );
    }

    try {
      const requestBody = {
        coordinates,
        // Optional parameters:
        // preference: 'fastest',
        // //  | 'shortest',
        // instructions: true,
        // geometry_format: 'encodedpolyline' // OR 'geojson'
      };

      const response = await axios.post(url, requestBody, {
        headers: {
          Authorization:
            apiKey ??
            'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjgwMmU3YTY3MDMwMjRlZjViNWE4MzczYzE3ZGZlNDBkIiwiaCI6Im11cm11cjY0In0=',
          'Content-Type': 'application/json; charset=utf-8',
          Accept: 'application/json, application/geo+json',
        },
      });

      const data = response.data;

      // Extract robustly across ORS response shapes
      const route =
        data?.routes?.[0] ?? data?.features?.[0]?.properties ?? null;

      // geometry: ORS may supply encoded "geometry" on routes[0], or features[0].geometry
      let geometry: any = null;
      if (data?.routes?.[0]?.geometry) geometry = data.routes[0].geometry;
      else if (data?.features?.[0]?.geometry)
        geometry = data.features[0].geometry;
      else geometry = null;

      const segments =
        data?.routes?.[0]?.segments ??
        data?.features?.[0]?.properties?.segments ??
        [];

      // distance in meters and duration in seconds
      const distance =
        data?.routes?.[0]?.summary?.distance ??
        data?.features?.[0]?.properties?.summary?.distance ??
        data?.features?.[0]?.properties?.segments?.[0]?.distance ??
        0;

      const duration =
        data?.routes?.[0]?.summary?.duration ??
        data?.features?.[0]?.properties?.summary?.duration ??
        data?.features?.[0]?.properties?.segments?.[0]?.duration ??
        0;

      return {
        geometry,
        distance: Number(distance),
        duration: Number(duration),
        segments,
      };
    } catch (err: any) {
      if (err.response) {
        throw new Error(
          `ORS Directions error: ${err.response.status} ${JSON.stringify(err.response.data)}`,
        );
      } else {
        throw new Error(`Directions call failed: ${err.message}`);
      }
    }
  }
  /**
   * Pairwise matrix compute fallback using your calculateDistance (returns km).
   * We convert to meters in the result.
   */
  private async computePairwiseMatrix(
    points: LatLon[],
  ): Promise<{ distances: number[][]; durations?: number[][] }> {
    const n = points.length;
    const distances: number[][] = Array.from({ length: n }, () =>
      Array(n).fill(0),
    );
    // durations unknown in fallback — leave undefined or approximate by distance/speed if desired
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        try {
          const km = await this.calculateDistance(points[i], points[j]); // returns km
          const meters = Math.round(km * 1000);
          distances[i][j] = distances[j][i] = meters;
        } catch (err) {
          // As ultimate fallback, used Haversine directly if calculateDistance fails
          const km = this.haversineKm(
            points[i].lat,
            points[i].lon,
            points[j].lat,
            points[j].lon,
          );
          const meters = Math.round(km * 1000);
          distances[i][j] = distances[j][i] = meters;
        }
      }
    }

    return { distances };
  }

  // Sum distances of successive coordinates from a LineString.
  // ORS geometry coordinates are [lon, lat], so it take care of ordering.
  private sumCoordinatesDistanceKm(coords: Array<[number, number]>): number {
    if (!Array.isArray(coords) || coords.length < 2) return 0;
    let totalKm = 0;
    for (let i = 1; i < coords.length; i++) {
      const [lon1, lat1] = coords[i - 1];
      const [lon2, lat2] = coords[i];
      const a = Number(lat1),
        b = Number(lon1),
        c = Number(lat2),
        d = Number(lon2);
      if ([a, b, c, d].some((v) => Number.isNaN(v))) continue;
      totalKm += this.haversineKm(a, b, c, d);
    }
    return Number(totalKm.toFixed(3));
  }

  // Haversine formula (returns km)
  private haversineKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Earth radius km
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}
