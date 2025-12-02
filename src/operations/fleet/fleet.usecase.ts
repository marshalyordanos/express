import { IPagination } from '../../common/types';
import { Vehicle, FleetLog } from '@prisma/client';
import {
  CreateVehicleDto,
  UpdateVehicleDto,
  AssignVehicleDto,
  VehicleMaintenanceDto,
  VehicleMaintenanceQueryDto,
} from './fleet.entity';
import { ListQueryDto } from 'src/common/query/query.dto';

export interface FleetUsecase {
  // Vehicle Management
  createVehicle(data: CreateVehicleDto): Promise<Vehicle>;
  getAllVehicles(query?: ListQueryDto);
  getVehicleById(id: string): Promise<Vehicle | null>;
  updateVehicle(id: string, data: Partial<UpdateVehicleDto>): Promise<Vehicle>;
  deleteVehicle(id: string): Promise<Vehicle>;

  // Vehicle Assignment
  assignVehicle(data: AssignVehicleDto): Promise<Vehicle>;
  unassignVehicle(vehicleId: string): Promise<Vehicle>;
  getVehiclesByDriver(driverId: string): Promise<Vehicle[]>;

  // Vehicle Maintenance
  logVehicleMaintenance(data: VehicleMaintenanceDto): Promise<FleetLog>;
  getVehicleMaintenanceHistory(
    vehicleId: string,
    query?: VehicleMaintenanceQueryDto,
  ): Promise<FleetLog[]>;

  // Fleet Analytics & Reporting
  getFleetSummary(): Promise<any>; // replace `any` with a structured summary DTO if needed
  getAvailableVehicles(): Promise<Vehicle[]>;

  // Optional / Advanced Features
  getVehicleHistory(vehicleId: string): Promise<any>; // includes assignment & maintenance logs
  retireVehicle(vehicleId: string): Promise<Vehicle>;
  getFleetAlerts(): Promise<FleetLog[]>; // vehicles requiring maintenance
  getDriverVehicleHistory(driverId: string): Promise<any>; // driver vehicle usage
}
