"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FleetUseCasesImp = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const fleet_repository_1 = require("./fleet.repository");
const app_logger_service_1 = require("../../common/app-logger.service");
let FleetUseCasesImp = class FleetUseCasesImp {
    constructor(vehicleRepo, logger) {
        this.vehicleRepo = vehicleRepo;
        this.logger = logger;
        this.logger.setContext('OperationsService', 'FleetUseCasesImp');
    }
    async createVehicle(data) {
        try {
            this.logger.log(`Creating vehicle with data: ${JSON.stringify(data)}`);
            if (data.driverId) {
                const existingUser = await this.vehicleRepo.findUserById(data.driverId);
                if (!existingUser) {
                    this.logger.warn(`Driver not found: ${data.driverId}`);
                    throw new microservices_1.RpcException('Driver not found');
                }
            }
            const vehicle = await this.vehicleRepo.createVehicle(data);
            this.logger.log(`Vehicle created successfully with ID: ${vehicle.id}`);
            return vehicle;
        }
        catch (error) {
            this.logger.error(`Error creating vehicle: ${error.message}`, error.stack);
            throw new microservices_1.RpcException(error.message || 'Failed to create vehicle');
        }
    }
    async getAllVehicles(page = 1, pageSize = 10, status, search) {
        try {
            this.logger.log(`Fetching vehicles with page: ${page}, pageSize: ${pageSize}, status: ${status}, search: ${search}`);
            const result = await this.vehicleRepo.getAllVehicles(page, pageSize, status, search);
            this.logger.log(`Fetched ${result.vehicles.length} vehicles`);
            return result;
        }
        catch (error) {
            this.logger.error(`Error fetching vehicles: ${error.message}`, error.stack);
            throw new microservices_1.RpcException(error.message || 'Failed to fetch vehicles');
        }
    }
    async getVehicleById(id) {
        try {
            this.logger.log(`Fetching vehicle by ID: ${id}`);
            const vehicle = await this.vehicleRepo.getVehicleById(id);
            if (!vehicle) {
                this.logger.warn(`Vehicle not found: ${id}`);
                throw new microservices_1.RpcException(`Vehicle with ID ${id} not found`);
            }
            this.logger.log(`Vehicle retrieved successfully: ${vehicle.id}`);
            return vehicle;
        }
        catch (error) {
            this.logger.error(`Error fetching vehicle by ID: ${id} and error : ${error.message}`, error.stack);
            throw new microservices_1.RpcException(error.message || 'Failed to fetch vehicle');
        }
    }
    async updateVehicle(id, data) {
        try {
            this.logger.log(`Updating vehicle ID: ${id} with data: ${JSON.stringify(data)}`);
            const existingVehicle = await this.vehicleRepo.getVehicleById(id);
            if (!existingVehicle) {
                this.logger.warn(`Vehicle not found: ${id}`);
                throw new microservices_1.RpcException(`Vehicle with ID ${id} not found`);
            }
            const updatedVehicle = await this.vehicleRepo.updateVehicle(id, data);
            this.logger.log(`Vehicle updated successfully: ${updatedVehicle.id}`);
            return updatedVehicle;
        }
        catch (error) {
            this.logger.error(`Error updating vehicle ID: ${id} and error : ${error.message}`, error.stack);
            throw new microservices_1.RpcException(error.message || 'Failed to update vehicle');
        }
    }
    async deleteVehicle(id) {
        try {
            this.logger.log(`Deleting vehicle ID: ${id}`);
            const existingVehicle = await this.vehicleRepo.getVehicleById(id);
            if (!existingVehicle) {
                this.logger.warn(`Vehicle not found: ${id}`);
                throw new microservices_1.RpcException(`Vehicle with ID ${id} not found`);
            }
            const deletedVehicle = await this.vehicleRepo.deleteVehicle(id);
            this.logger.log(`Vehicle deleted successfully: ${deletedVehicle.id}`);
            return deletedVehicle;
        }
        catch (error) {
            this.logger.error(`Error deleting vehicle ID: ${id} and error : ${error.message}`, error.stack);
            throw new microservices_1.RpcException(error.message || 'Failed to delete vehicle');
        }
    }
    async assignVehicle(data) {
        try {
            this.logger.log(`Assigning vehicle ${data.vehicleId} to driver ${data.driverId}`);
            const user = await this.vehicleRepo.findUserById(data.driverId);
            if (!user) {
                this.logger.warn(`User not found: ${data.driverId}`);
                throw new microservices_1.RpcException(`User ${data.driverId} not found`);
            }
            if (!user.role || user.role.name !== 'DRIVER') {
                this.logger.warn(`User ${data.driverId} is not assigned to DRIVER role`);
                throw new microservices_1.RpcException('First assign the user to DRIVER role!');
            }
            const vehicle = await this.vehicleRepo.assignVehicle(data);
            this.logger.log(`Vehicle ${vehicle.id} assigned to driver ${user.id} successfully`);
            return vehicle;
        }
        catch (error) {
            this.logger.error(`Error assigning vehicle ${data.vehicleId} to driver ${data.driverId} and error : ${error.message}`, error.stack);
            throw new microservices_1.RpcException(error.message || 'Failed to assign vehicle');
        }
    }
    async unassignVehicle(vehicleId) {
        try {
            this.logger.log(`Unassigning vehicle ${vehicleId}`);
            const vehicle = await this.vehicleRepo.getVehicleById(vehicleId);
            if (!vehicle) {
                this.logger.warn(`Vehicle not found: ${vehicleId}`);
                throw new microservices_1.RpcException(`Vehicle ${vehicleId} not found`);
            }
            const result = await this.vehicleRepo.unassignVehicle(vehicleId);
            this.logger.log(`Vehicle ${vehicleId} unassigned successfully`);
            return result;
        }
        catch (error) {
            this.logger.error(`Error unassigning vehicle ${vehicleId} and error : ${error.message}`, error.stack);
            throw new microservices_1.RpcException(error.message || 'Failed to unassign vehicle');
        }
    }
    async getVehiclesByDriver(driverId) {
        try {
            this.logger.log(`Fetching vehicles for driver ${driverId}`);
            const user = await this.vehicleRepo.findUserById(driverId);
            if (!user) {
                this.logger.warn(`Driver not found: ${driverId}`);
                throw new microservices_1.RpcException(`Driver ${driverId} not found`);
            }
            const vehicles = await this.vehicleRepo.getVehiclesByDriver(driverId);
            this.logger.log(`Fetched ${vehicles.length} vehicles for driver ${driverId}`);
            return vehicles;
        }
        catch (error) {
            this.logger.error(`Error fetching vehicles for driver ${driverId} and error : ${error.message}`, error.stack);
            throw new microservices_1.RpcException(error.message || 'Failed to fetch vehicles');
        }
    }
    async logVehicleMaintenance(data) {
        try {
            this.logger.log(`Logging maintenance for vehicle ${data.vehicleId}`, JSON.stringify(data));
            const vehicle = await this.vehicleRepo.getVehicleById(data.vehicleId);
            if (!vehicle) {
                this.logger.warn(`Vehicle not found: ${data.vehicleId}`);
                throw new microservices_1.RpcException(`Vehicle ${data.vehicleId} not found`);
            }
            const log = await this.vehicleRepo.logMaintenance(data);
            this.logger.log(`Maintenance logged for vehicle ${data.vehicleId}, log ID: ${log.id}`);
            return log;
        }
        catch (error) {
            this.logger.error(`Error logging maintenance for vehicle ${data.vehicleId} and error : ${error.message}`, error.stack);
            throw new microservices_1.RpcException(error.message || 'Failed to log vehicle maintenance');
        }
    }
    async getVehicleMaintenanceHistory(vehicleId, query) {
        try {
            this.logger.log(`Fetching maintenance history for vehicle ${vehicleId}`);
            const vehicle = await this.vehicleRepo.getVehicleById(vehicleId);
            if (!vehicle) {
                this.logger.warn(`Vehicle not found: ${vehicleId}`);
                throw new microservices_1.RpcException(`Vehicle ${vehicleId} not found`);
            }
            const history = await this.vehicleRepo.getMaintenanceHistory(vehicleId, query);
            this.logger.log(`Fetched ${history.length} maintenance records for vehicle ${vehicleId}`);
            return history;
        }
        catch (error) {
            this.logger.error(`Error fetching maintenance history for vehicle ${vehicleId} and error : ${error.message}`, error.stack);
            throw new microservices_1.RpcException(error.message || 'Failed to fetch vehicle maintenance history');
        }
    }
    async getFleetSummary() {
        try {
            this.logger.log('Fetching fleet summary');
            const summary = await this.vehicleRepo.getFleetSummary();
            this.logger.log('Fleet summary fetched successfully');
            return summary;
        }
        catch (error) {
            this.logger.error(`Error fetching fleet summary: ${error.message}`, error.stack);
            throw new microservices_1.RpcException(error.message || 'Failed to fetch fleet summary');
        }
    }
    async getAvailableVehicles() {
        try {
            this.logger.log('Fetching available vehicles');
            const vehicles = await this.vehicleRepo.getAvailableVehicles();
            this.logger.log(`Fetched ${vehicles.length} available vehicles`);
            return vehicles;
        }
        catch (error) {
            this.logger.error(`Error fetching available vehicles: ${error.message}`, error.stack);
            throw new microservices_1.RpcException(error.message || 'Failed to fetch available vehicles');
        }
    }
    async getVehicleHistory(vehicleId) {
        try {
            this.logger.log(`Fetching history for vehicle ${vehicleId}`);
            const vehicle = await this.vehicleRepo.getVehicleById(vehicleId);
            if (!vehicle) {
                this.logger.warn(`Vehicle not found: ${vehicleId}`);
                throw new microservices_1.RpcException(`Vehicle ${vehicleId} not found`);
            }
            const history = await this.vehicleRepo.getVehicleHistory(vehicleId);
            this.logger.log(`Fetched ${history.length || 0} history records for vehicle ${vehicleId}`);
            return history;
        }
        catch (error) {
            this.logger.error(`Error fetching history for vehicle ${vehicleId} and error : ${error.message}`, error.stack);
            throw new microservices_1.RpcException(error.message || 'Failed to fetch vehicle history');
        }
    }
    async retireVehicle(vehicleId) {
        try {
            this.logger.log(`Retiring vehicle ${vehicleId}`);
            const vehicle = await this.vehicleRepo.getVehicleById(vehicleId);
            if (!vehicle) {
                this.logger.warn(`Vehicle not found: ${vehicleId}`);
                throw new microservices_1.RpcException(`Vehicle ${vehicleId} not found`);
            }
            const retired = await this.vehicleRepo.retireVehicle(vehicleId);
            this.logger.log(`Vehicle ${vehicleId} retired successfully`);
            return retired;
        }
        catch (error) {
            this.logger.error(`Error retiring vehicle ${vehicleId} and error : ${error.message}`, error.stack);
            throw new microservices_1.RpcException(error.message || 'Failed to retire vehicle');
        }
    }
    async getFleetAlerts() {
        try {
            this.logger.log('Fetching fleet alerts');
            const alerts = await this.vehicleRepo.getFleetAlerts();
            this.logger.log(`Fetched ${alerts.length} fleet alerts`);
            return alerts;
        }
        catch (error) {
            this.logger.error(`Error fetching fleet alerts: ${error.message}`, error.stack);
            throw new microservices_1.RpcException(error.message || 'Failed to fetch fleet alerts');
        }
    }
    async getDriverVehicleHistory(driverId) {
        try {
            this.logger.log(`Fetching vehicle history for driver ${driverId}`);
            const user = await this.vehicleRepo.findUserById(driverId);
            if (!user) {
                this.logger.warn(`Driver not found: ${driverId}`);
                throw new microservices_1.RpcException(`Driver ${driverId} not found`);
            }
            const history = await this.vehicleRepo.getDriverVehicleHistory(driverId);
            this.logger.log(`Fetched vehicle history for driver ${driverId}`);
            return history;
        }
        catch (error) {
            this.logger.error(`Error fetching vehicle history for driver ${driverId} and error : ${error.message}`, error.stack);
            throw new microservices_1.RpcException(error.message || 'Failed to fetch driver vehicle history');
        }
    }
};
exports.FleetUseCasesImp = FleetUseCasesImp;
exports.FleetUseCasesImp = FleetUseCasesImp = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [fleet_repository_1.VehicleRepository,
        app_logger_service_1.AppLogger])
], FleetUseCasesImp);
//# sourceMappingURL=fleet.usecase.impl.js.map