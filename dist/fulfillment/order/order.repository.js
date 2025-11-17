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
exports.OrderRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
const prisma_query_feature_1 = require("../../common/query/prisma-query-feature");
const microservices_1 = require("@nestjs/microservices");
let OrderRepository = class OrderRepository {
    async getOrderCoordinates(orderId) {
        return this.prisma.order.findUnique({
            where: { id: orderId },
            select: {
                shippingScope: true,
                serviceType: true,
                customerId: true,
                pickupAddress: {
                    select: {
                        lat: true,
                        long: true,
                    },
                },
                deliveryAddress: {
                    select: {
                        lat: true,
                        long: true,
                    },
                },
                branch: {
                    select: {
                        address: {
                            select: {
                                lat: true,
                                long: true,
                            }
                        }
                    }
                }
            }
        });
    }
    constructor(prisma) {
        this.prisma = prisma;
    }
    async trackOrder(orderId) {
        return this.prisma.orderTracking.findMany({
            where: { orderId },
        });
    }
    async findPrice(orderId) {
        return this.prisma.order.findUnique({
            where: { id: orderId },
            select: {
                finalPrice: true
            },
        });
    }
    async createCustomer(customerData) {
        return this.prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    name: customerData.name,
                    email: customerData.email,
                    phone: customerData.phone ?? null,
                    password: '',
                    isStaff: false,
                    roleId: null,
                    createdBy: customerData.userId || 'system',
                },
            });
            await tx.userNotificationPreferences.create({
                data: {
                    user: { connect: { id: user.id } },
                    email: true,
                    inApp: true,
                    push: false,
                },
            });
            return user;
        });
    }
    async findOrCreateCustomer(customerData) {
        let existingUser = await this.prisma.user.findFirst({
            where: {
                OR: [{ email: customerData.email }, { phone: customerData.phone }],
            },
        });
        if (existingUser) {
            if (existingUser.name !== customerData.name) {
                existingUser = await this.prisma.user.update({
                    where: { id: existingUser.id },
                    data: { name: customerData.name },
                });
            }
            return existingUser;
        }
        try {
            return this.prisma.$transaction(async (tx) => {
                const user = await tx.user.create({
                    data: {
                        name: customerData.name,
                        email: customerData.email,
                        phone: customerData.phone ?? null,
                        password: '',
                        isStaff: false,
                        roleId: null,
                        createdBy: customerData.userId || 'system',
                    },
                });
                await tx.userNotificationPreferences.create({
                    data: {
                        user: { connect: { id: user.id } },
                        email: true,
                        inApp: true,
                        push: false,
                    },
                });
                return user;
            });
        }
        catch (error) {
            if (error.code === 'P2002') {
                existingUser = await this.prisma.user.findFirst({
                    where: {
                        OR: [{ email: customerData.email }, { phone: customerData.phone }],
                    },
                });
                if (existingUser)
                    return existingUser;
            }
            throw error;
        }
    }
    async findCustomerByEmailOrPhone(email, phone) {
        return this.prisma.user.findFirst({
            where: {
                OR: [
                    { email: { equals: email, mode: 'insensitive' } },
                    { phone: phone },
                ],
            },
        });
    }
    async findCustomer(customerId) {
        return this.prisma.user.findUnique({
            where: { id: customerId },
        });
    }
    async findStaffById(officerId) {
        return this.prisma.user.findUnique({
            where: { id: officerId },
        });
    }
    async findBranch(branchId) {
        return this.prisma.branch.findUnique({
            where: { id: branchId },
        });
    }
    async findDriver(driverId) {
        return this.prisma.user.findUnique({
            where: { id: driverId },
        });
    }
    async findPayment(paymentId) {
        return this.prisma.payment.findUnique({
            where: { id: paymentId },
        });
    }
    async getException(payload) {
        const feature = new prisma_query_feature_1.PrismaQueryFeature({
            search: payload.search,
            filter: payload.filter,
            sort: payload.sort,
            page: payload.page,
            pageSize: payload.pageSize,
            searchableFields: ['type', 'reason'],
        });
        const query = feature.getQuery();
        console.log('quest1: ', query);
        const results = await Promise.all([
            this.prisma.orderException.findMany({
                ...query,
                where: query.where || {},
                select: {
                    id: true,
                    type: true,
                    reason: true,
                    order: {
                        select: {
                            id: true,
                            trackingCode: true,
                            serviceType: true,
                            fulfillmentType: true,
                            status: true,
                            category: true,
                            shipmentType: true,
                            shippingScope: true,
                            isFragile: true,
                            customer: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    phone: true,
                                },
                            },
                            receiver: {
                                select: {
                                    id: true,
                                    name: true,
                                    phone: true,
                                    email: true,
                                },
                            },
                            branch: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                        },
                    },
                },
            }),
            this.prisma.orderException.count({ where: query.where || {} }),
        ]);
        const orders = results[0] || [];
        const total = results[1] || 0;
        return {
            orders,
            pagination: feature.getPagination(total),
        };
    }
    async solveException(orderId, data, updatedBy) {
        return this.prisma.$transaction(async (tx) => {
            const cleanedData = Object.fromEntries(Object.entries(data).filter(([_, value]) => value !== undefined && value !== null));
            const updatedOrder = await tx.order.update({
                where: { id: orderId },
                data: {
                    ...cleanedData,
                    status: 'PENDING',
                },
            });
            await tx.orderException.deleteMany({
                where: { orderId },
            });
            await tx.orderTracking.create({
                data: {
                    orderId,
                    status: updatedOrder.status,
                    updatedBy,
                    notes: `Order resolved for exception `,
                },
            });
            return updatedOrder;
        });
    }
    async createOrderWithAddresses(data, customerId, receiverId, trackingCode, pickupAddress, deliveryAddress, userId) {
        console.log('Repository inside creation order for addresses pickup and delivery :::::: ', pickupAddress, deliveryAddress);
        const order = await this.prisma.$transaction(async (tx) => {
            console.log('Pickup address is :::::: ', data.pickupAddress);
            const pickupAddressRecord = await upsertAddress(tx, customerId, userId, data.pickupAddress, 'ORDER_PICKUP');
            const deliveryAddressRecord = await upsertAddress(tx, customerId, userId, data.deliveryAddress, 'ORDER_DELIVERY');
            console.log('Pickup address ready:', pickupAddressRecord);
            console.log('Delivery address ready:', deliveryAddressRecord);
            console.log('Delivery created:: ');
            const orderData = {
                trackingCode: trackingCode,
                status: client_1.OrderStatus.CREATED,
                serviceType: data.serviceType,
                fulfillmentType: data.fulfillmentType,
                weight: data.weight,
                height: data.height,
                width: data.width,
                length: data.length,
                category: data.category,
                isFragile: data.isFragile,
                shipmentType: data.shipmentType,
                shippingScope: data.shippingScope,
                pickupDate: data.pickupDate ? new Date(data.pickupDate) : null,
                deliveryDate: data.deliveryDate ? new Date(data.deliveryDate) : null,
                createdBy: userId ?? customerId,
                cost: data.cost,
                customerId: customerId,
                receiverId: receiverId,
                quantity: data.quantity,
                branchId: data.branchId ? data.branchId : null,
                pickupAddressId: pickupAddressRecord?.id ?? null,
                deliveryAddressId: deliveryAddressRecord.id,
            };
            const order = await tx.order.create({
                data: orderData,
                include: { pickupAddress: true, deliveryAddress: true },
            });
            console.log('Order created:: ');
            await tx.orderTracking.create({
                data: {
                    orderId: order.id,
                    status: 'CREATED',
                    location: pickupAddress?.addressLine ?? 'Customer Home',
                    updatedBy: userId ?? customerId,
                    notes: 'Order Created.',
                },
            });
            console.log('Log created:: ');
            return order;
        }, { timeout: 60000 });
        return order;
    }
    async updateOrderDistance(orderId, distance) {
        try {
            await this.prisma.order.update({
                where: { id: orderId },
                data: { distance },
            });
            console.log(`✅ Updated distance for order ${orderId}: ${distance} km`);
        }
        catch (error) {
            console.error(`❌ Failed to update order distance for ${orderId}:`, error);
        }
    }
    async getBranchCoordinates(branchId) {
        const branch = await this.prisma.branch.findUnique({
            where: { id: branchId },
            include: { address: true },
        });
        if (!branch)
            throw new microservices_1.RpcException('Branch not found');
        return { lat: branch.address.lat, lon: branch.address.long };
    }
    async updateOrder(orderId, data, updatedBy) {
        return this.prisma.$transaction(async (tx) => {
            const cleanedData = Object.fromEntries(Object.entries(data).filter(([_, value]) => value !== undefined && value !== null));
            const updatedOrder = await tx.order.update({
                where: { id: orderId },
                data: cleanedData,
            });
            await tx.orderTracking.create({
                data: {
                    orderId,
                    status: updatedOrder.status,
                    updatedBy,
                    notes: `Order updated with fields: ${Object.keys(cleanedData).join(', ')}`,
                },
            });
            return updatedOrder;
        });
    }
    async confirmPickupOrder(orderId, location, updatedBy) {
        const result = await this.prisma.$transaction(async (tx) => {
            const updatedOrder = await tx.order.update({
                where: { id: orderId },
                data: {
                    status: 'PICKED_UP',
                    pickupConfirmed: true,
                    actualPickupDate: new Date(),
                },
                select: {
                    id: true,
                    trackingCode: true,
                    pickupDate: true,
                    pickupDriver: {
                        select: {
                            id: true,
                            name: true,
                            phone: true,
                            email: true,
                        },
                    },
                },
            });
            const orderLog = await this.logOrderStatus(tx, orderId, 'PICKED_UP', location, updatedBy, 'Pickup confirmed by driver');
            return updatedOrder;
        });
        return result;
    }
    async validateOrder(orderId, officerId, location, data) {
        const result = await this.prisma.$transaction(async (tx) => {
            const updatedOrder = await tx.order.update({
                where: { id: orderId },
                data: {
                    ...data,
                    status: 'PENDING_APPROVAL',
                    validatedBy: officerId,
                    validatedAt: new Date(),
                    updatedAt: new Date(),
                },
            });
            const parcelApproval = await tx.parcelApproval.create({
                data: {
                    orderId,
                    status: 'PENDING',
                    reason: data.reason,
                    decisionBy: officerId,
                    decidedAt: new Date(),
                    createdBy: officerId,
                },
            });
            const orderLog = await this.logOrderStatus(tx, orderId, 'PENDING_APPROVAL', location, officerId, 'Order validated, pending approval');
            return updatedOrder;
        });
        return result;
    }
    async markUnusualOrder(orderId, data) {
        return this.prisma.order.update({
            where: { id: orderId },
            data: {
                isUnusual: true,
                isFragile: data.isFragile,
                unusualReason: data.unusualReason,
                updatedAt: new Date(),
            },
        });
    }
    async approveOrder(order, reason, location, userId) {
        try {
            const result = await this.prisma.$transaction(async (tx) => {
                const updatedOrder = await tx.order.update({
                    where: { id: order.id },
                    data: {
                        status: 'APPROVED',
                        updatedAt: new Date(),
                    },
                });
                await tx.parcelApproval.update({
                    where: { orderId: order.id },
                    data: {
                        status: 'APPROVED',
                        reason,
                        decisionBy: userId,
                        decidedAt: new Date(),
                    },
                });
                await this.logOrderStatus(tx, order.id, 'APPROVED', location, userId, `Order approved by Operation Manager`);
                return updatedOrder;
            });
            return result;
        }
        catch (error) {
            console.error('Transaction failed:', error);
            throw new Error(`Order approval failed: ${error.message}`);
        }
    }
    async getPendingApprovals(payload) {
        const feature = new prisma_query_feature_1.PrismaQueryFeature({
            search: payload.search,
            filter: payload.filter,
            sort: payload.sort,
            page: payload.page,
            pageSize: payload.pageSize,
            searchableFields: ['status', 'reason'],
        });
        const query = feature.getQuery();
        console.log('quest1: ', query);
        const where = {
            AND: [
                query.where || {},
                { status: client_1.ApprovalStatus.PENDING },
            ],
        };
        const results = await Promise.all([
            await this.prisma.parcelApproval.findMany({
                ...query,
                where,
            }),
            await this.prisma.parcelApproval.count({
                where,
            }),
        ]);
        const approvals = results[0] || [];
        const total = results[1] || 0;
        return {
            approvals,
            pagination: feature.getPagination(total),
        };
    }
    async getAllOrders(payload) {
        const feature = new prisma_query_feature_1.PrismaQueryFeature({
            search: payload.search,
            filter: payload.filter,
            sort: payload.sort,
            page: payload.page,
            pageSize: payload.pageSize,
            searchableFields: ['trackingCode', 'notes', 'category'],
        });
        const query = feature.getQuery();
        console.log('quest1: ', query);
        const results = await Promise.all([
            this.prisma.order.findMany({
                ...query,
                where: query.where || {},
                select: {
                    id: true,
                    trackingCode: true,
                    serviceType: true,
                    fulfillmentType: true,
                    pickupDriverId: true,
                    deliveryDriverId: true,
                    status: true,
                    weight: true,
                    length: true,
                    width: true,
                    height: true,
                    category: true,
                    isFragile: true,
                    shipmentType: true,
                    shippingScope: true,
                    isUnusual: true,
                    unusualReason: true,
                    pickupAddressId: true,
                    pickupDate: true,
                    deliveryAddressId: true,
                    deliveryDate: true,
                    distance: true,
                    validatedBy: true,
                    validatedNotes: true,
                    estimatedDeliveryAt: true,
                    actualDeliveryAt: true,
                    batchId: true,
                    finalPrice: true,
                    currency: true,
                    customer: {
                        select: { id: true, name: true, phone: true, email: true },
                    },
                    receiver: {
                        select: { id: true, name: true, phone: true, email: true },
                    },
                    branch: {
                        select: { id: true, name: true },
                    },
                    payment: {
                        select: { id: true, amount: true, status: true },
                    },
                },
            }),
            this.prisma.order.count({ where: query.where || {} }),
        ]);
        const orders = results[0] || [];
        const total = results[1] || 0;
        return {
            orders,
            pagination: feature.getPagination(total),
        };
    }
    async getMyOrders(userId, payload) {
        const feature = new prisma_query_feature_1.PrismaQueryFeature({
            search: payload.search,
            filter: payload.filter,
            sort: payload.sort,
            page: payload.page,
            pageSize: payload.pageSize,
            searchableFields: ['status', 'reason'],
        });
        const query = feature.getQuery();
        console.log('quest1: ', query);
        const where = {
            AND: [
                query.where || {},
                { customerId: userId },
            ],
        };
        const results = await Promise.all([
            await this.prisma.order.findMany({
                ...query,
                where,
            }),
            await this.prisma.order.count({
                where,
            }),
        ]);
        const orders = results[0] || [];
        const total = results[1] || 0;
        return {
            orders,
            pagination: feature.getPagination(total),
        };
    }
    async getOrderById(id) {
        return this.prisma.order.findUnique({
            where: { id },
            include: {
                pickupAddress: true,
                deliveryAddress: true,
            },
        });
    }
    async createSegment(orderId, segment) {
        return this.prisma.orderRouteSegment.create({
            data: {
                ...segment,
                orderId,
            },
        });
    }
    async getOrderByIdWithAddresses(orderId) {
        return this.prisma.order.findUnique({
            where: { id: orderId },
            include: {
                pickupAddress: true,
                deliveryAddress: true,
                branch: { include: { address: true } },
            },
        });
    }
    async getOrderByTrackingCode(trackingCode, userId) {
        return this.prisma.order.findFirst({
            where: {
                trackingCode,
                ...(userId ? { customerId: userId } : {}),
            },
            select: {
                id: true,
                trackingCode: true,
                serviceType: true,
                fulfillmentType: true,
                pickupDriverId: true,
                deliveryDriverId: true,
                status: true,
                weight: true,
                length: true,
                width: true,
                height: true,
                category: true,
                isFragile: true,
                shipmentType: true,
                shippingScope: true,
                isUnusual: true,
                unusualReason: true,
                pickupAddressId: true,
                pickupDate: true,
                deliveryAddressId: true,
                deliveryDate: true,
                distance: true,
                validatedBy: true,
                validatedNotes: true,
                estimatedDeliveryAt: true,
                actualDeliveryAt: true,
                batchId: true,
                finalPrice: true,
                currency: true,
                customer: {
                    select: { id: true, name: true, phone: true, email: true },
                },
                receiver: {
                    select: { id: true, name: true, phone: true, email: true },
                },
                branch: {
                    select: { id: true, name: true },
                },
                payment: {
                    select: { id: true, amount: true, status: true },
                },
                pickupDriver: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        email: true,
                        branchId: true,
                    },
                },
                deliveryDriver: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        email: true,
                        branchId: true,
                    },
                },
            },
        });
    }
    async acceptDropOffOrder(trackingCode, orderId, branchId, updatedBy, location) {
        const result = await this.prisma.$transaction(async (tx) => {
            const updatedOrder = await tx.order.update({
                where: { trackingCode },
                data: {
                    status: 'DROPPED_OFF',
                    dropoffConfirmed: true,
                    actualDropoffDate: new Date(),
                    branchId,
                },
                select: {
                    id: true,
                    trackingCode: true,
                    status: true,
                    serviceType: true,
                    fulfillmentType: true,
                    deliveryAddress: {
                        select: { addressLine: true, city: true },
                    },
                    height: true,
                    width: true,
                    length: true,
                    shipmentType: true,
                    shippingScope: true,
                    isFragile: true,
                    isUnusual: true,
                    quantity: true,
                    weight: true,
                    finalPrice: true,
                    payment: {
                        select: { id: true, amount: true, status: true },
                    },
                    customer: {
                        select: { id: true, name: true, phone: true, email: true },
                    },
                    receiver: {
                        select: { id: true, name: true, phone: true, email: true },
                    },
                },
            });
            const logRecord = await this.logOrderStatus(tx, orderId, 'DROPPED_OFF', location, updatedBy, 'Dropoff confirmed.');
            return { updatedOrder, logRecord };
        });
        return result;
    }
    async getOrdersGroupedByScope(payload) {
        const feature = new prisma_query_feature_1.PrismaQueryFeature({
            search: payload.search,
            filter: payload.filter,
            sort: payload.sort,
            page: payload.page,
            pageSize: payload.pageSize,
            searchableFields: [],
        });
        const query = feature.getQuery();
        console.log('quest1: ', query);
        const where = {
            AND: [
                query.where || {},
                { status: 'APPROVED' },
                {
                    OR: [
                        { batchId: null },
                    ],
                },
            ],
        };
        const results = await Promise.all([
            await this.prisma.order.findMany({
                ...query,
                where,
                select: {
                    id: true,
                    trackingCode: true,
                    shippingScope: true,
                    serviceType: true,
                    category: true,
                    isFragile: true,
                    deliveryAddress: {
                        select: {
                            id: true,
                            country: true,
                            state: true,
                            city: true,
                            addressLine: true,
                            postalCode: true,
                            lat: true,
                            long: true,
                        },
                    },
                    weight: true,
                    height: true,
                    width: true,
                    length: true,
                    shipmentType: true,
                    isUnusual: true,
                    unusualReason: true,
                    validatedNotes: true,
                },
            }),
            await this.prisma.order.count({
                where,
            }),
        ]);
        const orders = results[0] || [];
        const total = results[1] || 0;
        return {
            orders,
            pagination: feature.getPagination(total),
        };
    }
    async getOrderStatusLog(payload) {
        const feature = new prisma_query_feature_1.PrismaQueryFeature({
            search: payload.search,
            filter: payload.filter,
            sort: payload.sort,
            page: payload.page,
            pageSize: payload.pageSize,
            searchableFields: ['location', 'notes', 'status'],
        });
        const query = feature.getQuery();
        console.log('quest1: ', query);
        const results = await Promise.all([
            this.prisma.orderTracking.findMany({
                ...query,
                where: query.where || {},
            }),
            this.prisma.orderTracking.count({ where: query.where || {} }),
        ]);
        const orders = results[0] || [];
        const total = results[1] || 0;
        return {
            orders,
            pagination: feature.getPagination(total),
        };
    }
    async addException(orderId, reason, type, userId) {
        return this.prisma.$transaction(async (tx) => {
            const exception = await tx.orderException.create({
                data: {
                    orderId,
                    reason,
                    type,
                    createdBy: userId || 'system',
                },
            });
            const updatedOrder = await tx.order.update({
                where: { id: orderId },
                data: { status: 'EXCEPTION' },
            });
            await tx.orderTracking.create({
                data: {
                    orderId,
                    status: 'EXCEPTION',
                    updatedBy: userId || 'system',
                    notes: `Exception: ${reason} (Type: ${type})`,
                },
            });
            return { exception, updatedOrder };
        });
    }
    async cancelOrder(orderId, reason, userId) {
        return this.prisma.$transaction(async (tx) => {
            const canceledOrder = await tx.order.update({
                where: { id: orderId },
                data: { status: client_1.OrderStatus.CANCELED },
            });
            if (canceledOrder.batchId) {
                await tx.batchDispatch.update({
                    where: { id: canceledOrder.batchId },
                    data: {
                        orders: {
                            disconnect: { id: orderId },
                        },
                    },
                });
            }
            await tx.orderException.create({
                data: {
                    orderId,
                    reason,
                    type: 'CANCELLED',
                    createdBy: userId || 'system',
                },
            });
            await tx.orderTracking.create({
                data: {
                    orderId,
                    status: client_1.OrderStatus.CANCELED,
                    updatedBy: userId,
                    notes: 'Order canceled and removed from batch (if any).',
                },
            });
            return canceledOrder;
        });
    }
    async logOrderStatus(prismaOrTx, orderId, status, location, updatedBy, notes) {
        return prismaOrTx.orderTracking.create({
            data: {
                orderId,
                status,
                location: location ?? null,
                updatedBy: updatedBy ?? null,
                notes: notes ?? null,
                createdAt: new Date(),
            },
        });
    }
    async createAddress(data, customerId, tx, userId) {
        const db = tx ?? this.prisma;
        return db.address.create({
            data: {
                label: data.label ?? 'ADDRESS',
                addressLine: data.addressLine ?? '',
                city: data.city ?? '',
                state: data.state ?? '',
                country: data.country ?? '',
                postalCode: data.postalCode ?? '',
                lat: data.lat,
                long: data.long,
                purpose: data.purpose ?? 'ORDER',
                user: { connect: { id: customerId } },
                createdBy: userId || 'system',
            },
        });
    }
};
exports.OrderRepository = OrderRepository;
exports.OrderRepository = OrderRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrderRepository);
async function upsertAddress(tx, customerId, userId, addressData, purpose) {
    if (!addressData)
        return null;
    const existing = await tx.address.findFirst({
        where: {
            lat: addressData.lat,
            long: addressData.long,
            purpose,
            userId: customerId,
        },
    });
    const dataToApply = {
        addressLine: addressData.addressLine ?? 'Unknown',
        label: addressData.label ?? 'Unknown Home or Office',
        lat: addressData.lat,
        long: addressData.long,
        city: addressData.city ?? 'Unknown',
        state: addressData.state ?? 'Unknown',
        country: addressData.country ?? 'Unknown',
        postalCode: addressData.postalCode ?? 'Unknown',
        purpose,
        user: { connect: { id: customerId } },
        createdBy: userId ?? customerId,
    };
    if (existing) {
        const updates = {};
        for (const [key, value] of Object.entries(addressData)) {
            if (value !== null && value !== undefined && existing[key] !== value) {
                updates[key] = value;
            }
        }
        if (Object.keys(updates).length > 0) {
            console.log(`Updating existing ${purpose} address...`);
            return tx.address.update({
                where: { id: existing.id },
                data: updates,
            });
        }
        console.log(`No updates required for ${purpose} address.`);
        return existing;
    }
    console.log(`Creating new ${purpose} address...`);
    return tx.address.create({ data: dataToApply });
}
//# sourceMappingURL=order.repository.js.map