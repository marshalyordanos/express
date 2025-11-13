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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DispatchGatewayController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const contracts_1 = require("../contracts");
const dispatch_entity_1 = require("../fulfillment/dispatch/dispatch.entity");
const query_dto_1 = require("../common/query/query.dto");
const jwt = require("jsonwebtoken");
const platform_express_1 = require("@nestjs/platform-express");
const cloudinary_uploader_service_1 = require("../common/cloudinary/cloudinary-uploader.service");
let DispatchGatewayController = class DispatchGatewayController {
    constructor(dispatchClient, cloudinaryUploader) {
        this.dispatchClient = dispatchClient;
        this.cloudinaryUploader = cloudinaryUploader;
    }
    async createDispatch() { }
    async assignDispatch(data, req) {
        console.log('data: ', data);
        const authHeader = req.headers['authorization'] || null;
        let token = req.headers['authorization']?.replace('Bearer ', '') || null;
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        let decodedUser = null;
        try {
            decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
        }
        catch (err) {
            throw new common_1.HttpException('Invalid token', common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.dispatchClient.send(contracts_1.PATTERNS.DISPATCH_ASSIGN_DRIVER_FOR_PICKUP, {
            data,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async assignOfficerToBatch(data, req) {
        const authHeader = req.headers['authorization'] || null;
        let token = req.headers['authorization']?.replace('Bearer ', '') || null;
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        let decodedUser = null;
        try {
            decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
        }
        catch (err) {
            throw new common_1.HttpException('Invalid token', common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.dispatchClient.send(contracts_1.PATTERNS.DISPATCH_ASSIGN_OFFICER_TO_BATCH, {
            data,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async acceptDispatch(data, req) {
        const authHeader = req.headers['authorization'] || null;
        let token = req.headers['authorization']?.replace('Bearer ', '') || null;
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        let decodedUser = null;
        try {
            decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
        }
        catch (err) {
            throw new common_1.HttpException('Invalid token', common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.dispatchClient.send(contracts_1.PATTERNS.DISPATCH_COLLECT_BATCH_BY_CARGO_OFFICER, {
            data,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async handoverBatchesToAirport(data, req) {
        const authHeader = req.headers['authorization'] || null;
        let token = req.headers['authorization']?.replace('Bearer ', '') || null;
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        let decodedUser = null;
        try {
            decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
        }
        catch (err) {
            throw new common_1.HttpException('Invalid token', common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.dispatchClient.send(contracts_1.PATTERNS.DISPATCH_HAND_OVER_BATCHES_TO_AIRPORT, {
            data,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async collectFromAirport(data, req) {
        const authHeader = req.headers['authorization'] || null;
        let token = req.headers['authorization']?.replace('Bearer ', '') || null;
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        let decodedUser = null;
        try {
            decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
        }
        catch (err) {
            throw new common_1.HttpException('Invalid token', common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.dispatchClient.send(contracts_1.PATTERNS.DISPATCH_COLLECT_FROM_AIRPORT, {
            data,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async compareOrders(officerId, req) {
        const authHeader = req.headers['authorization'] || null;
        let token = req.headers['authorization']?.replace('Bearer ', '') || null;
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        let decodedUser = null;
        try {
            decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
        }
        catch (err) {
            throw new common_1.HttpException('Invalid token', common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.dispatchClient.send(contracts_1.PATTERNS.DISPATCH_COMPARE_SCANNED_ORDERS, {
            officerId,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async confirmArrivalAndHandover(data, req) {
        const authHeader = req.headers['authorization'] || null;
        let token = req.headers['authorization']?.replace('Bearer ', '') || null;
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        let decodedUser = null;
        try {
            decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
        }
        catch (err) {
            throw new common_1.HttpException('Invalid token', common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.dispatchClient.send(contracts_1.PATTERNS.DISPATCH_CONFIRM_ARRIVAL_AND_HANDOVER, {
            data,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async createBatchDispatch(data, req) {
        const authHeader = req.headers['authorization'] || null;
        let token = req.headers['authorization']?.replace('Bearer ', '') || null;
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        let decodedUser = null;
        try {
            decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
        }
        catch (err) {
            throw new common_1.HttpException('Invalid token', common_1.HttpStatus.UNAUTHORIZED);
        }
        console.log('data: ', data);
        return this.dispatchClient.send(contracts_1.PATTERNS.DISPATCH_APPROVE_CATEGORIZATION, {
            data,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async assignDriverForDelivery(data, req) {
        const authHeader = req.headers['authorization'] || null;
        let token = req.headers['authorization']?.replace('Bearer ', '') || null;
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        let decodedUser = null;
        try {
            decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
        }
        catch (err) {
            throw new common_1.HttpException('Invalid token', common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.dispatchClient.send(contracts_1.PATTERNS.DISPATCH_ASSIGN_DRIVER_FOR_DELIVERY, {
            data,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async lastMileDelivery(data, req) {
        const authHeader = req.headers['authorization'] || null;
        let token = req.headers['authorization']?.replace('Bearer ', '') || null;
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        let decodedUser = null;
        try {
            decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
        }
        catch (err) {
            throw new common_1.HttpException('Invalid token', common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.dispatchClient.send(contracts_1.PATTERNS.DISPATCH_ACCEPT_LAST_MILE_DELIVERY, {
            data,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async completeDelivery(files, data, req) {
        let uploadedImages = [];
        if (files && files.length > 0) {
            console.log('Uploading proof of delivery images...');
            try {
                const fileStreamsOrBuffers = files.map((file) => file.stream || file.buffer);
                uploadedImages = await this.cloudinaryUploader.uploadFiles(fileStreamsOrBuffers, `pod_images/${data.driverId}/${data.orderId}`);
                data.podImages = uploadedImages;
                console.log('Proof of delivery images uploaded successfully.');
            }
            catch (error) {
                console.error('Cloudinary upload failed:', error);
                throw new common_1.HttpException('Failed to upload proof of delivery images', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        else {
            console.log('No files provided — skipping upload.');
            data.podImages = [];
        }
        const authHeader = req.headers['authorization'] || null;
        let decodedUser = null;
        try {
            const token = authHeader?.replace('Bearer ', '');
            decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
        }
        catch {
            throw new common_1.HttpException('Invalid token', common_1.HttpStatus.UNAUTHORIZED);
        }
        console.log('Sending to microservice');
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        console.log('Ip address :::', ip);
        return this.dispatchClient.send(contracts_1.PATTERNS.DISPATCH_COMPLETE_DELIVERY, {
            data,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async changeDriverForOrder(data, req) {
        const authHeader = req.headers['authorization'] || null;
        let token = req.headers['authorization']?.replace('Bearer ', '') || null;
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        let decodedUser = null;
        try {
            decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
        }
        catch (err) {
            throw new common_1.HttpException('Invalid token', common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.dispatchClient.send(contracts_1.PATTERNS.DISPATCH_CHANGE_DRIVER_FOR_ORDER, {
            data,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async removeDriverFromOrder(orderId, req) {
        const authHeader = req.headers['authorization'] || null;
        let token = req.headers['authorization']?.replace('Bearer ', '') || null;
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        let decodedUser = null;
        try {
            decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
        }
        catch (err) {
            throw new common_1.HttpException('Invalid token', common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.dispatchClient.send(contracts_1.PATTERNS.DISPATCH_REMOVE_DRIVER_FROM_ORDER, {
            orderId,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async getAllDispatches(req, query) {
        const authHeader = req.headers['authorization'] || null;
        let token = req.headers['authorization']?.replace('Bearer ', '') || null;
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        let decodedUser = null;
        try {
            decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
        }
        catch (err) {
            throw new common_1.HttpException('Invalid token', common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.dispatchClient.send(contracts_1.PATTERNS.DISPATCH_FIND_ALL, {
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
            query,
        });
    }
    async getDispatchesForOfficer(req, query) {
        const authHeader = req.headers['authorization'] || null;
        let token = req.headers['authorization']?.replace('Bearer ', '') || null;
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        let decodedUser = null;
        try {
            decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
        }
        catch (err) {
            throw new common_1.HttpException('Invalid token', common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.dispatchClient.send(contracts_1.PATTERNS.DISPATCH_FIND_DELIVERED_AND_ONGOING, {
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
            query,
        });
    }
    async addOrderToBatch(batchId, data, req) {
        const authHeader = req.headers['authorization'] || null;
        let token = req.headers['authorization']?.replace('Bearer ', '') || null;
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        let decodedUser = null;
        try {
            decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
        }
        catch (err) {
            throw new common_1.HttpException('Invalid token', common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.dispatchClient.send(contracts_1.PATTERNS.DISPATCH_ADD_ORDERS_TO_BATCH, {
            batchId,
            newOrderIds: data.orders,
            data,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async generateQrCode(data, req) {
        const authHeader = req.headers['authorization'] || null;
        let token = req.headers['authorization']?.replace('Bearer ', '') || null;
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        let decodedUser = null;
        try {
            decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
        }
        catch (err) {
            throw new common_1.HttpException('Invalid token', common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.dispatchClient.send(contracts_1.PATTERNS.DISPATCH_GENERATE_QR_CODE, {
            data,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async createDriver(data, req) {
        const authHeader = req.headers['authorization'] || null;
        let token = req.headers['authorization']?.replace('Bearer ', '') || null;
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        let decodedUser = null;
        try {
            decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
        }
        catch (err) {
            throw new common_1.HttpException('Invalid token', common_1.HttpStatus.UNAUTHORIZED);
        }
        console.log('Create driver datas : ', data);
        return this.dispatchClient.send(contracts_1.PATTERNS.DISPATCH_CREATE_DRIVER, {
            data,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async findDriver(query, req) {
        const authHeader = req.headers['authorization'] || null;
        let token = req.headers['authorization']?.replace('Bearer ', '') || null;
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        let decodedUser = null;
        try {
            decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
        }
        catch (err) {
            throw new common_1.HttpException('Invalid token', common_1.HttpStatus.UNAUTHORIZED);
        }
        console.log('FInd driver querys: ', query);
        return this.dispatchClient.send(contracts_1.PATTERNS.DISPATCH_FIND_DRIVER, {
            query,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async getDispatchById() { }
    async getDispatchByOrderId() { }
    async getDispatchByBranchId() { }
    async getDispatchByStaffId() { }
    async getDispatchByCustomerId() { }
    async getDispatchByDriverId() { }
    async getDispatchByVehicleId() { }
};
exports.DispatchGatewayController = DispatchGatewayController;
__decorate([
    (0, common_1.Post)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DispatchGatewayController.prototype, "createDispatch", null);
__decorate([
    (0, common_1.Post)('/assign-pickup'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dispatch_entity_1.AssignDriverForPickup, Object]),
    __metadata("design:returntype", Promise)
], DispatchGatewayController.prototype, "assignDispatch", null);
__decorate([
    (0, common_1.Post)('/batch/assign-officer'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dispatch_entity_1.AssignOfficerForBatch, Object]),
    __metadata("design:returntype", Promise)
], DispatchGatewayController.prototype, "assignOfficerToBatch", null);
__decorate([
    (0, common_1.Post)('/accept-batch'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dispatch_entity_1.AssignOfficerForBatch, Object]),
    __metadata("design:returntype", Promise)
], DispatchGatewayController.prototype, "acceptDispatch", null);
__decorate([
    (0, common_1.Post)('/handover'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dispatch_entity_1.BatchHandoverDto, Object]),
    __metadata("design:returntype", Promise)
], DispatchGatewayController.prototype, "handoverBatchesToAirport", null);
__decorate([
    (0, common_1.Post)('/collect'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dispatch_entity_1.OrderScanTokenDto, Object]),
    __metadata("design:returntype", Promise)
], DispatchGatewayController.prototype, "collectFromAirport", null);
__decorate([
    (0, common_1.Patch)('/compare/:officerId'),
    __param(0, (0, common_1.Param)('officerId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DispatchGatewayController.prototype, "compareOrders", null);
__decorate([
    (0, common_1.Post)('/confirm-arrival-and-handover'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dispatch_entity_1.ConfirmBatchHandoverDto, Object]),
    __metadata("design:returntype", Promise)
], DispatchGatewayController.prototype, "confirmArrivalAndHandover", null);
__decorate([
    (0, common_1.Post)('/batch'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dispatch_entity_1.BatchDispatchDto, Object]),
    __metadata("design:returntype", Promise)
], DispatchGatewayController.prototype, "createBatchDispatch", null);
__decorate([
    (0, common_1.Post)('/assign-delivery'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dispatch_entity_1.AssignDriverForPickup, Object]),
    __metadata("design:returntype", Promise)
], DispatchGatewayController.prototype, "assignDriverForDelivery", null);
__decorate([
    (0, common_1.Post)('/last-mile-delivery'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dispatch_entity_1.LastMileDeliveryDto, Object]),
    __metadata("design:returntype", Promise)
], DispatchGatewayController.prototype, "lastMileDelivery", null);
__decorate([
    (0, common_1.Post)('/complete-delivery'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('podImages', 5)),
    __param(0, (0, common_1.UploadedFiles)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, dispatch_entity_1.CompleteDeliveryDto, Object]),
    __metadata("design:returntype", Promise)
], DispatchGatewayController.prototype, "completeDelivery", null);
__decorate([
    (0, common_1.Patch)('change-driver'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dispatch_entity_1.AssignDriverForPickup, Object]),
    __metadata("design:returntype", Promise)
], DispatchGatewayController.prototype, "changeDriverForOrder", null);
__decorate([
    (0, common_1.Delete)('remove-driver/:orderId'),
    __param(0, (0, common_1.Param)('orderId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DispatchGatewayController.prototype, "removeDriverFromOrder", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, query_dto_1.ListQueryDto]),
    __metadata("design:returntype", Promise)
], DispatchGatewayController.prototype, "getAllDispatches", null);
__decorate([
    (0, common_1.Get)("/officer"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, query_dto_1.ListQueryDto]),
    __metadata("design:returntype", Promise)
], DispatchGatewayController.prototype, "getDispatchesForOfficer", null);
__decorate([
    (0, common_1.Patch)('/add-order/:batchId'),
    __param(0, (0, common_1.Param)('batchId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], DispatchGatewayController.prototype, "addOrderToBatch", null);
__decorate([
    (0, common_1.Post)('/qr-generate'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dispatch_entity_1.GenerateQrDto, Object]),
    __metadata("design:returntype", Promise)
], DispatchGatewayController.prototype, "generateQrCode", null);
__decorate([
    (0, common_1.Post)('/driver'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dispatch_entity_1.CreateDriver, Object]),
    __metadata("design:returntype", Promise)
], DispatchGatewayController.prototype, "createDriver", null);
__decorate([
    (0, common_1.Get)('/driver'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_dto_1.ListQueryDto, Object]),
    __metadata("design:returntype", Promise)
], DispatchGatewayController.prototype, "findDriver", null);
__decorate([
    (0, common_1.Get)(':id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DispatchGatewayController.prototype, "getDispatchById", null);
__decorate([
    (0, common_1.Get)('/order/:id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DispatchGatewayController.prototype, "getDispatchByOrderId", null);
__decorate([
    (0, common_1.Get)('/branch/:id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DispatchGatewayController.prototype, "getDispatchByBranchId", null);
__decorate([
    (0, common_1.Get)('/staff/:id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DispatchGatewayController.prototype, "getDispatchByStaffId", null);
__decorate([
    (0, common_1.Get)('/customer/:id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DispatchGatewayController.prototype, "getDispatchByCustomerId", null);
__decorate([
    (0, common_1.Get)('/driver/:id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DispatchGatewayController.prototype, "getDispatchByDriverId", null);
__decorate([
    (0, common_1.Get)('/vehicle/:id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DispatchGatewayController.prototype, "getDispatchByVehicleId", null);
exports.DispatchGatewayController = DispatchGatewayController = __decorate([
    (0, common_1.Controller)('dispatch'),
    __param(0, (0, common_1.Inject)('FULFILLMENT_SERVICE')),
    __metadata("design:paramtypes", [microservices_1.ClientProxy,
        cloudinary_uploader_service_1.CloudinaryUploaderService])
], DispatchGatewayController);
//# sourceMappingURL=dispatch.gateway.controller.js.map