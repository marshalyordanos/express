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
exports.BranchUseCaseImpl = void 0;
const common_1 = require("@nestjs/common");
const branch_repository_1 = require("./branch.repository");
const microservices_1 = require("@nestjs/microservices");
const app_logger_service_1 = require("../../common/app-logger.service");
const maps_service_1 = require("../../fulfillment/maps/maps.service");
let BranchUseCaseImpl = class BranchUseCaseImpl {
    constructor(branchRepository, logger, mapService) {
        this.branchRepository = branchRepository;
        this.logger = logger;
        this.mapService = mapService;
        this.logger.setContext('OperationsService', 'BranchUseCaseImpl');
    }
    async revokeManager(branchId, managerId) {
        try {
            this.logger.log(`🧩 Attempting to revoke manager ${managerId} from branch ${branchId}`);
            if (!branchId || !managerId) {
                throw new microservices_1.RpcException({
                    code: 400,
                    message: 'Invalid branch or manager ID',
                });
            }
            const [user, branch] = await this.branchRepository.findBranchAndBranchManager(managerId, branchId);
            if (!user || !branch) {
                this.logger.warn(`⚠️ User or Branch not found during revoke`);
                throw new microservices_1.RpcException({
                    code: 404,
                    message: 'User or Branch not found',
                });
            }
            if (branch.managerId !== managerId) {
                this.logger.warn(`⚠️ Attempted revoke: user ${managerId} is not the manager of branch ${branchId}`);
                throw new microservices_1.RpcException({
                    code: 403,
                    message: 'User is not authorized as manager of this branch',
                });
            }
            await this.branchRepository.revokeManager(branchId, managerId);
            this.logger.log(`✅ Manager ${managerId} successfully revoked from branch ${branchId}`);
            return 'Manager revoked successfully';
        }
        catch (error) {
            this.logger.error(`❌ Error revoking manager ${managerId} from branch ${branchId}: ${error.message}`);
            throw new microservices_1.RpcException({
                code: error.code || 500,
                message: 'Failed to revoke manager',
            });
        }
    }
    async assignManager(branchId, managerId) {
        try {
            this.logger.log(`🧩 Assigning manager ${managerId} to branch ${branchId}`);
            if (!branchId || !managerId) {
                throw new microservices_1.RpcException({
                    code: 400,
                    message: 'Invalid branch or manager ID',
                });
            }
            const [user, branch] = await this.branchRepository.findBranchAndBranchManager(managerId, branchId);
            if (!user || !branch) {
                this.logger.warn(`⚠️ Branch or User not found`);
                throw new microservices_1.RpcException({
                    code: 404,
                    message: 'User or Branch not found',
                });
            }
            if (branch.managerId) {
                this.logger.warn(`⚠️ Branch ${branchId} already has a manager`);
                throw new microservices_1.RpcException({
                    code: 409,
                    message: 'Branch already has a manager',
                });
            }
            const existingManagedBranch = await this.branchRepository.findManagedBranch(branchId, managerId);
            if (existingManagedBranch) {
                this.logger.warn(`⚠️ Manager ${managerId} already manages another branch`);
                throw new microservices_1.RpcException({
                    code: 409,
                    message: 'Manager already assigned to another branch',
                });
            }
            const result = await this.branchRepository.assignManager(branchId, managerId);
            this.logger.log(`✅ Assigned manager ${managerId} to branch ${branchId}`);
            return result;
        }
        catch (error) {
            this.logger.error(`❌ Error assigning manager: ${error.message}`);
            throw new microservices_1.RpcException({
                code: error.code || 500,
                message: 'Failed to assign manager',
            });
        }
    }
    async createBranch(data, userId) {
        try {
            this.logger.log(`🧩 Creating new branch: ${data.name}`);
            const address = await this.mapService.reverseGeocode(data.address.lat, data.address.long);
            this.logger.log(`🧩 Address created for branch with latitude : ${data.address.lat} and longitude ${data.address.long}. and created address response : ${address}`);
            return await this.branchRepository.createBranch(data, address, userId);
        }
        catch (error) {
            this.logger.error(`❌ Failed to create branch: ${error.message}`);
            throw new microservices_1.RpcException({
                code: error.code || 500,
                message: 'Failed to create branch',
            });
        }
    }
    async findAllBranch(query) {
        try {
            this.logger.log(`🔍 Fetching all branches with query: ${JSON.stringify(query)}`);
            return await this.branchRepository.findAllBranch(query);
        }
        catch (error) {
            this.logger.error(`❌ Error fetching branches: ${error.message}`);
            throw new microservices_1.RpcException({
                code: error.code || 500,
                message: 'Failed to fetch branches',
            });
        }
    }
    async findBranchById(id) {
        try {
            this.logger.log(`🔍 Finding branch with ID: ${id}`);
            if (!id) {
                throw new microservices_1.RpcException({ code: 400, message: 'Invalid branch ID' });
            }
            const branch = await this.branchRepository.findBranchById(id);
            if (!branch) {
                this.logger.warn(`⚠️ Branch not found: ${id}`);
                throw new microservices_1.RpcException({ code: 404, message: 'Branch not found' });
            }
            this.logger.log(`✅ Branch ${id} fetched successfully`);
            return branch;
        }
        catch (error) {
            this.logger.error(`❌ Error finding branch: ${error.message}`);
            throw new microservices_1.RpcException({
                code: error.code || 500,
                message: 'Failed to find branch',
            });
        }
    }
    async updateBranch(id, data) {
        try {
            this.logger.log(`🧩 Updating branch ${id} with data: ${JSON.stringify(data)}`);
            if (!id) {
                throw new microservices_1.RpcException({ code: 400, message: 'Invalid branch ID' });
            }
            const updated = await this.branchRepository.updateBranch(id, data);
            this.logger.log(`✅ Branch ${id} updated successfully`);
            return updated;
        }
        catch (error) {
            this.logger.error(`❌ Error updating branch ${id}: ${error.message}`);
            throw new microservices_1.RpcException({
                code: error.code || 500,
                message: 'Failed to update branch',
            });
        }
    }
    async deleteBranch(id) {
        try {
            this.logger.log(`🗑️ Deleting branch ${id}`);
            if (!id) {
                throw new microservices_1.RpcException({ code: 400, message: 'Invalid branch ID' });
            }
            const deleted = await this.branchRepository.deleteBranch(id);
            this.logger.log(`✅ Branch ${id} deleted successfully`);
            return deleted;
        }
        catch (error) {
            this.logger.error(`❌ Error deleting branch ${id}: ${error.message}`);
            throw new microservices_1.RpcException({
                code: error.code || 500,
                message: 'Failed to delete branch',
            });
        }
    }
    async findAllBranchFree(query) {
        try {
            this.logger.log(`🔍 Fetching all branches with query: ${JSON.stringify(query)}`);
            return await this.branchRepository.findAllBranchFree(query);
        }
        catch (error) {
            this.logger.error(`❌ Error fetching branches: ${error.message}`);
            throw new microservices_1.RpcException({
                code: error.code || 500,
                message: 'Failed to fetch branches',
            });
        }
    }
};
exports.BranchUseCaseImpl = BranchUseCaseImpl;
exports.BranchUseCaseImpl = BranchUseCaseImpl = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [branch_repository_1.BranchRepository,
        app_logger_service_1.AppLogger,
        maps_service_1.MapsService])
], BranchUseCaseImpl);
//# sourceMappingURL=branch.useCase.impl.js.map