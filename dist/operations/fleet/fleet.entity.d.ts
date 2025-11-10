import { VehicleStatus } from '@prisma/client';
export interface CreateVehicleDto {
    plateNumber: string;
    type: string;
    model?: string;
    status?: VehicleStatus;
    driverId?: string;
}
export declare class UpdateVehicleDto {
    plateNumber?: string;
    type?: string;
    model?: string;
    status?: VehicleStatus;
    driverId?: string;
}
export declare class AssignVehicleDto {
    vehicleId: string;
    driverId: string;
}
export declare class VehicleMaintenanceDto {
    vehicleId: string;
    maintenance: string;
    cost?: number;
}
export declare class VehicleMaintenanceQueryDto {
    vehicleId?: string;
    fromDate?: Date;
    toDate?: Date;
}
