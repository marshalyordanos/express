import { ClientProxy } from '@nestjs/microservices';
import { CreateVehicleDto, UpdateVehicleDto, AssignVehicleDto, VehicleMaintenanceDto } from '../operations/fleet/fleet.entity';
export declare class FleetGatewayController {
    private readonly fleetClient;
    constructor(fleetClient: ClientProxy);
    assignVehicle(req: any, dto: AssignVehicleDto): Promise<import("rxjs").Observable<any>>;
    unassignVehicle(req: any, id: string): Promise<import("rxjs").Observable<any>>;
    getVehiclesByDriver(driverId: string, req: any): Promise<import("rxjs").Observable<any>>;
    logMaintenance(req: any, dto: VehicleMaintenanceDto): Promise<import("rxjs").Observable<any>>;
    getMaintenanceHistory(req: any, vehicleId: string): Promise<import("rxjs").Observable<any>>;
    getFleetSummary(req: any): Promise<import("rxjs").Observable<any>>;
    getAvailableVehicles(req: any): Promise<import("rxjs").Observable<any>>;
    retireVehicle(vehicleId: string, req: any): Promise<import("rxjs").Observable<any>>;
    getFleetAlerts(req: any): Promise<import("rxjs").Observable<any>>;
    getDriverVehicleHistory(driverId: string, req: any): Promise<import("rxjs").Observable<any>>;
    createVehicle(dto: CreateVehicleDto, req: any): Promise<import("rxjs").Observable<any>>;
    getAllVehicles(req: any, page?: number, pageSize?: number, search?: string, status?: string): Promise<import("rxjs").Observable<any>>;
    getVehicleById(req: any, id: string): Promise<import("rxjs").Observable<any>>;
    updateVehicle(req: any, id: string, dto: UpdateVehicleDto): Promise<import("rxjs").Observable<any>>;
    deleteVehicle(req: any, id: string): Promise<import("rxjs").Observable<any>>;
}
