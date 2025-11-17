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
exports.DispatchUseCasesImpl = void 0;
const common_1 = require("@nestjs/common");
const dispatch_repository_1 = require("./dispatch.repository");
const microservices_1 = require("@nestjs/microservices");
const types_1 = require("../../common/types");
const qr_code_helper_1 = require("../utils/qr-code.helper");
const prisma_service_1 = require("../../prisma/prisma.service");
const handleCatch_1 = require("../../common/handleCatch");
const app_logger_service_1 = require("../../common/app-logger.service");
const notification_publisher_1 = require("../../common/notification-publisher");
let DispatchUseCasesImpl = class DispatchUseCasesImpl {
    constructor(dispatchRepo, qrCodeService, logger, notificationPublisher) {
        this.dispatchRepo = dispatchRepo;
        this.qrCodeService = qrCodeService;
        this.logger = logger;
        this.notificationPublisher = notificationPublisher;
        this.logger.setContext('FulfillmentService', 'DispatchUseCaseImpl');
    }
    async assignDriverForPickup(data, userId) {
        this.logger.log(`Assign driver request received for order ${data.orderId} by user ${userId}`);
        try {
            const driver = await this.dispatchRepo.findDriverById(data.driverId);
            if (!driver) {
                this.logger.warn(`Driver not found: ${data.driverId}`);
                throw new microservices_1.RpcException({
                    statusCode: 404,
                    message: `Driver with ID ${data.driverId} not found.`,
                });
            }
            this.logger.debug(`Driver found: ${driver.user?.name ?? 'N/A'} (ID: ${driver.id})`);
            const order = await this.dispatchRepo.findOrderById(data.orderId);
            if (!order) {
                this.logger.warn(`Order not found: ${data.orderId}`);
                throw new microservices_1.RpcException({
                    statusCode: 404,
                    message: `Order with ID ${data.orderId} not found.`,
                });
            }
            this.logger.debug(`Order found: ID ${order.id}, Status ${order.status}`);
            if (order.pickupDriverId) {
                this.logger.warn(`Order ${order.id} already assigned to driver ID ${order.pickupDriverId}`);
                throw new microservices_1.RpcException({
                    statusCode: 400,
                    message: `Order with ID ${data.orderId} is already assigned to another driver.`,
                });
            }
            if (order.status !== 'CREATED') {
                let message = `Order ${order.id} not eligible for assignment (Status: ${order.status})`;
                if (order.status === 'ASSIGNED') {
                    message = `Order ${order.id} already assigned, driver en route.`;
                }
                this.logger.warn(message);
                throw new microservices_1.RpcException({
                    statusCode: 400,
                    message,
                });
            }
            if (!order.pickupDate) {
                this.logger.warn(`Order ${order.id} missing pickup date`);
                throw new microservices_1.RpcException({
                    statusCode: 400,
                    message: `Order with ID ${data.orderId} does not have a scheduled pickup date.`,
                });
            }
            const now = new Date();
            const pickupDate = new Date(order.pickupDate);
            if (pickupDate < new Date(now.setHours(0, 0, 0, 0))) {
                this.logger.warn(`Invalid pickup date for order ${order.id}: ${pickupDate.toISOString()}`);
                throw new microservices_1.RpcException({
                    statusCode: 400,
                    message: `Order with ID ${data.orderId} has an invalid pickup date (${pickupDate.toISOString()}). Pickup date cannot be in the past.`,
                });
            }
            this.logger.log(`Assigning driver ${driver.id} to order ${order.id}`);
            const updatedOrder = await this.dispatchRepo.assignDriverForPickup(data.driverId, order.id, userId);
            this.logger.verbose(`Driver ${driver.user?.name ?? driver.id} successfully assigned to order ${order.id}`);
            return {
                statusCode: 200,
                message: `Driver ${driver.user.name} (ID: ${driver.user.id}) successfully assigned to order ${order.id}.`,
                data: updatedOrder,
            };
        }
        catch (error) {
            this.logger.error(`Failed to assign driver for order ${data.orderId}: ${error.message}`);
            throw (0, handleCatch_1.handleCatch)(error);
        }
    }
    async getDeliveredAndOnGoingDispatches(userId) {
        this.logger.log(`Getting delivered and on going dispatches for user ${userId}`);
        try {
            const dispatches = await this.dispatchRepo.getDeliveredAndOnGoingDispatches(userId);
            this.logger.log(`Delivered and on going dispatches found ${dispatches.length} for user ${userId}`);
            return types_1.IResponse.success(`Delivered and on going dispatches found for officer ${userId}`, dispatches);
        }
        catch (error) {
            this.logger.error(`Failed to get delivered and on going dispatches for user ${userId}: ${error.message}`);
            throw (0, handleCatch_1.handleCatch)(error);
        }
    }
    async confirmDispatch(data, userId) {
        this.logger.log(`Confirm dispatch request received for officer ${data.officerId}`);
        try {
            const officer = await this.dispatchRepo.findUserById(data.officerId);
            if (!officer) {
                this.logger.warn(`Officer with ID ${data.officerId} not found`);
                throw new common_1.NotFoundException(`Officer with ID ${data.officerId} not found`);
            }
            this.logger.debug(`Officer found: ${officer.name ?? officer.id}`);
            const batches = await this.dispatchRepo.findBatches(data.batchId);
            if (batches.length !== data.batchId.length) {
                const foundIds = batches.map((b) => b.id);
                const missing = data.batchId.filter((id) => !foundIds.includes(id));
                this.logger.warn(`Missing batch IDs: ${missing.join(', ')}`);
                throw new common_1.NotFoundException(`Batch IDs not found: ${missing.join(', ')}`);
            }
            this.logger.debug(`All ${batches.length} batches found for officer ${officer.name ?? officer.id}`);
            this.logger.log(`Assigning officer ${officer.name ?? officer.id} to batches: ${data.batchId.join(', ')}`);
            const result = await this.dispatchRepo.confirmDispatch(data.batchId, data.officerId);
            this.logger.verbose(`Officer ${officer.name ?? officer.id} successfully assigned to ${data.batchId.length} batches.`);
            return {
                success: true,
                message: `Batches are ready for delivering to the airport or assigned to the cargo officer.`,
                result,
            };
        }
        catch (error) {
            this.logger.error(`Failed to confirm dispatch for officer ${data.officerId}: ${error.message}`, error.stack);
            throw (0, handleCatch_1.handleCatch)(error);
        }
    }
    async collectBatchByCargoOfficer(data, userId) {
        this.logger.log(`Collect batch request initiated by user ${userId}.`);
        try {
            if (userId !== data.officerId) {
                this.logger.warn(`Unauthorized attempt: user ${userId} tried to collect batches for officer ${data.officerId}`);
                throw new microservices_1.RpcException({
                    statusCode: 403,
                    message: 'You are not authorized to do this action.',
                });
            }
            const officer = await this.dispatchRepo.findUserById(userId);
            if (!officer) {
                this.logger.warn(`Officer not found: ${userId}`);
                throw new microservices_1.RpcException({
                    statusCode: 404,
                    message: `Officer with ID ${userId} not found.`,
                });
            }
            this.logger.debug(`Officer found: ${officer.name ?? officer.id}`);
            const batches = await this.dispatchRepo.findBatches(data.batchId, userId);
            if (batches.length !== data.batchId.length) {
                const foundIds = batches.map((b) => b.id);
                const missing = data.batchId.filter((id) => !foundIds.includes(id));
                this.logger.warn(`Some batch IDs not found for officer ${officer.id}: ${missing.join(', ')}`);
                throw new common_1.NotFoundException(`Batch IDs not found: ${missing.join(', ')}`);
            }
            this.logger.debug(`All batches validated for collection: ${batches.map((b) => b.id).join(', ')}`);
            this.logger.log(`Officer ${officer.name ?? officer.id} collecting ${batches.length} batches.`);
            const result = await this.dispatchRepo.collectBatchByCargoOfficer(batches.map((b) => b.id), userId);
            this.logger.verbose(`Officer ${officer.name ?? officer.id} successfully collected all assigned batches.`);
            return {
                success: true,
                message: `Batches are collected by the cargo officer.`,
                result,
            };
        }
        catch (error) {
            this.logger.error(`Failed to collect batches for officer ${data.officerId}: ${error.message}`, error.stack);
            throw (0, handleCatch_1.handleCatch)(error);
        }
    }
    async deliverBatchToAirport(data, userId) {
        this.logger.log(`Deliver batch request received from officer ${userId} for ${data.batchIds.length} batches.`);
        try {
            const batches = await this.dispatchRepo.findBatches(data.batchIds, userId);
            this.logger.debug(`Fetched ${batches.length} batches from DB.`);
            if (batches.length !== data.batchIds.length) {
                const foundIds = batches.map((b) => b.id);
                const missing = data.batchIds.filter((id) => !foundIds.includes(id));
                this.logger.warn(`Missing batch IDs: ${missing.join(', ')}`);
                throw new common_1.NotFoundException(`Batch IDs not found: ${missing.join(', ')}`);
            }
            const invalidStatusBatches = batches.filter((b) => b.status !== 'READY' && b.status !== 'COLLECTED');
            if (invalidStatusBatches.length > 0) {
                const ids = invalidStatusBatches.map((b) => b.id);
                this.logger.warn(`Invalid batch status for delivery. Not eligible batches: ${ids.join(', ')}`);
                throw new common_1.BadRequestException(`The following batches cannot be delivered to the airport due to invalid status: ${ids.join(', ')}`);
            }
            this.logger.debug(`All batch statuses validated for delivery.`);
            const officer = await this.dispatchRepo.findUserById(userId);
            if (!officer) {
                this.logger.warn(`Officer with ID ${userId} not found.`);
                throw new microservices_1.RpcException({
                    statusCode: 404,
                    message: `Officer with ID ${userId} not found.`,
                });
            }
            this.logger.debug(`Officer validated: ${officer.name ?? officer.id}`);
            this.logger.log(`Performing handover to airport by officer ${officer.id} for batches: ${data.batchIds.join(', ')}`);
            const result = await this.dispatchRepo.handoverBatchToAirport(batches.map((b) => b.id), userId, {
                method: data.method,
                reference: data.reference,
                notes: data.notes,
                location: 'At Airport',
            });
            this.logger.verbose(`Successfully handed over ${batches.length} batches to the airport by officer ${officer.name ?? officer.id}.`);
            return {
                success: true,
                message: `Batches are successfully delivered to the airport.`,
                result,
            };
        }
        catch (error) {
            this.logger.error(`Failed to deliver batches to airport by officer ${data.handedById}: ${error.message}`, error.stack);
            throw (0, handleCatch_1.handleCatch)(error);
        }
    }
    async assignDriverForDelivery(data) {
        this.logger.log(`Assign driver for delivery request received for order ${data.orderId}`);
        try {
            const result = await this.dispatchRepo.assignDriverForDelivery(data);
            this.logger.verbose(`Driver ${data.driverId} successfully assigned for delivery (order: ${data.orderId}).`);
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to assign driver ${data.driverId} for delivery (order: ${data.orderId}): ${error.message}`, error.stack);
            throw (0, handleCatch_1.handleCatch)(error);
        }
    }
    async assignDriverToOrder(data, userId) {
        const { orderId, driverId } = data;
        this.logger.log(`Assign driver-to-order request received. Order: ${orderId}, Driver: ${driverId}, Requested by: ${userId}`);
        try {
            const order = await this.dispatchRepo.findOrderById(orderId);
            if (!order) {
                this.logger.warn(`Order not found: ${orderId}`);
                throw new microservices_1.RpcException({
                    statusCode: 404,
                    message: `Order with ID ${orderId} not found.`,
                });
            }
            this.logger.debug(`Order found: ID ${order.id}, status ${order.status}`);
            if (order.status === 'ASSIGNED') {
                this.logger.warn(`Order ${orderId} already assigned to another driver or not eligible. Current status: ${order.status}`);
                throw new microservices_1.RpcException({
                    statusCode: 400,
                    message: `Order with ID ${orderId} is not eligible for driver assignment or already assigned to another driver. Current status: ${order.status}.`,
                });
            }
            if (order.deliveryDriverId && order.deliveryDriverId !== driverId) {
                this.logger.warn(`Order ${orderId} already assigned to driver ${order.deliveryDriverId}, cannot reassign to ${driverId}`);
                throw new microservices_1.RpcException({
                    statusCode: 400,
                    message: `Order with ID ${orderId} is already assigned to another driver.`,
                });
            }
            const driver = await this.dispatchRepo.findUserById(driverId);
            if (!driver) {
                this.logger.warn(`Driver not found: ${driverId}`);
                throw new microservices_1.RpcException({
                    statusCode: 404,
                    message: `Driver with ID ${driverId} not found.`,
                });
            }
            this.logger.debug(`Driver validated: ${driver.name ?? driver.id}`);
            this.logger.log(`Assigning driver ${driverId} to order ${orderId}`);
            const result = await this.dispatchRepo.assignOrder(orderId, driverId, userId);
            this.logger.verbose(`Driver ${driver.name ?? driverId} successfully assigned to order ${orderId}`);
            return { success: true, message: 'Driver assigned for delivery', result };
        }
        catch (error) {
            this.logger.error(`Failed to assign driver ${driverId} to order ${data.orderId}: ${error.message}`, error.stack);
            throw (0, handleCatch_1.handleCatch)(error);
        }
    }
    async lastMileDelivery(orderId, driverId, userId, notes) {
        this.logger.log(`Last mile delivery request received. Order: ${orderId}, Driver: ${driverId}, Requested by: ${userId}`);
        try {
            if (userId !== driverId) {
                this.logger.warn(`Unauthorized last-mile attempt by user ${userId} for driver ${driverId}`);
                throw new microservices_1.RpcException({
                    statusCode: 403,
                    message: 'You are not authorized to do this action.',
                });
            }
            const order = await this.dispatchRepo.findOrderById(orderId);
            if (!order) {
                this.logger.warn(`Order not found: ${orderId}`);
                throw new microservices_1.RpcException({
                    statusCode: 404,
                    message: `Order with ID ${orderId} not found.`,
                });
            }
            this.logger.debug(`Order found: ${order.id}, status: ${order.status}`);
            if (order.deliveryDriverId !== driverId) {
                this.logger.warn(`Driver mismatch for order ${orderId}. Assigned: ${order.deliveryDriverId}, Attempted: ${driverId}`);
                throw new microservices_1.RpcException({
                    statusCode: 403,
                    message: `Order with ID ${orderId} is not assigned to this driver.`,
                });
            }
            if (order.status !== 'ASSIGNED') {
                this.logger.warn(`Order ${orderId} not eligible for last mile delivery. Current status: ${order.status}`);
                throw new microservices_1.RpcException({
                    statusCode: 400,
                    message: `Order with ID ${orderId} is not eligible for last mile delivery. Current status: ${order.status}.`,
                });
            }
            this.logger.log(`Processing last mile delivery for order ${orderId}`);
            const result = await this.dispatchRepo.lastMileDelivery(orderId, driverId, notes);
            this.logger.verbose(`Driver ${driverId} successfully started last mile delivery for order ${orderId}`);
            return {
                success: true,
                message: 'Order picked up for last mile delivery by driver',
                result,
            };
        }
        catch (error) {
            this.logger.error(`Failed last mile delivery for order ${orderId} by driver ${driverId}: ${error.message}`, error.stack);
            throw (0, handleCatch_1.handleCatch)(error);
        }
    }
    async completeDelivery(dto, userId) {
        const { orderId, driverId, notes, podImages } = dto;
        this.logger.log(`Completing delivery for order ${orderId} by driver ${driverId}`);
        if (userId !== driverId) {
            throw new microservices_1.RpcException('Unauthorized action');
        }
        try {
            return await this.dispatchRepo.deliverOrderWithPodImages(orderId, driverId, notes, podImages);
        }
        catch (err) {
            this.logger.error(`Delivery failed: ${err.message}`);
            throw err;
        }
    }
    async removeDriverFromOrder(orderId) {
        this.logger.log(`Request to remove driver from order ${orderId}`);
        try {
            const order = await this.dispatchRepo.findOrderById(orderId);
            if (!order) {
                this.logger.warn(`Order not found: ${orderId}`);
                throw new microservices_1.RpcException({
                    statusCode: 404,
                    message: `Order with ID ${orderId} not found.`,
                });
            }
            if (!order.deliveryDriverId) {
                this.logger.warn(`Order ${orderId} is not assigned to any driver.`);
                throw new microservices_1.RpcException({
                    statusCode: 404,
                    message: `Order with ID ${orderId} is not assigned to any driver.`,
                });
            }
            if (['OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status)) {
                this.logger.warn(`Cannot remove driver from order ${orderId} because its status is ${order.status}`);
                throw new microservices_1.RpcException({
                    statusCode: 400,
                    message: `Cannot remove driver. Order is already ${order.status}.`,
                });
            }
            const result = await this.dispatchRepo.removeDriverFromOrder(orderId);
            this.logger.verbose(`Driver removed successfully from order ${orderId}`);
            return {
                success: true,
                message: `Driver removed successfully from order ${orderId}.`,
                result,
            };
        }
        catch (error) {
            this.logger.error(`Failed to remove driver from order ${orderId}: ${error.message}`, error.stack);
            throw (0, handleCatch_1.handleCatch)(error);
        }
    }
    async changeDriverForOrder(data) {
        const { orderId, driverId } = data;
        this.logger.log(`Request received to change driver for order ${orderId} to driver ${driverId}`);
        try {
            const order = await this.dispatchRepo.findOrderById(orderId);
            if (!order) {
                this.logger.warn(`Order not found: ${orderId}`);
                throw new microservices_1.RpcException({
                    statusCode: 404,
                    message: `Order with ID ${orderId} not found.`,
                });
            }
            if (!order.deliveryDriverId) {
                this.logger.warn(`Order ${orderId} currently has no assigned driver.`);
                throw new microservices_1.RpcException({
                    statusCode: 404,
                    message: `Order with ID ${orderId} has no assigned driver.`,
                });
            }
            if (['OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status)) {
                this.logger.warn(`Cannot change driver for order ${orderId} because status is ${order.status}`);
                throw new microservices_1.RpcException({
                    statusCode: 400,
                    message: `Cannot change driver. Order ${orderId} is already ${order.status}.`,
                });
            }
            const driver = await this.dispatchRepo.findUserById(driverId);
            if (!driver) {
                this.logger.warn(`Driver not found: ${driverId}`);
                throw new microservices_1.RpcException({
                    statusCode: 404,
                    message: `Driver with ID ${driverId} not found.`,
                });
            }
            const result = await this.dispatchRepo.changeDriverForOrder(orderId, driverId);
            this.logger.verbose(`Driver for order ${orderId} changed successfully to driver ${driverId}`);
            return {
                success: true,
                message: `Driver for order ${orderId} changed successfully to driver ${driver.name} (ID: ${driver.id}).`,
                result,
            };
        }
        catch (error) {
            this.logger.error(`Failed to change driver for order ${data.orderId}: ${error.message}`, error.stack);
            throw (0, handleCatch_1.handleCatch)(error);
        }
    }
    async createBatchDispatch(dto, userId) {
        this.logger.log(`Received request to create batch dispatch by user ${userId}`);
        this.logger.debug(`Payload received: ${JSON.stringify(dto)}`);
        try {
            this.logger.verbose(`Fetching orders by IDs: ${dto.orders.join(', ')}`);
            const orders = await this.dispatchRepo.findOrdersByIds(dto.orders);
            const foundIds = orders.map((o) => o.id);
            const notFoundIds = dto.orders.filter((id) => !foundIds.includes(id));
            if (notFoundIds.length > 0) {
                this.logger.warn(`Missing order IDs: ${notFoundIds.join(', ')}`);
                throw new microservices_1.RpcException({
                    statusCode: 404,
                    message: `The following order IDs were not found: ${notFoundIds.join(', ')}`,
                });
            }
            const invalidOrders = orders.filter((o) => o.status !== 'APPROVED' && o.status !== 'DISPATCHED');
            const alreadyDispatchedOrders = orders.filter((o) => o.status === 'DISPATCHED');
            if (invalidOrders.length > 0) {
                const invalidIds = invalidOrders.map((o) => o.id);
                this.logger.warn(`Invalid order statuses found for: ${invalidIds.join(', ')}`);
                throw new microservices_1.RpcException({
                    statusCode: 400,
                    message: `The following orders are not approved and cannot be dispatched: ${invalidIds.join(', ')}`,
                });
            }
            if (alreadyDispatchedOrders.length > 0) {
                const dispatchedIds = alreadyDispatchedOrders.map((o) => o.id);
                this.logger.warn(`Orders already dispatched: ${dispatchedIds.join(', ')}`);
                throw new microservices_1.RpcException({
                    statusCode: 400,
                    message: `The following orders are already dispatched: ${dispatchedIds.join(', ')}`,
                });
            }
            const uniqueScopes = [...new Set(orders.map((o) => o.shippingScope))];
            if (uniqueScopes.length > 1) {
                this.logger.warn(`Orders have mixed scopes: ${uniqueScopes.join(', ')}`);
                throw new microservices_1.RpcException({
                    statusCode: 400,
                    message: 'Orders must belong to the same shipping scope for batch dispatch.',
                });
            }
            if (uniqueScopes[0] !== dto.scope) {
                this.logger.warn(`Scope mismatch: expected ${dto.scope}, found ${uniqueScopes[0]}`);
                throw new microservices_1.RpcException({
                    statusCode: 400,
                    message: `Orders scope mismatch. Expected: ${dto.scope}, Found: ${uniqueScopes[0]}`,
                });
            }
            const batchCode = `BATCH-${new Date()
                .toISOString()
                .split('T')[0]
                .replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
            this.logger.log(`Generated new batch code: ${batchCode}`);
            const batch = await this.dispatchRepo.createBatchDispatch(dto, batchCode, userId);
            this.logger.verbose(`Batch created successfully with Code: ${batchCode}`);
            return batch;
        }
        catch (error) {
            this.logger.error(`Failed to create batch dispatch for user ${userId}: ${error.message}`, error.stack);
            throw (0, handleCatch_1.handleCatch)(error);
        }
    }
    async addOrdersToBatch(batchId, newOrderIds, userId, updateData) {
        this.logger.log(`Request to add orders to batch ${batchId} by user ${userId}`);
        this.logger.debug(`Orders to add: ${newOrderIds.join(', ')}`);
        try {
            const batch = await this.dispatchRepo.findBatchById(batchId);
            if (!batch) {
                this.logger.warn(`Batch not found: ${batchId}`);
                throw new microservices_1.RpcException({
                    statusCode: 404,
                    message: `Batch ${batchId} not found.`,
                });
            }
            this.logger.debug(`Batch found: ID ${batch.id}, status ${batch.status}, shipmentDate ${batch.shipmentDate}`);
            const toDateOnly = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const today = toDateOnly(new Date());
            const shipmentDate = toDateOnly(batch.shipmentDate);
            if (shipmentDate < today) {
                this.logger.warn(`Batch ${batchId} shipment date passed: ${shipmentDate.toDateString()}`);
                throw new microservices_1.RpcException({
                    statusCode: 400,
                    message: `Batch ${batchId} has missed its shipment day (${shipmentDate.toDateString()}).`,
                });
            }
            const blockedStatuses = [
                'DISPATCHED',
                'DELIVERED_TO_AIRPORT',
                'ARRIVED_AT_DESTINATION',
                'CLOSED',
                'PICKEDUP',
                'COLLECTED',
                'IN_TRANSIT',
                'OUT_FOR_BRANCH_TRANSFER',
                'OUT_FOR_DELIVERY',
                'COMPLETED',
                'CANCELLED',
            ];
            if (blockedStatuses.includes(batch.status)) {
                this.logger.warn(`Cannot add orders. Batch ${batchId} status: ${batch.status}`);
                throw new microservices_1.RpcException({
                    statusCode: 400,
                    message: `Batch ${batchId} is already in status '${batch.status}' and cannot be modified.`,
                });
            }
            const orders = await this.dispatchRepo.findOrdersByIds(newOrderIds);
            const foundIds = orders.map((o) => o.id);
            const notFoundIds = newOrderIds.filter((id) => !foundIds.includes(id));
            if (notFoundIds.length) {
                this.logger.warn(`Orders not found: ${notFoundIds.join(', ')}`);
                throw new microservices_1.RpcException(`Orders not found: ${notFoundIds.join(', ')}`);
            }
            const invalidOrders = orders.filter((o) => o.status !== 'APPROVED');
            const dispatchedOrders = orders.filter((o) => o.status === 'DISPATCHED');
            if (invalidOrders.length) {
                this.logger.warn(`Orders not approved: ${invalidOrders.map((o) => o.id).join(', ')}`);
                throw new microservices_1.RpcException(`Orders not approved: ${invalidOrders.map((o) => o.id).join(', ')}`);
            }
            if (dispatchedOrders.length) {
                this.logger.warn(`Orders already dispatched: ${dispatchedOrders.map((o) => o.id).join(', ')}`);
                throw new microservices_1.RpcException(`Orders already dispatched: ${dispatchedOrders.map((o) => o.id).join(', ')}`);
            }
            const scopeMismatch = orders.filter((o) => o.shippingScope !== batch.scope);
            if (scopeMismatch.length) {
                this.logger.warn(`Scope mismatch for orders: ${scopeMismatch.map((o) => o.id).join(', ')}`);
                throw new microservices_1.RpcException(`Scope mismatch: ${scopeMismatch.map((o) => o.id).join(', ')}`);
            }
            if (batch.status === 'AT_BRANCH') {
                const branchMismatch = orders.filter((o) => o.branchId !== batch.originId);
                if (branchMismatch.length) {
                    this.logger.warn(`Branch mismatch for orders: ${branchMismatch.map((o) => o.id).join(', ')}`);
                    throw new microservices_1.RpcException({
                        statusCode: 400,
                        message: `Branch mismatch: Orders ${branchMismatch
                            .map((o) => o.id)
                            .join(', ')} do not belong to the batch's origin branch (${batch.originId}).`,
                    });
                }
            }
            const updatedBatch = await this.dispatchRepo.addOrdersToBatch(batchId, newOrderIds, updateData);
            this.logger.verbose(`Orders added successfully to batch ${batchId}`);
            return types_1.IResponse.success('Orders added to batch successfully', updatedBatch);
        }
        catch (error) {
            this.logger.error(`Failed to add orders to batch ${batchId}: ${error.message}`, error.stack);
            throw error instanceof microservices_1.RpcException
                ? error
                : new microservices_1.RpcException(error.message);
        }
    }
    async getBatches(query) {
        this.logger.log(`Fetching batches with query: ${JSON.stringify(query)}`);
        try {
            return await this.dispatchRepo.getBatches(query);
        }
        catch (error) {
            this.logger.error(`Failed to fetch batches: ${error.message}`, error.stack);
            throw new microservices_1.RpcException(error.message);
        }
    }
    async prepareQRCodes(input) {
        this.logger.log(`Preparing QR codes with input: ${JSON.stringify(input)}`);
        try {
            let orders;
            if (input.orderIds && input.orderIds.length > 0) {
                this.logger.verbose(`Fetching orders by IDs: ${input.orderIds.join(', ')}`);
                orders = await this.dispatchRepo.findOrdersByIds(input.orderIds);
            }
            else if (input.batchId) {
                this.logger.verbose(`Fetching orders by batch ID: ${input.batchId}`);
                orders = await this.dispatchRepo.findBatchById(input.batchId);
            }
            else {
                this.logger.warn('No orderIds, batchId, or branchId provided.');
                throw new microservices_1.RpcException('Must provide at least orderIds, batchId, or branchId');
            }
            if (!orders || orders.length === 0) {
                this.logger.warn('No orders found for the given criteria.');
                throw new microservices_1.RpcException('No orders found for the given criteria.');
            }
            if (input.serviceType) {
                orders = orders.filter((o) => o.serviceType === input.serviceType);
                this.logger.verbose(`Filtered orders by serviceType: ${input.serviceType}`);
            }
            if (input.shippingScope) {
                orders = orders.filter((o) => o.shippingScope === input.shippingScope);
                this.logger.verbose(`Filtered orders by shippingScope: ${input.shippingScope}`);
            }
            if (orders.length === 0) {
                this.logger.warn('No orders match the given filters.');
                throw new microservices_1.RpcException('No orders match the given filters.');
            }
            const qrResults = [];
            for (const order of orders) {
                const qrPayload = {
                    trackingCode: order.trackingCode,
                    branchId: order.branchId,
                    serviceType: order.serviceType,
                    weight: order.weight,
                    length: order.length,
                    width: order.width,
                    height: order.height,
                    deliveryAddress: {
                        addressLine: order.deliveryAddress.addressLine,
                        city: order.deliveryAddress.city,
                        country: order.deliveryAddress.country,
                    },
                    batchId: order.batchId,
                    shippingScope: order.shippingScope,
                    shipmentType: order.shipmentType,
                };
                try {
                    this.logger.debug(`Generating QR for order ${order.id}`);
                    const qrCode = await (0, qr_code_helper_1.generateOrderQRCode)(qrPayload);
                    const qrDownloadUrl = `data:image/png;base64,${qrCode.split(',')[1]}`;
                    qrResults.push({
                        orderId: order.id,
                        batchId: order.batchId,
                        trackingCode: order.trackingCode,
                        qrCode,
                        qrDownloadUrl,
                    });
                    this.logger.verbose(`QR generated successfully for order ${order.id}`);
                }
                catch (err) {
                    this.logger.error(`Failed to generate QR for order ${order.id}: ${err}`, err.stack);
                    throw new microservices_1.RpcException(`Failed to generate QR for order ${order.id}: ${err}`);
                }
            }
            this.logger.log(`QR code generation completed for ${qrResults.length} orders.`);
            return qrResults;
        }
        catch (error) {
            this.logger.error(`QR code preparation failed: ${error.message}`, error.stack);
            throw error instanceof microservices_1.RpcException
                ? error
                : new microservices_1.RpcException(error.message);
        }
    }
    async scanOrder(officerId, scannedToken, userId) {
        this.logger.log(`Scan request received by officer ${userId}`);
        let payload;
        try {
            const jsonString = Buffer.from(scannedToken.split(',')[1], 'base64').toString();
            payload = JSON.parse(jsonString);
            this.logger.verbose(`QR token decoded successfully for trackingCode: ${payload.trackingCode}`);
        }
        catch (err) {
            this.logger.error(`Failed to decode QR token: ${err.message}`, err.stack);
            throw new microservices_1.RpcException('Invalid QR token format');
        }
        const order = await this.dispatchRepo.findByTrackingCode(payload.trackingCode);
        if (!order) {
            this.logger.warn(`Order not found for trackingCode: ${payload.trackingCode}`);
            throw new microservices_1.RpcException('Order not found');
        }
        this.logger.verbose(`Order found: ${order.id} for trackingCode: ${order.trackingCode}`);
        let result;
        try {
            result = (0, qr_code_helper_1.decodeAndValidateQRCode)(scannedToken, order);
            this.logger.log(`QR validation result for order ${order.id}: valid=${result.valid}`);
        }
        catch (err) {
            this.logger.error(`QR validation failed for order ${order.id}: ${err.message}`, err.stack);
            throw new microservices_1.RpcException(`QR validation failed: ${err.message}`);
        }
        const location = 'At airport';
        try {
            await this.dispatchRepo.createScan({
                orderId: order.id,
                scannedBy: userId,
                valid: result.valid,
                notes: result.notes,
                batchId: order.batchId ?? undefined,
            }, location);
            this.logger.verbose(`Scan log created for order ${order.id} at ${location}`);
        }
        catch (err) {
            this.logger.error(`Failed to create scan log for order ${order.id}: ${err.message}`, err.stack);
            throw new microservices_1.RpcException(`Failed to create scan log: ${err.message}`);
        }
        return result;
    }
    async compareOrders(officerId, userId) {
        this.logger.log(`Compare orders request by officer ${officerId}`);
        if (userId !== officerId) {
            this.logger.warn(`Unauthorized access attempt by user ${userId} for officer ${officerId}`);
            throw new microservices_1.RpcException({
                statusCode: 403,
                message: 'You are not authorized to do this action.',
            });
        }
        try {
            const officer = await this.dispatchRepo.findUserById(officerId);
            if (!officer) {
                this.logger.warn(`Officer not found: ${officerId}`);
                throw new common_1.NotFoundException(`Officer with ID ${officerId} not found.`);
            }
            this.logger.verbose(`Officer validated: ${officer.id}`);
            if (!officer.branchId) {
                this.logger.warn(`Officer ${officer.id} is not assigned to any branch`);
                throw new common_1.BadRequestException(`Officer ${officer.id} is not assigned to any branch.`);
            }
            const branch = await this.dispatchRepo.findBranchById(officer.branchId);
            if (!branch) {
                this.logger.warn(`Branch not found: ${officer.branchId}`);
                throw new common_1.NotFoundException(`Branch with ID ${officer.branchId} not found.`);
            }
            this.logger.verbose(`Branch validated: ${branch.id}`);
            const batches = await this.dispatchRepo.findBatchesByBranchId(branch.id, [
                'IN_TRANSIT',
                'ARRIVED_AT_DESTINATION',
            ]);
            this.logger.debug(`Found ${batches.length} batches for branch ${branch.id}`);
            if (batches.length === 0) {
                this.logger.log(`No pending batches for branch ${branch.id}`);
                return {
                    message: 'No batches pending for this branch.',
                    missingOrders: [],
                    scannedOrders: [],
                };
            }
            const batchIds = batches.map((b) => b.id);
            const expectedOrders = await this.dispatchRepo.findOrdersByBatchIds(batchIds);
            this.logger.debug(`Total expected orders: ${expectedOrders.length}`);
            const scannedOrders = await this.dispatchRepo.findScannedOrdersByOfficer(officer.id, batchIds);
            this.logger.debug(`Total scanned orders by officer ${officer.id}: ${scannedOrders.length}`);
            const expectedTrackingCodes = expectedOrders.map((o) => o.trackingCode);
            const scannedTrackingCodes = scannedOrders.map((s) => s.order.trackingCode);
            const missingOrders = expectedOrders.filter((o) => !scannedTrackingCodes.includes(o.trackingCode));
            const mismatchedOrders = scannedOrders.filter((s) => !expectedTrackingCodes.includes(s.order.trackingCode));
            this.logger.log(`Comparison completed for officer ${officer.id} at branch ${branch.id}`);
            if (missingOrders.length > 0) {
                this.logger.warn(`Missing orders: ${missingOrders.map((o) => o.trackingCode).join(', ')}`);
            }
            if (mismatchedOrders.length > 0) {
                this.logger.warn(`Mismatched scanned orders: ${mismatchedOrders.map((s) => s.order.trackingCode).join(', ')}`);
            }
            return {
                branchId: branch.id,
                officerId: officer.id,
                totalExpected: expectedOrders.length,
                totalScanned: scannedOrders.length,
                missingOrders: missingOrders.map((o) => ({
                    orderId: o.id,
                    trackingCode: o.trackingCode,
                })),
                mismatchedOrders: mismatchedOrders.map((s) => ({
                    orderId: s.orderId,
                    trackingCode: s.order.trackingCode,
                })),
            };
        }
        catch (error) {
            this.logger.error(`Failed to compare orders: ${error.message}`, error.stack);
            throw error instanceof microservices_1.RpcException
                ? error
                : new microservices_1.RpcException(error.message);
        }
    }
    async confirmHandover(dto) {
        this.logger.log(`Confirm handover request by officer ${dto.handedById}`);
        try {
            const officer = await this.dispatchRepo.findUserById(dto.handedById);
            if (!officer) {
                this.logger.warn(`Officer not found: ${dto.handedById}`);
                throw new microservices_1.RpcException('Officer not found');
            }
            this.logger.verbose(`Officer validated: ${officer.id}`);
            const result = await this.dispatchRepo.confirmBatchHandoverAutomatic(dto.handedById, dto.method, dto.reference, dto.notes);
            this.logger.log(`Handover confirmed by officer ${dto.handedById}`);
            return {
                success: true,
                message: 'All scanned valid orders have been confirmed.',
                ...result,
            };
        }
        catch (error) {
            this.logger.error(`Confirm handover failed: ${error.message}`, error.stack);
            throw error instanceof microservices_1.RpcException
                ? error
                : new microservices_1.RpcException(error.message);
        }
    }
    async createDriver(data) {
        this.logger.log(`Creating driver for user ${data.userId} with vehicle ${data.vehicleId}`);
        try {
            const user = await this.dispatchRepo.findUserById(data.userId);
            if (!user) {
                this.logger.warn(`User not found: ${data.userId}`);
                throw new microservices_1.RpcException({
                    statusCode: 404,
                    message: `User with ID ${data.userId} not found and cannot create driver.`,
                });
            }
            this.logger.verbose(`User validated: ${user.id}`);
            const vehicle = await this.dispatchRepo.findVehicleById(data.vehicleId);
            if (!vehicle) {
                this.logger.warn(`Vehicle not found: ${data.vehicleId}`);
                throw new microservices_1.RpcException({
                    statusCode: 404,
                    message: `Vehicle with ID ${data.vehicleId} not found and cannot create driver.`,
                });
            }
            this.logger.verbose(`Vehicle validated: ${vehicle.id}`);
            const driver = await this.dispatchRepo.createDriver(data);
            this.logger.log(`Driver created successfully for user ${data.userId}`);
            return driver;
        }
        catch (error) {
            this.logger.error(`Failed to create driver: ${error.message}`, error.stack);
            throw error instanceof microservices_1.RpcException
                ? error
                : new microservices_1.RpcException(error.message);
        }
    }
    async findDriver(query) {
        this.logger.log(`Finding drivers with query: ${JSON.stringify(query)}`);
        try {
            const drivers = await this.dispatchRepo.findDriver(query);
            this.logger.verbose(`Found ${drivers.pagination.total} drivers`);
            return drivers;
        }
        catch (error) {
            this.logger.error(`Find driver failed: ${error.message}`, error.stack);
            throw new microservices_1.RpcException(error.message);
        }
    }
    async retryNotification(event, payload, attempts = 3, delayMs = 200) {
        for (let i = 0; i < attempts; i++) {
            try {
                await this.notificationPublisher.publish(event, payload);
                return;
            }
            catch (err) {
                this.logger.warn(`Notification attempt ${i + 1} failed for event ${event}: ${err.message}`);
                if (i < attempts - 1) {
                    await new Promise((res) => setTimeout(res, delayMs * Math.pow(2, i)));
                }
                else {
                    this.logger.error(`Notification failed after ${attempts} attempts for event ${event}`);
                }
            }
        }
    }
    async createDriverAssignmentRequests(data, userId) {
        this.logger.log(`Creating assignment requests for order ${data.orderId} → drivers: [${data.driverIds.join(', ')}] and initiated by user ${userId}`);
        try {
            const tasks = data.driverIds.map((driverId) => this.dispatchRepo.upsertAssignmentRequest({
                orderId: data.orderId,
                driverId,
                status: 'PENDING',
                sentAt: new Date(),
                expiresAt: data.expiresAt,
            }));
            await Promise.all(tasks);
            await Promise.all(data.driverIds.map((driverId) => this.retryNotification('assignment.requested', {
                type: 'assignment.requested',
                userId: driverId,
                message: `You have a new order assignment request.`,
                payload: { orderId: data.orderId },
            })));
            this.logger.log(`Successfully created ${data.driverIds.length} assignment requests for order ${data.orderId}`);
            return { success: true };
        }
        catch (error) {
            this.logger.error(`Failed creating assignment requests for order ${data.orderId}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async driverAccept(orderId, driverId) {
        this.logger.log(`Driver ${driverId} attempting to accept order ${orderId}`);
        try {
            const result = await this.dispatchRepo.assignOrderAtomic(orderId, driverId);
            if (result.count === 0) {
                this.logger.warn(`Order ${orderId} already assigned — driver ${driverId} rejected`);
                return { assigned: false, reason: 'already_assigned' };
            }
            const routesegment = await this.dispatchRepo.findRouteSegmentByOrderId(orderId);
            await Promise.all([
                this.dispatchRepo.markAccepted(orderId, driverId),
                this.dispatchRepo.expireOtherDrivers(orderId, driverId),
            ]);
            const losers = await this.dispatchRepo.findExcludedDrivers(orderId, driverId);
            (async () => {
                try {
                    await this.retryNotification('assignment.accepted', {
                        type: 'assignment.accepted',
                        userId: driverId,
                        payload: { orderId },
                        message: `You have been assigned to the order : ${orderId}.`,
                    });
                    for (const loserId of losers) {
                        await this.retryNotification('assignment.expired', {
                            type: 'assignment.expired',
                            userId: loserId,
                            payload: { orderId },
                            message: `You have been expired for order ${orderId}.`,
                        });
                    }
                }
                catch (notifyError) {
                    this.logger.error('Notification failed', notifyError);
                }
            })();
            return { assigned: true };
        }
        catch (error) {
            this.logger.error(`Driver ${driverId} failed to accept order ${orderId}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async expire(orderId) {
        this.logger.log(`Expiring pending assignment requests for order ${orderId}`);
        try {
            const result = await this.dispatchRepo.expirePendingRequests(orderId);
            this.logger.log(`Expired ${result.count} pending requests for order ${orderId}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to expire requests for order ${orderId}: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.DispatchUseCasesImpl = DispatchUseCasesImpl;
exports.DispatchUseCasesImpl = DispatchUseCasesImpl = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [dispatch_repository_1.DispatchRepository,
        prisma_service_1.PrismaService,
        app_logger_service_1.AppLogger,
        notification_publisher_1.NotificationPublisher])
], DispatchUseCasesImpl);
//# sourceMappingURL=dispatch.usecase.impl.js.map