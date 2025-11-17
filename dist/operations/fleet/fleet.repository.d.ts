import { PrismaService } from '../../prisma/prisma.service';
import { Vehicle, FleetLog, User, Role } from '@prisma/client';
import { CreateVehicleDto, UpdateVehicleDto, AssignVehicleDto, VehicleMaintenanceDto, VehicleMaintenanceQueryDto } from './fleet.entity';
export declare class VehicleRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createVehicle(data: CreateVehicleDto): Promise<Vehicle>;
    findUserById(id: string): Promise<(User & {
        role: Role | null;
    }) | null>;
    getAllVehicles(page?: number, pageSize?: number, status?: string, search?: string): Promise<{
        vehicles: Partial<Vehicle>[];
        pagination: {
            total: number;
            page: number;
            pageSize: number;
            totalPages: number;
        };
    }>;
    getVehicleById(id: string): Promise<Vehicle | null>;
    updateVehicle(id: string, data: Partial<UpdateVehicleDto>): Promise<Vehicle>;
    deleteVehicle(id: string): Promise<Vehicle>;
    assignVehicle(data: AssignVehicleDto): Promise<Vehicle>;
    unassignVehicle(vehicleId: string): Promise<Vehicle>;
    getVehiclesByDriver(driverId: string): Promise<Vehicle[]>;
    logMaintenance(data: VehicleMaintenanceDto): Promise<FleetLog>;
    getMaintenanceHistory(vehicleId: string, query?: VehicleMaintenanceQueryDto): Promise<FleetLog[]>;
    getFleetSummary(): Promise<any>;
    getAvailableVehicles(): Promise<Vehicle[]>;
    getVehicleHistory(vehicleId: string): Promise<any>;
    retireVehicle(vehicleId: string): Promise<Vehicle>;
    getFleetAlerts(): Promise<FleetLog[]>;
    getDriverVehicleHistory(driverId: string): Promise<any>;
    findUser(userId: string): Promise<User>;
}
