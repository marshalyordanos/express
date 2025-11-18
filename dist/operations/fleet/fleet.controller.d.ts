import { FleetUseCasesImp } from './fleet.usecase.impl';
import { CreateVehicleDto, UpdateVehicleDto, AssignVehicleDto, VehicleMaintenanceDto, VehicleMaintenanceQueryDto } from './fleet.entity';
import { IResponse } from '../../common/types';
export declare class FleetMessageController {
    private readonly usecases;
    constructor(usecases: FleetUseCasesImp);
    createVehicle(payload: {
        data: CreateVehicleDto;
    }): Promise<IResponse<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        type: string;
        driverId: string | null;
        status: import(".prisma/client").$Enums.VehicleStatus;
        plateNumber: string;
        model: string | null;
        maxLoad: number | null;
    }>>;
    getAllVehicles(payload: any): Promise<IResponse<Partial<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        type: string;
        driverId: string | null;
        status: import(".prisma/client").$Enums.VehicleStatus;
        plateNumber: string;
        model: string | null;
        maxLoad: number | null;
    }>[]>>;
    getVehicleById(payload: {
        id: string;
    }): Promise<IResponse<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        type: string;
        driverId: string | null;
        status: import(".prisma/client").$Enums.VehicleStatus;
        plateNumber: string;
        model: string | null;
        maxLoad: number | null;
    }>>;
    updateVehicle(payload: {
        id: string;
        data: UpdateVehicleDto;
    }): Promise<IResponse<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        type: string;
        driverId: string | null;
        status: import(".prisma/client").$Enums.VehicleStatus;
        plateNumber: string;
        model: string | null;
        maxLoad: number | null;
    }>>;
    deleteVehicle(payload: {
        id: string;
    }): Promise<IResponse<any>>;
    assignVehicle(payload: {
        data: AssignVehicleDto;
    }): Promise<IResponse<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        type: string;
        driverId: string | null;
        status: import(".prisma/client").$Enums.VehicleStatus;
        plateNumber: string;
        model: string | null;
        maxLoad: number | null;
    }>>;
    unassignVehicle(payload: {
        vehicleId: string;
    }): Promise<IResponse<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        type: string;
        driverId: string | null;
        status: import(".prisma/client").$Enums.VehicleStatus;
        plateNumber: string;
        model: string | null;
        maxLoad: number | null;
    }>>;
    getVehiclesByDriver(payload: {
        driverId: string;
    }): Promise<IResponse<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        type: string;
        driverId: string | null;
        status: import(".prisma/client").$Enums.VehicleStatus;
        plateNumber: string;
        model: string | null;
        maxLoad: number | null;
    }[]>>;
    logVehicleMaintenance(payload: {
        data: VehicleMaintenanceDto;
    }): Promise<IResponse<{
        id: string;
        createdBy: string | null;
        cost: number | null;
        vehicleId: string;
        maintenance: string;
        date: Date;
    }>>;
    getMaintenanceHistory(payload: {
        vehicleId: string;
        query?: VehicleMaintenanceQueryDto;
    }): Promise<IResponse<{
        id: string;
        createdBy: string | null;
        cost: number | null;
        vehicleId: string;
        maintenance: string;
        date: Date;
    }[]>>;
    getFleetSummary(): Promise<IResponse<any>>;
    getAvailableVehicles(): Promise<IResponse<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        type: string;
        driverId: string | null;
        status: import(".prisma/client").$Enums.VehicleStatus;
        plateNumber: string;
        model: string | null;
        maxLoad: number | null;
    }[]>>;
    getVehicleHistory(payload: {
        vehicleId: string;
    }): Promise<IResponse<any>>;
    retireVehicle(payload: {
        vehicleId: string;
    }): Promise<IResponse<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        type: string;
        driverId: string | null;
        status: import(".prisma/client").$Enums.VehicleStatus;
        plateNumber: string;
        model: string | null;
        maxLoad: number | null;
    }>>;
    getFleetAlerts(): Promise<IResponse<{
        id: string;
        createdBy: string | null;
        cost: number | null;
        vehicleId: string;
        maintenance: string;
        date: Date;
    }[]>>;
    getDriverVehicleHistory(payload: {
        driverId: string;
    }): Promise<IResponse<any>>;
}
