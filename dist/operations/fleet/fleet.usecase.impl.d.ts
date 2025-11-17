import { FleetUsecase } from './fleet.usecase';
import { VehicleRepository } from './fleet.repository';
import { CreateVehicleDto, UpdateVehicleDto, AssignVehicleDto, VehicleMaintenanceDto, VehicleMaintenanceQueryDto } from './fleet.entity';
import { Vehicle, FleetLog } from '@prisma/client';
import { IPagination } from '../../common/types';
import { AppLogger } from '../../common/app-logger.service';
export declare class FleetUseCasesImp implements FleetUsecase {
    private readonly vehicleRepo;
    private readonly logger;
    constructor(vehicleRepo: VehicleRepository, logger: AppLogger);
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
