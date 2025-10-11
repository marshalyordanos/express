import { RpcException } from "@nestjs/microservices";

type LatLon = { lat: number; lon: number };

export class MapsService {
  // Public entry - ensure numeric lat/lon before calling ORS
  async calculateDistance(origin: LatLon, destination: LatLon): Promise<number> {
    const o = { lat: Number(origin.lat), lon: Number(origin.lon) };
    const d = { lat: Number(destination.lat), lon: Number(destination.lon) };

    if ([o.lat, o.lon, d.lat, d.lon].some((v) => Number.isNaN(v))) {
      throw new RpcException('Invalid coordinates (not numbers)');
    }

    try {
      return await this.callOpenRouteService(o, d);
    } catch (err) {
      console.warn('ORS routing failed, falling back to Haversine:', err?.message ?? err);
      return Number(this.haversineKm(o.lat, o.lon, d.lat, d.lon).toFixed(2));
    }
  }

  private async callOpenRouteService(origin: LatLon, destination: LatLon): Promise<number> {
    const apiKey = process.env.OPENROUTESERVICE_API_KEY || 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjgwMmU3YTY3MDMwMjRlZjViNWE4MzczYzE3ZGZlNDBkIiwiaCI6Im11cm11cjY0In0=';
    const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${origin.lon},${origin.lat}&end=${destination.lon},${destination.lat}`;

    console.log('ORS URL:', url);
    
    const response = await fetch(url);
    console.log('ORS response:', response);
    console.log('ORS response status:', response.status);
    
    const data = await response.json();

    console.log('ORS response:', JSON.stringify(data, null, 2));
    
    // If non-2xx, bubble useful message
    if (!response.ok) {
      console.error('ORS API responded with error:', response.status, data);
      throw new Error(`ORS API error: ${data?.error?.message ?? response.statusText}`);
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
        ? this.sumCoordinatesDistanceKm(data.features[0].geometry.coordinates) * 1000 // returned as km, convert to meters to unify
        : undefined);

    if (routeDistanceMeters == null || Number.isNaN(routeDistanceMeters)) {
      // final defensive: if geometry present but our summation returned NaN, throw for fallback above
      console.error('ORS: no distance in response and no usable geometry:', JSON.stringify(data?.features?.[0]?.properties ?? data, null, 2));
      throw new Error('ORS: no valid route distance found');
    }

    const distanceKm = Number(routeDistanceMeters) / 1000; // convert meters -> km
    return Number(distanceKm.toFixed(2));
  }

  // Sum distances of successive coordinates from a LineString.
  // ORS geometry coordinates are [lon, lat], so take care of ordering.
  private sumCoordinatesDistanceKm(coords: Array<[number, number]>): number {
    if (!Array.isArray(coords) || coords.length < 2) return 0;
    let totalKm = 0;
    for (let i = 1; i < coords.length; i++) {
      const [lon1, lat1] = coords[i - 1];
      const [lon2, lat2] = coords[i];
      const a = Number(lat1), b = Number(lon1), c = Number(lat2), d = Number(lon2);
      if ([a, b, c, d].some((v) => Number.isNaN(v))) continue;
      totalKm += this.haversineKm(a, b, c, d);
    }
    return Number(totalKm.toFixed(3));
  }

  // Haversine formula (returns km)
  private haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
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
