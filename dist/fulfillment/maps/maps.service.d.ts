type LatLon = {
    id?: string;
    lat: number;
    lon: number;
};
export declare class MapsService {
    private readonly logger;
    reverseGeocode(lat: number, lon: number): Promise<{
        name?: string;
        address?: string;
        city?: string;
        country?: string;
        postalCode?: string;
        addressLine?: string;
        state?: string;
    }>;
    calculateDistance(origin: LatLon, destination: LatLon): Promise<number>;
    private callOpenRouteService;
    computeMatrix(points: LatLon[]): Promise<{
        distances: number[][];
        durations?: number[][];
    }>;
    calculateDistanceFromRoute(driverLocation: {
        lat: number;
        lon: number;
    }, routeGeometry: any): Promise<number>;
    private calculateHaversineDistance;
    getDirectionsOrdered(points: LatLon[]): Promise<{
        geometry: string | any;
        distance: number;
        duration: number;
        segments: any[];
    }>;
    private computePairwiseMatrix;
    private sumCoordinatesDistanceKm;
    private haversineKm;
}
export {};
