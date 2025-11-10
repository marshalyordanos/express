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
exports.OrderUseCasesImpl = void 0;
const common_1 = require("@nestjs/common");
const order_repository_1 = require("./order.repository");
const microservices_1 = require("@nestjs/microservices");
const maps_service_1 = require("../maps/maps.service");
const handleCatch_1 = require("../../common/handleCatch");
const app_logger_service_1 = require("../../common/app-logger.service");
const pricing_usecase_impl_1 = require("../pricing/pricing.usecase.impl");
const notification_publisher_1 = require("../../common/notification-publisher");
let OrderUseCasesImpl = class OrderUseCasesImpl {
    constructor(orderRepo, mapsService, pricingUseCases, logger, notificationPublisher) {
        this.orderRepo = orderRepo;
        this.mapsService = mapsService;
        this.pricingUseCases = pricingUseCases;
        this.logger = logger;
        this.notificationPublisher = notificationPublisher;
        this.logger.setContext('FulfillmentService', 'OrderUsecaseImpl');
    }
    async createOrder(data, userId) {
        this.logger.log(`Order creation requested by userId: ${userId}`);
        try {
            let customer = (data.customerId &&
                (await this.orderRepo.findCustomer(data.customerId))) ||
                ((data.email || data.phone) &&
                    (await this.orderRepo.findCustomerByEmailOrPhone(data.email, data.phone)));
            if (customer && customer.id !== userId) {
                this.logger.warn(`Unauthorized order creation attempt by userId: ${userId}, customerId: ${customer.id}`);
                throw new microservices_1.RpcException({
                    statusCode: 403,
                    message: 'You are not authorized to create this order.',
                });
            }
            let receiver = (data.receiverId &&
                (await this.orderRepo.findCustomer(data.receiverId))) ||
                ((data.receiverEmail || data.receiverPhone) &&
                    (await this.orderRepo.findCustomerByEmailOrPhone(data.receiverEmail, data.receiverPhone)));
            if (!customer) {
                if (!data.name || (!data.email && !data.phone)) {
                    this.logger.warn(`Customer details missing for order creation by userId: ${userId}`);
                    throw new microservices_1.RpcException({
                        statusCode: 400,
                        message: 'Customer not found or required details not provided',
                    });
                }
                customer = await this.orderRepo.createCustomer({
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                    userId,
                });
                this.logger.verbose(`Customer with id: ${customer.id} created with notification preference`);
            }
            if (!receiver) {
                if (!data.receiverName ||
                    (!data.receiverEmail && !data.receiverPhone)) {
                    this.logger.warn(`Receiver details missing for order creation by userId: ${userId}`);
                    throw new microservices_1.RpcException({
                        statusCode: 400,
                        message: 'Receiver not found or required details not provided',
                    });
                }
                receiver = await this.orderRepo.findOrCreateCustomer({
                    name: data.receiverName,
                    email: data.receiverEmail,
                    phone: data.receiverPhone,
                    userId,
                });
                this.logger.verbose(`Receiver created with id: ${receiver.id}`);
            }
            const username = customer.name.substring(0, 3).toUpperCase();
            const trackingCode = this.generateTrackingCode(username);
            let pickupAddress = null;
            if (data.fulfillmentType === 'PICKUP') {
                pickupAddress = await this.mapsService.reverseGeocode(data.pickupAddress.lat, data.pickupAddress.long);
                this.logger.verbose('Pickup address resolved');
            }
            const deliveryAddress = await this.mapsService.reverseGeocode(data.deliveryAddress.lat, data.deliveryAddress.long);
            this.logger.verbose('Delivery address resolved');
            const order = await this.orderRepo.createOrderWithAddresses(data, customer.id, receiver.id, trackingCode, pickupAddress, deliveryAddress, userId);
            let origin;
            if (order.pickupAddress) {
                origin = {
                    lat: Number(order.pickupAddress.lat),
                    lon: Number(order.pickupAddress.long),
                };
            }
            else {
                origin = (await this.orderRepo.getBranchCoordinates(data.branchId));
            }
            const destination = {
                lat: Number(order.deliveryAddress.lat),
                lon: Number(order.deliveryAddress.long),
            };
            console.log('before calculating : ', origin, destination);
            this.calculateDistanceAndPrice(order.id, origin, destination);
            this.logger.log(`Order created successfully with id: ${order.id}, trackingCode: ${trackingCode}`);
            await this.notificationPublisher.publish('order.created', {
                type: 'order.created',
                userId,
                userEmail: customer.email,
                subject: 'New Order created',
                message: `Your order ${order.trackingCode} has been created.`,
                payload: { orderId: order.id, tracking: trackingCode },
            });
            return order;
        }
        catch (error) {
            this.logger.error(`Order creation failed for userId: ${userId}: ${error.message}`);
            throw (0, handleCatch_1.handleCatch)(error);
        }
    }
    async calculateDistanceAndPrice(orderId, origin, destination) {
        console.log('Corrected to be calculated origin and destination :: ', origin, destination);
        const distance = await this.mapsService.calculateDistance(origin, destination);
        console.log('calculated data for distance ::: ', distance);
        await this.updateOrderDistance(orderId, distance);
        const priceData = await this.pricingUseCases.calculatePrice(orderId);
        console.log('Calculated data for price ::: ', priceData);
        console.log(`responsing after calculating of distance ${distance} and price ${priceData}`);
        return { distance, priceData };
    }
    async createUserOrder(data) {
        this.logger.log('User order creation requested');
        try {
            let customer = (data.customerId &&
                (await this.orderRepo.findCustomer(data.customerId))) ||
                ((data.email || data.phone) &&
                    (await this.orderRepo.findCustomerByEmailOrPhone(data.email, data.phone)));
            let receiver = (data.receiverId &&
                (await this.orderRepo.findCustomer(data.receiverId))) ||
                ((data.receiverEmail || data.receiverPhone) &&
                    (await this.orderRepo.findCustomerByEmailOrPhone(data.receiverEmail, data.receiverPhone)));
            if (!customer) {
                if (!data.name || (!data.email && !data.phone)) {
                    this.logger.warn('Customer not found or required details missing');
                    throw new microservices_1.RpcException({
                        statusCode: 400,
                        message: 'Customer not found or required details not provided',
                    });
                }
                customer = await this.orderRepo.createCustomer({
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                });
                this.logger.verbose(`Customer created with id: ${customer.id}`);
            }
            if (!receiver) {
                if (!data.receiverName ||
                    (!data.receiverEmail && !data.receiverPhone)) {
                    this.logger.warn('Receiver not found or required details missing');
                    throw new microservices_1.RpcException({
                        statusCode: 400,
                        message: 'Receiver not found or required details not provided',
                    });
                }
                receiver = await this.orderRepo.findOrCreateCustomer({
                    name: data.receiverName,
                    email: data.receiverEmail,
                    phone: data.receiverPhone,
                });
                this.logger.verbose(`Receiver created with id: ${receiver.id}`);
            }
            const username = customer.name.substring(0, 3).toUpperCase();
            const trackingCode = this.generateTrackingCode(username);
            let pickupAddress = null;
            if (data.fulfillmentType === 'PICKUP') {
                pickupAddress = await this.mapsService.reverseGeocode(data.pickupAddress.lat, data.pickupAddress.long);
                this.logger.verbose('Pickup address resolved ::: ', pickupAddress);
            }
            const deliveryAddress = await this.mapsService.reverseGeocode(data.deliveryAddress.lat, data.deliveryAddress.long);
            this.logger.verbose('Delivery address resolved ::: ', deliveryAddress);
            const order = await this.orderRepo.createOrderWithAddresses(data, customer.id, receiver.id, trackingCode, pickupAddress, deliveryAddress);
            let origin;
            if (order.pickupAddress) {
                origin = {
                    lat: Number(order.pickupAddress.lat),
                    lon: Number(order.pickupAddress.long),
                };
            }
            else {
                origin = (await this.orderRepo.getBranchCoordinates(data.branchId));
            }
            const destination = {
                lat: Number(order.deliveryAddress.lat),
                lon: Number(order.deliveryAddress.long),
            };
            console.log('before calculating : ', origin, destination);
            this.calculateDistanceAndPrice(order.id, origin, destination);
            this.logger.log(`Order created successfully with id: ${order.id}, trackingCode: ${trackingCode}`);
            return order;
        }
        catch (error) {
            this.logger.error(`User order creation failed: ${error.message}`);
            throw (0, handleCatch_1.handleCatch)(error);
        }
    }
    async solveExceptions(orderId, data, userId) {
        this.logger.log(`Solve exception requested for orderId=${orderId} by userId=${userId}`);
        try {
            const order = await this.orderRepo.getOrderById(orderId);
            if (!order) {
                this.logger.warn(`Order not found: ${orderId}`);
                throw new microservices_1.RpcException({
                    statusCode: 404,
                    message: `Order with ID ${orderId} not found`,
                });
            }
            if (order.status !== 'EXCEPTION') {
                this.logger.warn(`Order ${orderId} not in exception state`);
                throw new microservices_1.RpcException({
                    statusCode: 400,
                    message: `Order with ID ${orderId} is not in exception state`,
                });
            }
            const result = await this.orderRepo.solveException(orderId, data, userId);
            this.logger.log(`Order exception solved for orderId=${orderId}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to solve exception for orderId=${orderId}: ${error.message}`);
            throw (0, handleCatch_1.handleCatch)(error);
        }
    }
    async acceptDropOff(trackingCode) {
        this.logger.log(`Accept drop-off requested for trackingCode=${trackingCode}`);
        try {
            const order = await this.orderRepo.getOrderByTrackingCode(trackingCode);
            if (!order) {
                this.logger.warn(`Order not found for trackingCode=${trackingCode}`);
                throw new microservices_1.RpcException({
                    statusCode: 404,
                    message: `Order with tracking code ${trackingCode} not found`,
                });
            }
            console.log('Pickup driver branch id :: ', order.pickupDriver?.branchId);
            const branchId = order.branchId ?? order.pickupDriver?.branchId;
            if (!branchId) {
                this.logger.warn(`Branch not assigned for order trackingCode=${trackingCode}`);
                throw new microservices_1.RpcException({
                    statusCode: 400,
                    message: `Order with tracking code ${trackingCode} does not have a branch assigned`,
                });
            }
            const branch = await this.orderRepo.findBranch(branchId);
            if (!branch) {
                this.logger.warn(`Branch not found: ${branchId} for order trackingCode=${trackingCode}`);
                throw new microservices_1.RpcException({
                    statusCode: 404,
                    message: `Branch with ID ${branchId} not found for order ${trackingCode}`,
                });
            }
            if (order.status !== 'CREATED' && order.status !== 'PICKED_UP') {
                this.logger.warn(`Order status invalid for drop-off: trackingCode=${trackingCode}, status=${order.status}`);
                throw new microservices_1.RpcException({
                    statusCode: 400,
                    message: `Order with tracking code ['${trackingCode}'] or Order Id ['${order.id}'] cannot be collected because it must be in CREATED or PICKED_UP state`,
                });
            }
            const updatedBy = order.customerId;
            const result = await this.orderRepo.acceptDropOffOrder(trackingCode, order.id, branchId, updatedBy, branch.location);
            this.logger.log(`Drop-off accepted for orderId=${order.id}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to accept drop-off for trackingCode=${trackingCode}: ${error.message}`);
            throw (0, handleCatch_1.handleCatch)(error);
        }
    }
    async confirmPickupOrder(orderId, driverId, userId) {
        this.logger.log(`Confirm pickup requested for orderId=${orderId} by userId=${userId}`);
        try {
            if (userId !== driverId) {
                this.logger.warn(`Unauthorized pickup attempt by userId=${userId}`);
                throw new microservices_1.RpcException({
                    statusCode: 403,
                    message: 'You are not authorized for this request',
                });
            }
            const order = await this.orderRepo.getOrderById(orderId);
            if (!order) {
                this.logger.warn(`Order not found: ${orderId}`);
                throw new microservices_1.RpcException({
                    statusCode: 404,
                    message: `Order with ID ${orderId} not found`,
                });
            }
            if (order.pickupDriverId !== userId) {
                this.logger.warn(`Order ${orderId} not assigned to driver ${userId}`);
                throw new microservices_1.RpcException({
                    statusCode: 403,
                    message: `Order with ID ${orderId} is not assigned to this driver`,
                });
            }
            if (order.status !== 'ASSIGNED') {
                this.logger.warn(`Order ${orderId} status invalid for pickup: ${order.status}`);
                throw new microservices_1.RpcException({
                    statusCode: 400,
                    message: `Order with Tracking code ['${order.trackingCode}'] or Order Id ['${order.id}'] is not in ASSIGNED state for pickup`,
                });
            }
            const location = order.pickupAddress.addressLine;
            const result = await this.orderRepo.confirmPickupOrder(orderId, location, userId);
            this.logger.log(`Pickup confirmed for orderId=${orderId} at location=${location}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to confirm pickup for orderId=${orderId}: ${error.message}`);
            throw (0, handleCatch_1.handleCatch)(error);
        }
    }
    async validateOrder(orderId, data, userId) {
        this.logger.log(`Validate order requested for orderId=${orderId} by userId=${userId}`);
        try {
            const order = await this.orderRepo.getOrderById(orderId);
            if (!order) {
                this.logger.warn(`Order not found: ${orderId}`);
                throw new microservices_1.RpcException({
                    statusCode: 404,
                    message: `Order with ID ${orderId} not found.`,
                });
            }
            this.logger.log(`Order found: ${order.id}`);
            const officer = await this.orderRepo.findStaffById(userId);
            if (!officer) {
                this.logger.warn(`Officer not found: ${userId}`);
                throw new microservices_1.RpcException({
                    statusCode: 404,
                    message: `Officer with ID ${userId} not found.`,
                });
            }
            let location = null;
            if (order.branchId || officer.branchId) {
                const branchId = order.branchId ?? officer.branchId;
                const branch = await this.orderRepo.findBranch(branchId);
                location = branch?.location ?? null;
                this.logger.log(`Branch location determined: ${location}`);
            }
            if (!location) {
                this.logger.warn(`No branch location for orderId=${orderId}`);
                throw new microservices_1.RpcException({
                    statusCode: 404,
                    message: `Order with ID ${order.id} has no branch.`,
                });
            }
            if (order.status !== 'DROPPED_OFF') {
                this.logger.warn(`Order status invalid for validation: ${order.status}`);
                throw new microservices_1.RpcException({
                    statusCode: 400,
                    message: `Order with Tracking code ['${order.trackingCode}'] cannot be validated. It is already validated or not collected.`,
                });
            }
            const result = await this.orderRepo.validateOrder(orderId, userId, location, data);
            this.logger.log(`Order validated successfully: orderId=${orderId}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to validate order ${orderId}: ${error.message}`);
            throw (0, handleCatch_1.handleCatch)(error);
        }
    }
    async markUnusualOrder(orderId, data) {
        this.logger.log(`Mark unusual order requested for orderId=${orderId}`);
        try {
            const order = await this.orderRepo.getOrderById(orderId);
            if (!order) {
                this.logger.warn(`Order not found: ${orderId}`);
                throw new microservices_1.RpcException({
                    statusCode: 404,
                    message: `Order with ID ${orderId} not found.`,
                });
            }
            const result = await this.orderRepo.markUnusualOrder(orderId, data);
            this.logger.log(`Order marked as unusual successfully: orderId=${orderId}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to mark unusual order ${orderId}: ${error.message}`);
            throw (0, handleCatch_1.handleCatch)(error);
        }
    }
    async approveOrder(orderId, reason, userId) {
        this.logger.log(`Approve order requested for orderId=${orderId} by userId=${userId}`);
        try {
            const order = await this.orderRepo.getOrderById(orderId);
            if (!order) {
                this.logger.warn(`Order not found: ${orderId}`);
                throw new microservices_1.RpcException({
                    statusCode: 404,
                    message: `Order with ID ${orderId} not found.`,
                });
            }
            if (order.status !== 'PENDING_APPROVAL') {
                this.logger.warn(`Order status invalid for approval: ${order.status}`);
                throw new microservices_1.RpcException({
                    statusCode: 400,
                    message: `Order with Tracking code ['${order.trackingCode}'] cannot be approved. It may not be validated or already approved.`,
                });
            }
            const location = order.branchId;
            const result = await this.orderRepo.approveOrder(order, reason, location, userId);
            this.logger.log(`Order approved successfully: orderId=${orderId}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to approve order ${orderId}: ${error.message}`);
            throw (0, handleCatch_1.handleCatch)(error);
        }
    }
    async getAllOrders(query) {
        this.logger.log(`Fetching all orders with query: ${JSON.stringify(query)}`);
        try {
            const result = await this.orderRepo.getAllOrders(query);
            this.logger.log(`Fetched ${result.pagination.total} orders successfully`);
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to fetch orders: ${error.message}`);
            throw (0, handleCatch_1.handleCatch)(error);
        }
    }
    async getOrderById(id) {
        this.logger.log(`Fetching order by ID: ${id}`);
        try {
            const order = await this.orderRepo.getOrderById(id);
            if (!order) {
                this.logger.warn(`Order not found: ${id}`);
                throw new microservices_1.RpcException({
                    statusCode: 404,
                    message: `Order with ID ${id} not found.`,
                });
            }
            this.logger.log(`Order fetched successfully: ${id}`);
            return order;
        }
        catch (error) {
            this.logger.error(`Failed to fetch order ${id}: ${error.message}`);
            throw (0, handleCatch_1.handleCatch)(error);
        }
    }
    async getException(query) {
        this.logger.log(`Fetching exceptions with query: ${JSON.stringify(query)}`);
        try {
            const exceptions = await this.orderRepo.getException(query);
            this.logger.log(`Fetched ${exceptions.pagination.total} exceptions successfully`);
            return exceptions;
        }
        catch (error) {
            this.logger.error(`Failed to fetch exceptions: ${error.message}`);
            throw (0, handleCatch_1.handleCatch)(error);
        }
    }
    async updateOrder(orderId, data, userId) {
        this.logger.log(`Updating order ${orderId} by user ${userId}`);
        try {
            const order = await this.orderRepo.getOrderById(orderId);
            if (!order) {
                this.logger.warn(`Order not found: ${orderId}`);
                throw new microservices_1.RpcException({
                    statusCode: 404,
                    message: `Order with ID ${orderId} not found.`,
                });
            }
            const updatedOrder = await this.orderRepo.updateOrder(orderId, data, userId);
            this.logger.log(`Order updated successfully: ${orderId}`);
            return updatedOrder;
        }
        catch (error) {
            this.logger.error(`Failed to update order ${orderId}: ${error.message}`);
            throw (0, handleCatch_1.handleCatch)(error);
        }
    }
    deleteOrder(id) {
        throw new Error('Method not implemented.');
    }
    async trackOrder(code) {
        this.logger.log(`Tracking order with code: ${code}`);
        try {
            const order = await this.orderRepo.getOrderByTrackingCode(code);
            if (!order) {
                this.logger.warn(`Order not found for code: ${code}`);
                throw new microservices_1.RpcException({
                    statusCode: 404,
                    message: `Order with tracking code ${code} not found`,
                });
            }
            const tracking = await this.orderRepo.trackOrder(order.id);
            if (!tracking) {
                this.logger.warn(`Tracking info not found for order code: ${code}`);
                throw new microservices_1.RpcException({
                    statusCode: 404,
                    message: `Order with tracking code ${code} does not have tracking info`,
                });
            }
            this.logger.log(`Order tracking fetched successfully for code: ${code}`);
            return { order, tracking };
        }
        catch (error) {
            this.logger.error(`Failed to track order ${code}: ${error.message}`);
            throw (0, handleCatch_1.handleCatch)(error);
        }
    }
    async trackUserOrder(code, userId) {
        this.logger.log(`Tracking user order with code: ${code}, userId: ${userId}`);
        try {
            const order = await this.orderRepo.getOrderByTrackingCode(code, userId);
            if (!order) {
                this.logger.warn(`User order not found for code: ${code}, userId: ${userId}`);
                throw new microservices_1.RpcException({
                    statusCode: 404,
                    message: `Order with tracking code ${code} not found`,
                });
            }
            const tracking = await this.orderRepo.trackOrder(order.id);
            if (!tracking) {
                this.logger.warn(`Tracking info not found for order code: ${code}`);
                throw new microservices_1.RpcException({
                    statusCode: 404,
                    message: `Order with tracking code ${code} does not have tracking info`,
                });
            }
            this.logger.log(`User order tracking fetched successfully for code: ${code}`);
            return { order, tracking };
        }
        catch (error) {
            this.logger.error(`Failed to track user order ${code}: ${error.message}`);
            throw (0, handleCatch_1.handleCatch)(error);
        }
    }
    async getOrdersGroupedByScope(query) {
        this.logger.log('Fetching orders grouped by shipping scope');
        try {
            const result = await this.orderRepo.getOrdersGroupedByScope(query);
            const grouped = {
                TOWN: { STANDARD: [], EXPRESS: [], SAME_DAY: [], OVERNIGHT: [] },
                REGIONAL: { STANDARD: [], EXPRESS: [], SAME_DAY: [], OVERNIGHT: [] },
                INTERNATIONAL: {
                    STANDARD: [],
                    EXPRESS: [],
                    SAME_DAY: [],
                    OVERNIGHT: [],
                },
            };
            for (const order of result.orders) {
                if (order.shippingScope && order.serviceType) {
                    grouped[order.shippingScope][order.serviceType].push(order);
                }
            }
            this.logger.log('Orders grouped successfully');
            return { grouped, pagination: result.pagination };
        }
        catch (error) {
            this.logger.error(`Failed to fetch grouped orders: ${error.message}`);
            throw (0, handleCatch_1.handleCatch)(error);
        }
    }
    async getOrderStatusLog(query) {
        this.logger.log('Fetching order status logs');
        try {
            const result = await this.orderRepo.getOrderStatusLog(query);
            const ordersLogGrouped = Object.entries(result.orders.reduce((acc, log) => {
                if (!acc[log.orderId])
                    acc[log.orderId] = [];
                acc[log.orderId].push(log);
                return acc;
            }, {})).map(([orderId, logs]) => ({ id: orderId, logs }));
            this.logger.log('Order status logs fetched successfully');
            return { orders: ordersLogGrouped, pagination: result.pagination };
        }
        catch (error) {
            this.logger.error(`Failed to fetch order status logs: ${error.message}`);
            throw (0, handleCatch_1.handleCatch)(error);
        }
    }
    async getPendingApproval(query) {
        this.logger.log('Fetching orders pending approval');
        try {
            const result = await this.orderRepo.getPendingApprovals(query);
            this.logger.log('Pending approval orders fetched successfully');
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to fetch pending approvals: ${error.message}`);
            throw (0, handleCatch_1.handleCatch)(error);
        }
    }
    async cancelOrder(data, userId) {
        const { orderId, reason } = data;
        this.logger.log(`Cancelling order ${orderId} by user ${userId}`);
        try {
            const result = await this.orderRepo.cancelOrder(orderId, reason, userId);
            this.logger.log(`Order ${orderId} cancelled successfully`);
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to cancel order ${orderId}: ${error.message}`);
            throw (0, handleCatch_1.handleCatch)(error);
        }
    }
    async addException(data, userId) {
        const { orderId, reason, type } = data;
        this.logger.log(`Adding exception to order ${orderId} by user ${userId}`);
        try {
            const order = await this.orderRepo.getOrderById(orderId);
            if (!order) {
                this.logger.warn(`Order not found: ${orderId}`);
                throw new microservices_1.RpcException({
                    statusCode: 404,
                    message: `Order with id ${orderId} not found`,
                });
            }
            const exception = await this.orderRepo.addException(orderId, reason, type, userId);
            if (!exception) {
                this.logger.warn(`Failed to add exception for order: ${orderId}`);
                throw new microservices_1.RpcException({
                    statusCode: 500,
                    message: `Could not add exception for order ${orderId}`,
                });
            }
            this.logger.log(`Exception added successfully for order ${orderId}`);
            return exception;
        }
        catch (error) {
            this.logger.error(`Add exception failed for order ${orderId}: ${error.message}`);
            throw (0, handleCatch_1.handleCatch)(error);
        }
    }
    async updateOrderDistance(orderId, distance) {
        this.logger.log(`Updating distance for order ${orderId} to ${distance}km`);
        try {
            const result = await this.orderRepo.updateOrderDistance(orderId, distance);
            this.logger.log(`Distance updated successfully for order ${orderId}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Update distance failed for order ${orderId}: ${error.message}`);
            throw (0, handleCatch_1.handleCatch)(error);
        }
    }
    generateTrackingCode(username) {
        if (!username || username.length !== 3) {
            this.logger.error('Username for tracking code must be exactly 3 letters');
            throw new Error('Username must be exactly 3 letters');
        }
        let trackingCode;
        const usedCodes = new Set();
        do {
            const timestamp = Date.now().toString().slice(-6);
            const randomSuffix = Math.floor(Math.random() * 1000)
                .toString()
                .padStart(3, '0');
            trackingCode = `${username.toUpperCase()}-${timestamp}-${randomSuffix}`;
        } while (usedCodes.has(trackingCode));
        usedCodes.add(trackingCode);
        this.logger.verbose(`Generated tracking code: ${trackingCode}`);
        return trackingCode;
    }
    async getMyOrders(userId, query) {
        this.logger.log(`Fetching orders for user ${userId}`);
        try {
            const orders = await this.orderRepo.getMyOrders(userId, query);
            this.logger.log(`Fetched ${orders?.pagination?.total || 0} orders for user ${userId}`);
            return orders;
        }
        catch (error) {
            this.logger.error(`Fetching orders failed for user ${userId}: ${error.message}`);
            throw (0, handleCatch_1.handleCatch)(error);
        }
    }
};
exports.OrderUseCasesImpl = OrderUseCasesImpl;
exports.OrderUseCasesImpl = OrderUseCasesImpl = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [order_repository_1.OrderRepository,
        maps_service_1.MapsService,
        pricing_usecase_impl_1.PricingUseCasesImpl,
        app_logger_service_1.AppLogger,
        notification_publisher_1.NotificationPublisher])
], OrderUseCasesImpl);
//# sourceMappingURL=order.usecase.impl.js.map