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
exports.DispatchRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
const prisma_query_feature_1 = require("../../common/query/prisma-query-feature");
const microservices_1 = require("@nestjs/microservices");
let DispatchRepository = class DispatchRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async assignDriverForPickup(driverId, orderId, userId) {
        return this.prisma.order.update({
            where: { id: orderId },
            data: {
                pickupDriverId: driverId,
                status: 'ASSIGNED',
                pickupAssignedBy: userId,
                pickupAssignedAt: new Date(),
            },
            select: {
                id: true,
                trackingCode: true,
                pickupAddress: {
                    select: { addressLine: true, city: true },
                },
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
    }
    async confirmDispatch(batchIds, officerId) {
        return this.prisma.$transaction(async (tx) => {
            const updatedBatches = await tx.batchDispatch.updateMany({
                where: { id: { in: batchIds } },
                data: {
                    status: 'READY',
                    officerId,
                },
            });
            return updatedBatches;
        });
    }
    async findDriverById(driverId) {
        const driver = await this.prisma.driver.findUnique({
            where: { userId: driverId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
        if (!driver) {
            throw new Error(`Driver with ID ${driverId} not found`);
        }
        return driver;
    }
    async collectBatchByCargoOfficer(batchIds, officerId) {
        return this.prisma.$transaction(async (tx) => {
            const collectedBatch = await tx.batchDispatch.updateMany({
                where: {
                    id: { in: batchIds },
                    officerId,
                },
                data: { status: 'COLLECTED' },
            });
            const updateOrderStatus = await tx.order.updateMany({
                where: { batchId: { in: batchIds } },
                data: { status: 'DISPATCHED' },
            });
            const orders = await tx.order.findMany({
                where: { batchId: { in: batchIds } },
                select: { id: true },
            });
            const orderLogs = orders.map((o) => ({
                orderId: o.id,
                status: 'COLLECTED',
                updatedBy: officerId,
                notes: 'Batch collected by cargo officer',
            }));
            if (orderLogs.length > 0) {
                await this.logBatchOrdersStatus(tx, batchIds, 'COLLECTED', undefined, officerId, 'Batch collected by cargo officer');
            }
            return collectedBatch;
        }, {
            timeout: 60000,
        });
    }
    async cancelDispatch(batchIds) {
        return this.prisma.batchDispatch.updateMany({
            where: { id: { in: batchIds } },
            data: { status: 'CANCELLED' },
        });
    }
    async confirmPickupByCargoOfficer(batchIds) {
        return this.prisma.batchDispatch.updateMany({
            where: { id: { in: batchIds } },
            data: { status: 'PICKEDUP' },
        });
    }
    async handoverBatchToAirport(batchIds, handedById, options) {
        return this.prisma.$transaction(async (tx) => {
            const handOveredBatch = await tx.batchDispatch.updateMany({
                where: { id: { in: batchIds } },
                data: { status: 'IN_TRANSIT' },
            });
            await tx.batchHandover.create({
                data: {
                    handedById,
                    method: options?.method,
                    reference: options?.reference,
                    notes: options?.notes,
                    batches: {
                        connect: batchIds.map((id) => ({ id })),
                    },
                },
            });
            await this.logBatchOrdersStatus(tx, batchIds, 'IN_TRANSIT', options.location, handedById, options.notes);
            return handOveredBatch;
        }, { timeout: 60000 });
    }
    async receiveFromAirport(batchIds, data) {
        return this.prisma.$transaction(async (tx) => {
            await tx.batchDispatch.updateMany({
                where: { id: { in: batchIds } },
                data: { status: 'OUT_FOR_BRANCH_TRANSFER' },
            });
            await this.logBatchOrdersStatus(tx, batchIds, 'PICKED_UP', data.location, data.receivedById, data.notes);
            return tx.batchHandover.create({
                data: {
                    handedById: data.receivedById,
                    method: data.method,
                    reference: data.reference,
                    notes: data.notes,
                    batches: {
                        connect: batchIds.map((id) => ({ id })),
                    },
                },
            });
        });
    }
    async assignDriverForDelivery(data) {
        return this.prisma.order.update({
            where: { id: data.orderId },
            data: { deliveryDriverId: data.driverId, status: 'OUT_FOR_DELIVERY' },
        });
    }
    async assignOrder(orderId, driverId, userId) {
        return this.prisma.$transaction(async (tx) => {
            const updatedOrder = await tx.order.update({
                where: { id: orderId },
                data: {
                    status: 'ASSIGNED',
                    deliveryDriverId: driverId,
                    deliveryAssignedAt: new Date(),
                    deliveryAssignedBy: userId,
                },
                include: { batch: true },
            });
            console.log('batches for order :', updatedOrder);
            if (updatedOrder.batchId) {
                const batch = await tx.batchDispatch.findUnique({
                    where: { id: updatedOrder.batchId },
                });
                if (batch && batch.status !== client_1.DispatchStatus.COMPLETED) {
                    await tx.batchDispatch.update({
                        where: { id: updatedOrder.batchId },
                        data: { status: 'COMPLETED' },
                    });
                }
            }
            await tx.orderTracking.create({
                data: {
                    orderId,
                    status: 'ASSIGNED',
                    updatedBy: driverId,
                    notes: 'Order assigned to driver for last mile delivery.',
                },
            });
            return updatedOrder;
        });
    }
    async lastMileDelivery(orderId, driverId, notes) {
        return this.prisma.$transaction(async (tx) => {
            const updatedOrder = await tx.order.update({
                where: { id: orderId },
                data: { status: 'OUT_FOR_DELIVERY' },
            });
            await tx.orderTracking.create({
                data: {
                    orderId,
                    status: 'OUT_FOR_DELIVERY',
                    updatedBy: driverId,
                    notes,
                },
            });
            return updatedOrder;
        });
    }
    async deliverOrderWithPodImages(orderId, driverId, notes, podImages) {
        return this.prisma.$transaction(async (tx) => {
            const order = await tx.order.findUnique({ where: { id: orderId } });
            if (!order)
                throw new microservices_1.RpcException(`Order ${orderId} not found`);
            if (order.status === 'DELIVERED')
                throw new microservices_1.RpcException('Already delivered');
            if (podImages && podImages.length > 0) {
                for (const img of podImages) {
                    await tx.podImage.create({
                        data: {
                            orderId,
                            driverId,
                            url: img.url,
                            publicId: img.publicId,
                            fileName: img.fileName,
                            fileType: img.fileType,
                        },
                    });
                }
            }
            const updatedOrder = await tx.order.update({
                where: { id: orderId },
                data: { status: 'DELIVERED', deliveryDate: new Date(), notes },
                include: {
                    deliveryAddress: true,
                },
            });
            await tx.orderTracking.create({
                data: {
                    orderId,
                    status: 'DELIVERED',
                    updatedBy: driverId,
                    location: updatedOrder.deliveryAddress?.addressLine || 'Unknown location',
                    notes: notes || 'Order delivered to customer successfully.',
                },
            });
            return updatedOrder;
        });
    }
    async completeDelivery(data) {
        return this.prisma.order.update({
            where: { id: data.orderId },
            data: { deliveryDriverId: data.driverId, status: 'DELIVERED' },
        });
    }
    async findOrderById(orderId) {
        return this.prisma.order.findUnique({
            where: { id: orderId },
        });
    }
    async findUserById(id) {
        return this.prisma.user.findUnique({
            where: { id },
        });
    }
    async findBatches(batchIds, officerId) {
        return this.prisma.batchDispatch.findMany({
            where: {
                id: { in: batchIds },
                ...(officerId && { officerId }),
            },
        });
    }
    async removeDriverFromOrder(orderId) {
        return this.prisma.order.update({
            where: { id: orderId },
            data: { deliveryDriverId: null },
        });
    }
    async changeDriverForOrder(orderId, driverId) {
        return this.prisma.order.update({
            where: { id: orderId },
            data: { deliveryDriverId: driverId },
        });
    }
    async findOrdersByIds(orderIds) {
        return await this.prisma.order.findMany({
            where: { id: { in: orderIds } },
            include: { deliveryAddress: true },
        });
    }
    async createBatchDispatch(dto, batchCode, userId) {
        return this.prisma.$transaction(async (tx) => {
            const batch = await tx.batchDispatch.create({
                data: {
                    batchCode,
                    scope: dto.scope,
                    serviceType: dto.serviceType,
                    category: dto.category,
                    isFragile: dto.isFragile ?? false,
                    originId: dto.originId,
                    destinationId: dto.destinationId,
                    status: 'PENDING',
                    notes: dto.notes,
                    createdById: userId,
                    driverId: dto.driverId,
                    vehicleId: dto.vehicleId,
                    awbNumber: dto.awbNumber,
                    weight: dto.weight,
                    shipmentDate: new Date(dto.shipmentDate),
                    orders: {
                        connect: dto.orders.map((id) => ({ id })),
                    },
                },
                include: {
                    orders: {
                        select: {
                            id: true,
                            trackingCode: true,
                            status: true,
                            serviceType: true,
                            fulfillmentType: true,
                            category: true,
                            isFragile: true,
                            shipmentType: true,
                            shippingScope: true,
                            deliveryAddress: {
                                select: { addressLine: true, city: true },
                            },
                        },
                    },
                    createdBy: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    origin: {
                        select: {
                            id: true,
                            addressLine: true,
                            city: true,
                            country: true,
                        },
                    },
                    destination: {
                        select: {
                            id: true,
                            addressLine: true,
                            city: true,
                            country: true,
                        },
                    },
                },
            });
            await tx.order.updateMany({
                where: { id: { in: dto.orders } },
                data: { status: 'DISPATCHED' },
            });
            const orderLogs = await this.logBatchOrdersStatus(tx, [batch.id], 'DISPATCHED', batch.origin.addressLine || 'Unknown location', userId, dto.notes);
            return { batch, orderLogs };
        }, { timeout: 60000 });
    }
    async addOrdersToBatch(batchId, newOrderIds, updateData) {
        return this.prisma.$transaction(async (tx) => {
            const batchUpdate = { ...updateData };
            if (updateData?.originId) {
                batchUpdate.origin = { connect: { id: updateData.originId } };
                delete batchUpdate.originId;
            }
            if (updateData?.destinationId) {
                batchUpdate.destination = {
                    connect: { id: updateData.destinationId },
                };
                delete batchUpdate.destinationId;
            }
            const updatedBatch = await tx.batchDispatch.update({
                where: { id: batchId },
                data: {
                    ...batchUpdate,
                    orders: { connect: newOrderIds.map((id) => ({ id })) },
                },
                include: {
                    orders: {
                        select: {
                            id: true,
                            trackingCode: true,
                            status: true,
                            serviceType: true,
                            fulfillmentType: true,
                            category: true,
                            isFragile: true,
                            shipmentType: true,
                            shippingScope: true,
                            deliveryAddress: {
                                select: { addressLine: true, city: true },
                            },
                        },
                    },
                    origin: {
                        select: {
                            id: true,
                            addressLine: true,
                            city: true,
                            country: true,
                        },
                    },
                    destination: {
                        select: {
                            id: true,
                            addressLine: true,
                            city: true,
                            country: true,
                        },
                    },
                },
            });
            const result = await tx.order.updateMany({
                where: { id: { in: newOrderIds } },
                data: { status: 'DISPATCHED' },
            });
            const ordersLog = await this.logBatchOrdersStatus(tx, [batchId], 'DISPATCHED', updatedBatch.origin.addressLine, updatedBatch.createdById, updatedBatch.notes);
            return {
                batch: updatedBatch,
                ordersLog,
                result,
            };
        }, { timeout: 60000 });
    }
    async findBatchById(batchId) {
        return this.prisma.batchDispatch.findUnique({
            where: { id: batchId },
            include: {
                orders: {
                    include: {
                        deliveryAddress: true,
                    },
                },
                origin: true,
            },
        });
    }
    async getBatches(payload) {
        const feature = new prisma_query_feature_1.PrismaQueryFeature({
            search: payload.search,
            filter: payload.filter,
            sort: payload.sort,
            page: payload.page,
            pageSize: payload.pageSize,
            searchableFields: ['batchCode', 'origin', 'destination', 'awbNumber'],
        });
        const query = feature.getQuery();
        if (payload.search) {
            query.where = {
                ...query.where,
                OR: [
                    ...(query.where?.OR || []),
                    {
                        orders: {
                            some: {
                                trackingCode: { contains: payload.search, mode: 'insensitive' },
                            },
                        },
                    },
                ],
            };
        }
        const results = await Promise.all([
            this.prisma.batchDispatch.findMany({
                ...query,
                where: query.where || {},
                include: {
                    orders: true,
                    driver: true,
                    createdBy: true,
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.batchDispatch.count({ where: query.where || {} }),
        ]);
        const batches = results[0] || [];
        const total = results[1] || 0;
        return {
            batches,
            pagination: feature.getPagination(total),
        };
    }
    async logBatchOrdersStatus(tx, batchIds, status, location, updatedBy, notes) {
        const ids = Array.isArray(batchIds) ? batchIds : [batchIds];
        const orders = await tx.order.findMany({
            where: { batchId: { in: ids } },
            select: { id: true },
        });
        if (orders.length === 0) {
            throw new Error(`No orders found for batchIds: ${ids.join(', ')}`);
        }
        const trackingLogs = orders.map((order) => ({
            orderId: order.id,
            status,
            location,
            updatedBy,
            notes,
        }));
        await tx.orderTracking.createMany({
            data: trackingLogs,
        });
        return { message: `Tracking logs created for ${orders.length} orders.` };
    }
    async createScan(data, location) {
        return this.prisma.$transaction(async (tx) => {
            const scan = await tx.orderScan.create({
                data,
            });
            console.log('location: ', location);
            await tx.orderTracking.create({
                data: {
                    orderId: data.orderId,
                    location: location,
                    status: data.valid ? 'SUCCESS' : 'EXCEPTION',
                    updatedBy: data.scannedBy,
                    notes: data.notes ??
                        (data.valid
                            ? 'Order scanned successfully'
                            : 'Order scan failed/invalid'),
                },
            });
            return scan;
        });
    }
    async findByTrackingCode(trackingCode) {
        return this.prisma.order.findUnique({
            where: { trackingCode },
            include: { deliveryAddress: true },
        });
    }
    async findOrdersByBatchIds(batchIds) {
        return this.prisma.order.findMany({
            where: { batchId: { in: batchIds } },
            select: {
                id: true,
                trackingCode: true,
                batchId: true,
                branchId: true,
                serviceType: true,
                weight: true,
                length: true,
                width: true,
                height: true,
                deliveryAddress: true,
                shippingScope: true,
                shipmentType: true,
            },
        });
    }
    async findScannedOrdersByOfficer(officerId, batchIds) {
        return this.prisma.orderScan.findMany({
            where: {
                scannedBy: officerId,
                batchId: { in: batchIds },
            },
            include: {
                order: true,
            },
        });
    }
    async findBatchesByBranchId(branchId, statuses) {
        return this.prisma.batchDispatch.findMany({
            where: {
                destination: {
                    branchId: branchId,
                },
                status: statuses
                    ? { in: statuses.map((s) => s) }
                    : undefined,
            },
            include: {
                origin: true,
                destination: true,
                orders: true,
            },
        });
    }
    async findBranchById(branchId) {
        return this.prisma.branch.findUnique({ where: { id: branchId } });
    }
    async confirmBatchHandoverAutomatic(officerId, handoverMethod, reference, notes) {
        return this.prisma.$transaction(async (tx) => {
            const batches = await tx.batchDispatch.findMany({
                where: {
                    officerId,
                    status: 'IN_TRANSIT',
                },
            });
            if (batches.length === 0)
                throw new Error('No batches available for confirmation');
            const batchIds = batches.map((b) => b.id);
            const validOrders = await tx.orderScan.findMany({
                where: {
                    scannedBy: officerId,
                    valid: true,
                    order: {
                        batchId: { in: batchIds },
                    },
                },
                select: { orderId: true, batchId: true },
            });
            await tx.order.updateMany({
                where: { id: { in: validOrders.map((o) => o.orderId) } },
                data: { status: 'VALIDATED' },
            });
            await tx.batchDispatch.updateMany({
                where: { id: { in: batchIds } },
                data: { status: 'ARRIVED_AT_DESTINATION' },
            });
            await this.logBatchOrdersStatus(tx, batchIds, 'VALIDATED', 'At airport', officerId, notes);
            const handover = await tx.batchHandover.create({
                data: {
                    handedById: officerId,
                    method: handoverMethod,
                    reference,
                    notes,
                    batches: {
                        connect: batchIds.map((id) => ({ id })),
                    },
                },
            });
            return { handover, confirmedOrders: validOrders.map((o) => o.orderId) };
        });
    }
    async createDriver(data) {
        return this.prisma.$transaction(async (tx) => {
            const driver = await tx.driver.create({
                data: {
                    user: { connect: { id: data.userId } },
                    vehicleId: data.vehicleId,
                    status: data.status,
                    type: data.type,
                    currentLat: data.currentLat,
                    currentLon: data.currentLong,
                    updatedAt: new Date(),
                },
            });
            await tx.driverLocationLog.create({
                data: {
                    driverId: driver.id,
                    latitude: data.currentLat,
                    longitude: data.currentLong,
                    speed: 0,
                    heading: 0,
                },
            });
            await tx.vehicle.update({
                where: { id: data.vehicleId },
                data: { driverId: driver.id },
            });
            return driver;
        });
    }
    async findVehicleById(vehicleId) {
        return await this.prisma.vehicle.findUnique({
            where: { id: vehicleId },
        });
    }
    async findDriver(payload) {
        const where = {
            AND: [],
        };
        if (payload.search) {
            where.AND.push({
                OR: [
                    { user: { name: { contains: payload.search, mode: 'insensitive' } } },
                    {
                        user: { email: { contains: payload.search, mode: 'insensitive' } },
                    },
                    {
                        user: { phone: { contains: payload.search, mode: 'insensitive' } },
                    },
                    {
                        vehicles: {
                            some: {
                                plateNumber: { contains: payload.search, mode: 'insensitive' },
                            },
                        },
                    },
                    {
                        vehicles: {
                            some: {
                                model: { contains: payload.search, mode: 'insensitive' },
                            },
                        },
                    },
                ],
            });
        }
        let filters = {};
        if (typeof payload.filter === 'string') {
            try {
                filters = JSON.parse(payload.filter);
            }
            catch {
                filters = {};
            }
        }
        else if (typeof payload.filter === 'object' && payload.filter !== null) {
            filters = payload.filter;
        }
        if (filters.status) {
            where.AND.push({ status: filters.status });
        }
        if (filters.type) {
            where.AND.push({ type: filters.type });
        }
        if (filters.vehicleStatus) {
            where.AND.push({
                vehicles: { some: { status: filters.vehicleStatus } },
            });
        }
        if (filters.userId) {
            where.AND.push({ userId: filters.userId });
        }
        if (filters.vehicleId) {
            where.AND.push({
                vehicles: { some: { id: filters.vehicleId } },
            });
        }
        const feature = new prisma_query_feature_1.PrismaQueryFeature({
            search: payload.search,
            filter: payload.filter,
            sort: payload.sort,
            page: payload.page,
            pageSize: payload.pageSize,
            searchableFields: [
                'user.name',
                'user.email',
                'user.phone',
                'vehicles.plateNumber',
                'vehicles.model',
            ],
        });
        const query = {
            ...feature.getQuery(),
            where,
            include: {
                user: {
                    select: { id: true, name: true, email: true, phone: true },
                },
                vehicles: {
                    select: { id: true, plateNumber: true, model: true, status: true },
                },
            },
        };
        const [drivers, total] = await this.prisma.$transaction([
            this.prisma.driver.findMany(query),
            this.prisma.driver.count({ where }),
        ]);
        return {
            drivers,
            pagination: feature.getPagination(total),
        };
    }
};
exports.DispatchRepository = DispatchRepository;
exports.DispatchRepository = DispatchRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DispatchRepository);
//# sourceMappingURL=dispatch.repository.js.map