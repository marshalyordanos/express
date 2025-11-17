import { IPagination } from '../../common/types';
import { Vehicle, FleetLog } from '@prisma/client';
import { CreateVehicleDto, UpdateVehicleDto, AssignVehicleDto, VehicleMaintenanceDto, VehicleMaintenanceQueryDto } from './fleet.entity';
export interface FleetUsecase {
    createVehicle(data: CreateVehicleDto): Promise<Vehicle>;
    getAllVehicles(page?: number, pageSize?: number, status?: string, search?: string): Promise<{
        vehicles: Partial<Vehicle>[];
        pagination: IPagination;
    }>;
    getVehicleById(id: string): Promise<Vehicle | null>;
    updateVehicle(id: string, data: Partial<UpdateVehicleDto>): Promise<Vehicle>;
    deleteVehicle(id: string): Promise<Vehicle>;
    assignVehicle(data: AssignVehicleDto): Promise<Vehicle>;
    unassignVehicle(vehicleId: string): Promise<Vehicle>;
    getVehiclesByDriver(driverId: string): Promise<Vehicle[]>;
    logVehicleMaintenance(data: VehicleMaintenanceDto): Promise<FleetLog>;
    getVehicleMaintenanceHistory(vehicleId: string, query?: VehicleMaintenanceQueryDto): Promise<FleetLog[]>;
    getFleetSummary(): Promise<any>;
    getAvailableVehicles(): Promise<Vehicle[]>;
    getVehicleHistory(vehicleId: string): Promise<any>;
    retireVehicle(vehicleId: string): Promise<Vehicle>;
    getFleetAlerts(): Promise<FleetLog[]>;
    getDriverVehicleHistory(driverId: string): Promise<any>;
}
