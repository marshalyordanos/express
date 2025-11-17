import { FleetUseCasesImp } from './fleet.usecase.impl';
import { CreateVehicleDto, UpdateVehicleDto, AssignVehicleDto, VehicleMaintenanceDto, VehicleMaintenanceQueryDto } from './fleet.entity';
import { IResponse } from '../../common/types';
export declare class FleetMessageController {
    private readonly usecases;
    constructor(usecases: FleetUseCasesImp);
    createVehicle(payload: {
        data: CreateVehicleDto;
    }): Promise<IResponse<{
        type: string;
        status: import(".prisma/client").$Enums.VehicleStatus;
        id: string;
        model: string | null;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        plateNumber: string;
        driverId: string | null;
        maxLoad: number | null;
    }>>;
    getAllVehicles(payload: any): Promise<IResponse<Partial<{
        type: string;
        status: import(".prisma/client").$Enums.VehicleStatus;
        id: string;
        model: string | null;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        plateNumber: string;
        driverId: string | null;
        maxLoad: number | null;
    }>[]>>;
    getVehicleById(payload: {
        id: string;
    }): Promise<IResponse<{
        type: string;
        status: import(".prisma/client").$Enums.VehicleStatus;
        id: string;
        model: string | null;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        plateNumber: string;
        driverId: string | null;
        maxLoad: number | null;
    }>>;
    updateVehicle(payload: {
        id: string;
        data: UpdateVehicleDto;
    }): Promise<IResponse<{
        type: string;
        status: import(".prisma/client").$Enums.VehicleStatus;
        id: string;
        model: string | null;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        plateNumber: string;
        driverId: string | null;
        maxLoad: number | null;
    }>>;
    deleteVehicle(payload: {
        id: string;
    }): Promise<IResponse<any>>;
    assignVehicle(payload: {
        data: AssignVehicleDto;
    }): Promise<IResponse<{
        type: string;
        status: import(".prisma/client").$Enums.VehicleStatus;
        id: string;
        model: string | null;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        plateNumber: string;
        driverId: string | null;
        maxLoad: number | null;
    }>>;
    unassignVehicle(payload: {
        vehicleId: string;
    }): Promise<IResponse<{
        type: string;
        status: import(".prisma/client").$Enums.VehicleStatus;
        id: string;
        model: string | null;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        plateNumber: string;
        driverId: string | null;
        maxLoad: number | null;
    }>>;
    getVehiclesByDriver(payload: {
        driverId: string;
    }): Promise<IResponse<{
        type: string;
        status: import(".prisma/client").$Enums.VehicleStatus;
        id: string;
        model: string | null;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        plateNumber: string;
        driverId: string | null;
        maxLoad: number | null;
    }[]>>;
    logVehicleMaintenance(payload: {
        data: VehicleMaintenanceDto;
    }): Promise<IResponse<{
        id: string;
        date: Date;
        createdBy: string | null;
        vehicleId: string;
        maintenance: string;
        cost: number | null;
    }>>;
    getMaintenanceHistory(payload: {
        vehicleId: string;
        query?: VehicleMaintenanceQueryDto;
    }): Promise<IResponse<{
        id: string;
        date: Date;
        createdBy: string | null;
        vehicleId: string;
        maintenance: string;
        cost: number | null;
    }[]>>;
    getFleetSummary(): Promise<IResponse<any>>;
    getAvailableVehicles(): Promise<IResponse<{
        type: string;
        status: import(".prisma/client").$Enums.VehicleStatus;
        id: string;
        model: string | null;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        plateNumber: string;
        driverId: string | null;
        maxLoad: number | null;
    }[]>>;
    getVehicleHistory(payload: {
        vehicleId: string;
    }): Promise<IResponse<any>>;
    retireVehicle(payload: {
        vehicleId: string;
    }): Promise<IResponse<{
        type: string;
        status: import(".prisma/client").$Enums.VehicleStatus;
        id: string;
        model: string | null;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        plateNumber: string;
        driverId: string | null;
        maxLoad: number | null;
    }>>;
    getFleetAlerts(): Promise<IResponse<{
        id: string;
        date: Date;
        createdBy: string | null;
        vehicleId: string;
        maintenance: string;
        cost: number | null;
    }[]>>;
    getDriverVehicleHistory(payload: {
        driverId: string;
    }): Promise<IResponse<any>>;
}
