import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DispatchUseCases } from './dispatch.usecase';
import { DispatchRepository } from './dispatch.repository';
import {
  AssignDriverForPickup,
  AssignOfficerForBatch,
  BatchDispatchDto,
  BatchHandoverDto,
  ConfirmBatchHandoverDto,
  CreateDriver,
} from './dispatch.entity';
import { RpcException } from '@nestjs/microservices';
import {
  DispatchStatus,
  ShippingScope,
  ServiceType,
  Order,
} from '@prisma/client';
import { IResponse } from '../../common/types';
import {
  generateOrderQRCode,
  decodeAndValidateQRCode,
  OrderQRCodeData,
} from '../utils/qr-code.helper';
import { PrismaService } from '../../prisma/prisma.service';
import { ListQueryDto } from '../../common/query/query.dto';

@Injectable()
export class DispatchUseCasesImpl implements DispatchUseCases {

  constructor(
    private readonly dispatchRepo: DispatchRepository,
    private readonly qrCodeService: PrismaService,
  ) {}

  async assignDriverForPickup(data: AssignDriverForPickup): Promise<any> {
    const driver = await this.dispatchRepo.findDriverById(data.driverId);
    if (!driver) {
      throw new RpcException({
        statusCode: 404,
        message: `Driver with ID ${data.driverId} not found.`,
      });
    }

    const order = await this.dispatchRepo.findOrderById(data.orderId);
    if (!order) {
      throw new RpcException({
        statusCode: 404,
        message: `Order with ID ${data.orderId} not found.`,
      });
    }

    if (order.driverId) {
      throw new RpcException({
        statusCode: 400,
        message: `Order with ID ${data.orderId} is already assigned to another driver.`,
      });
    }
    // Status checks
    if (order.status !== 'CREATED') {
      let message = `Order with ID ${data.orderId} is not eligible for driver assignment. Current status: ${order.status}.`;

      if (order.status === 'ASSIGNED') {
        message = `Order with ID ${data.orderId} has been ASSIGNED. The driver is already coming to pick up the package.`;
      }

      throw new RpcException({
        statusCode: 400,
        message,
      });
    }

    // Validate pickup date
    if (!order.pickupDate) {
      throw new RpcException({
        statusCode: 400,
        message: `Order with ID ${data.orderId} does not have a scheduled pickup date.`,
      });
    }

    const now = new Date();
    const pickupDate = new Date(order.pickupDate);

    // Ensure pickup date is today or in the future
    if (pickupDate < new Date(now.setHours(0, 0, 0, 0))) {
      throw new RpcException({
        statusCode: 400,
        message: `Order with ID ${data.orderId} has an invalid pickup date (${pickupDate.toISOString()}). Pickup date cannot be in the past.`,
      });
    }

    console.log("going assigning .....");
    
    // Assign driver
    const updatedOrder = await this.dispatchRepo.assignDriverForPickup(data.driverId, order.id);

    return {
      statusCode: 200,
      message: `Driver ${driver.user.name} (ID: ${driver.user.id}) successfully assigned to order ${order.id}.`,
      data: updatedOrder,
    };
  }

  async confirmDispatch(data: AssignOfficerForBatch): Promise<any> {
    // 1. Check if Officer exists (optional, depending on your business rules)
    const officer = await this.dispatchRepo.findUserById(data.officerId);
    if (!officer) {
      throw new NotFoundException(
        `Officer with ID ${data.officerId} not found`,
      );
    }

    // 2. Check that all batch IDs exist
    const batches = await this.dispatchRepo.findBatches(data.batchId);

    if (batches.length !== data.batchId.length) {
      const foundIds = batches.map((b) => b.id);
      const missing = data.batchId.filter((id) => !foundIds.includes(id));
      throw new NotFoundException(`Batch IDs not found: ${missing.join(', ')}`);
    }

    // 3. Assign Officer to the batches
    const result = await this.dispatchRepo.confirmDispatch(
      data.batchId,
      data.officerId,
    );

    return {
      success: true,
      message: `Batches are ready for delivering to the airport or Assigned to the cargo officer.`,
      result,
    };
  }

  async collectBatchByCargoOfficer(data: AssignOfficerForBatch): Promise<any> {
    const officer = await this.dispatchRepo.findUserById(data.officerId);
    if (!officer) {
      throw new RpcException({
        statusCode: 404,
        message: `Officer with ID ${data.officerId} not found.`,
      });
    }

    //  Check that all batch IDs exist
    const batches = await this.dispatchRepo.findBatches(data.batchId);

    if (batches.length !== data.batchId.length) {
      const foundIds = batches.map((b) => b.id);
      const missing = data.batchId.filter((id) => !foundIds.includes(id));
      throw new NotFoundException(`Batch IDs not found: ${missing.join(', ')}`);
    }
    const result = await this.dispatchRepo.collectBatchByCargoOfficer(
      batches.map((b) => b.id),
      officer.id,
    );

    return {
      success: true,
      message: `Batches are collected by the cargo officer.`,
      result,
    };
  }

  async deliverBatchToAirport(data: BatchHandoverDto): Promise<any> {
    // 1. Fetch all batches from DB
    const batches = await this.dispatchRepo.findBatches(data.batchIds);

    // 2. Check which batch IDs were not found
    if (batches.length !== data.batchIds.length) {
      const foundIds = batches.map((b) => b.id);
      const missing = data.batchIds.filter((id) => !foundIds.includes(id));
      throw new NotFoundException(`Batch IDs not found: ${missing.join(', ')}`);
    }

    // 3. Check if batches are in READY or COLLECTED status (cannot deliver already IN_TRANSIT)
    const invalidStatusBatches = batches.filter(
      (b) => b.status !== 'READY' && b.status !== 'COLLECTED',
    );

    if (invalidStatusBatches.length > 0) {
      const ids = invalidStatusBatches.map((b) => b.id);
      throw new BadRequestException(
        `The following batches cannot be delivered to airport due to invalid status: ${ids.join(', ')}`,
      );
    }

    // 4. Validate officer exists
    const officer = await this.dispatchRepo.findUserById(data.handedById);
    if (!officer) {
      throw new RpcException({
        statusCode: 404,
        message: `Officer with ID ${data.handedById} not found.`,
      });
    }

    // 5. Call repository to perform transaction: update status + create handover
    const result = await this.dispatchRepo.handoverBatchToAirport(
      batches.map((b) => b.id),
      officer.id,
      {
        method: data.method,
        reference: data.reference,
        notes: data.notes,
        location: data.currentLocation,
      },
    );

    return {
      success: true,
      message: `Batches are successfully delivered to the airport.`,
      result,
    };
  }

  async assignDriverForDelivery(data: AssignDriverForPickup): Promise<any> {
    return this.dispatchRepo.assignDriverForDelivery(data);
  }

  async assignDriverToOrder(data: AssignDriverForPickup): Promise<any> {
    const { orderId, driverId } = data;
    const order = await this.dispatchRepo.findOrderById(orderId);
    if (!order) {
      throw new RpcException({
        statusCode: 404,
        message: `Order with ID ${orderId} not found.`,
      });
    }
    if (order.status === 'ASSIGNED') {
      throw new RpcException({
        statusCode: 400,
        message: `Order with ID ${orderId} is not eligible for driver assignment or already assigned to another driver. Current status: ${order.status}.`,
      });
    }
    if (order.driverId && order.driverId !== driverId) {
      throw new RpcException({
        statusCode: 400,
        message: `Order with ID ${orderId} is already assigned to another driver.`,
      });
    }
    const driver = await this.dispatchRepo.findUserById(driverId);
    if (!driver) {
      throw new RpcException({
        statusCode: 404,
        message: `Driver with ID ${driverId} not found.`,
      });
    }
    const result = await this.dispatchRepo.assignOrder(orderId, driverId);
    return { success: true, message: 'Driver assigned for delivery', result };
  }

  async lastMileDelivery(orderId: string, driverId: string, notes?: string) {
    const order = await this.dispatchRepo.findOrderById(orderId);
    if (!order) {
      throw new RpcException({
        statusCode: 404,
        message: `Order with ID ${orderId} not found.`,
      });
    }
    if (order.driverId !== driverId) {
      throw new RpcException({
        statusCode: 403, // Forbidden
        message: `Order with ID ${orderId} is not assigned to this driver.`,
      });
    }
    if (order.status !== 'ASSIGNED') {
      throw new RpcException({
        statusCode: 400,
        message: `Order with ID ${orderId} is not eligible for last mile delivery. Current status: ${order.status}.`,
      });
    }
    const result = await this.dispatchRepo.lastMileDelivery(
      orderId,
      driverId,
      notes,
    );
    return {
      success: true,
      message: 'Order picked up for last mile delivery by driver',
      result,
    };
  }

  async completeDelivery(orderId: string, driverId: string, notes?: string) {
    const order = await this.dispatchRepo.findOrderById(orderId);
    if (!order) {
      throw new RpcException({
        statusCode: 404,
        message: `Order with ID ${orderId} not found.`,
      });
    }
    if (order.driverId !== driverId) {
      throw new RpcException({
        statusCode: 403, // Forbidden
        message: `Order with ID ${orderId} is not assigned to this driver.`,
      });
    }
    if (order.status !== 'OUT_FOR_DELIVERY') {
      throw new RpcException({
        statusCode: 400,
        message: `Order with ID ${orderId} is not eligible for delivery and it is not out for delivery. Current status: ${order.status}.`,
      });
    }
    const result = await this.dispatchRepo.deliverOrder(
      orderId,
      driverId,
      notes,
    );
    return { success: true, message: 'Order delivered to customer.', result };
  }

  async removeDriverFromOrder(orderId: string): Promise<any> {
    const order = await this.dispatchRepo.findOrderById(orderId);
    if (!order || order.driverId === null) {
      throw new RpcException({
        statusCode: 404,
        message: `Order with ID ${orderId} is not assigned to any driver or Order does not Exist.`,
      });
    }
    return this.dispatchRepo.removeDriverFromOrder(orderId);
  }

  async changeDriverForOrder(data: AssignDriverForPickup): Promise<any> {
    const { orderId, driverId } = data;
    const order = await this.dispatchRepo.findOrderById(orderId);
    if (!order || order.driverId === null) {
      throw new RpcException({
        statusCode: 404,
        message: `Order with ID ${orderId} is not assigned to any driver or Order does not Exist.`,
      });
    }

    const driver = await this.dispatchRepo.findUserById(driverId);
    if (!driver) {
      throw new RpcException({
        statusCode: 404,
        message: `Driver with ID ${driverId} not found.`,
      });
    }
    return this.dispatchRepo.changeDriverForOrder(orderId, driverId);
  }

  async createBatchDispatch(dto: BatchDispatchDto) {
    console.log('Controller received payload:', dto);

    // 1. Fetch all orders from DB
    const orders = await this.dispatchRepo.findOrdersByIds(dto.orders);

    // 2. Check which IDs were not found
    const foundIds = orders.map((o) => o.id);
    const notFoundIds = dto.orders.filter((id) => !foundIds.includes(id));

    if (notFoundIds.length > 0) {
      throw new RpcException(
        `The following order IDs were not found: ${notFoundIds.join(', ')}`,
      );
    }
    // 3. Check if all orders are in APPROVED status and not already dispatched
    const invalidOrders = orders.filter(
      (o) => o.status !== 'APPROVED' && o.status !== 'DISPATCHED',
    );

    const alreadyDispatchedOrders = orders.filter(
      (o) => o.status === 'DISPATCHED',
    );

    if (invalidOrders.length > 0) {
      const invalidIds = invalidOrders.map((o) => o.id);
      throw new RpcException(
        `The following orders are not approved and cannot be dispatched: ${invalidIds.join(', ')}`,
      );
    }

    if (alreadyDispatchedOrders.length > 0) {
      const dispatchedIds = alreadyDispatchedOrders.map((o) => o.id);
      throw new RpcException(
        `The following orders are already dispatched: ${dispatchedIds.join(', ')}`,
      );
    }

    // 4. Validate that all orders share the same scope
    const uniqueScopes = [...new Set(orders.map((o) => o.shippingScope))];
    if (uniqueScopes.length > 1) {
      throw new RpcException(
        'Orders must belong to the same shipping scope for batch dispatch.',
      );
    }

    // 4. Validate that all orders share the same service type
    // const uniqueServiceTypes = [...new Set(orders.map(o => o.serviceType))];
    // if (uniqueServiceTypes.length > 1) {
    //   throw new RpcException(
    //     'Orders must belong to the same service type for batch dispatch.',
    //   );
    // }

    // 5. Validate orders match requested dto scope
    if (uniqueScopes[0] !== dto.scope) {
      throw new RpcException(
        `Orders scope mismatch. Expected: ${dto.scope}, Found: ${uniqueScopes[0]}`,
      );
    }

    // 6. Validate orders match requested dto serviceType
    // if (uniqueServiceTypes[0] !== dto.serviceType) {
    //   throw new RpcException(
    //     `Orders serviceType mismatch. Expected: ${dto.serviceType}, Found: ${uniqueServiceTypes[0]}`,
    //   );
    // }

    // 7. Generate Batch Code (e.g., "BATCH-YYYYMMDD-XXXX")
    const batchCode = `BATCH-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Math.floor(
      1000 + Math.random() * 9000,
    )}`;

    // 8. Create batch dispatch
    const batch = await this.dispatchRepo.createBatchDispatch(dto, batchCode);
    console.log('batch : ', batch);

    return batch;
  }

  async addOrdersToBatch(
    batchId: string,
    newOrderIds: string[],
    updateData?: Partial<BatchDispatchDto>,
  ) {
    console.log('Controller received payload:', batchId);

    const batch = await this.dispatchRepo.findBatchById(batchId);

    console.log(' batch :', batch);

    if (!batch) {
      throw new RpcException({
        statusCode: 404,
        message: `Batch ${batchId} not found.`,
      });
    }

    // Normalize to date-only (strip time)
    function toDateOnly(date: Date): Date {
      return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }

    const today = toDateOnly(new Date());
    const shipmentDate = toDateOnly(batch.shipmentDate);

    // 1. Check if shipment day is already over
    if (shipmentDate < today) {
      throw new RpcException({
        statusCode: 400,
        message: `Batch ${batchId} has missed its shipment day (${shipmentDate.toDateString()}).`,
      });
    }

    // 2. Check if batch is already dispatched to airport
    if (
      [
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
      ].includes(batch.status)
    ) {
      throw new RpcException({
        statusCode: 400,
        message: `Batch ${batchId} is already in status '${batch.status}' and cannot be modified.`,
      });
    }

    const orders = await this.dispatchRepo.findOrdersByIds(newOrderIds);
    const foundIds = orders.map((o) => o.id);
    const notFoundIds = newOrderIds.filter((id) => !foundIds.includes(id));
    if (notFoundIds.length)
      throw new RpcException(`Orders not found: ${notFoundIds.join(', ')}`);

    // Validate status
    const invalidOrders = orders.filter((o) => o.status !== 'APPROVED');
    const dispatchedOrders = orders.filter((o) => o.status === 'DISPATCHED');
    if (invalidOrders.length)
      throw new RpcException(
        `Orders not approved: ${invalidOrders.map((o) => o.id).join(', ')}`,
      );
    if (dispatchedOrders.length)
      throw new RpcException(
        `Orders already dispatched: ${dispatchedOrders.map((o) => o.id).join(', ')}`,
      );

    // Validate scope & serviceType
    const scopeMismatch = orders.filter((o) => o.shippingScope !== batch.scope);
    const serviceMismatch = orders.filter(
      (o) => o.serviceType !== batch.serviceType,
    );
    if (scopeMismatch.length)
      throw new RpcException(
        `Scope mismatch: ${scopeMismatch.map((o) => o.id).join(', ')}`,
      );
    // if (serviceMismatch.length)
    //   throw new RpcException(
    //     `Service type mismatch: ${serviceMismatch.map((o) => o.id).join(', ')}`,
    //   );

    // Branch validation when batch is at branch
    if (batch.status === 'AT_BRANCH') {
      const branchMismatch = orders.filter(
        (o) => o.branchId !== batch.originId,
      );
      if (branchMismatch.length) {
        throw new RpcException({
          statusCode: 400,
          message: `Branch mismatch: Orders ${branchMismatch
            .map((o) => o.id)
            .join(
              ', ',
            )} do not belong to the batch's origin branch (${batch.originId}).`,
        });
      }
    }

    // Update batch info if provided
    const updatedBatch = await this.dispatchRepo.addOrdersToBatch(
      batchId,
      newOrderIds,
      updateData,
    );
    return IResponse.success(
      'Orders added to batch successfully',
      updatedBatch,
    );
  }

  async getBatches(query: ListQueryDto) {
    return await this.dispatchRepo.getBatches(query);
  }

  async prepareQRCodes(input: {
    orderIds?: string[];
    batchId?: string;
    branchId?: string;
    serviceType?: ServiceType; // optional filter
    shippingScope?: ShippingScope; // optional filter
  }) {
    console.log('input :', input);

    // Step 1: Fetch orders based on input
    let orders: any;

    if (input.orderIds && input.orderIds.length > 0) {
      orders = await this.dispatchRepo.findOrdersByIds(input.orderIds);
    } else if (input.batchId) {
      orders = await this.dispatchRepo.findBatchById(input.batchId);
      // }
      //  else if (input.branchId) {
      //   orders = await this.dispatchRepo.findOrdersByBranch(input.branchId);
    } else {
      throw new RpcException(
        'Must provide at least orderIds, batchId, or branchId',
      );
    }

    if (!orders || orders.length === 0) {
      throw new RpcException('No orders found for the given criteria.');
    }

    // Step 2: Optional filtering
    if (input.serviceType) {
      orders = orders.filter((o) => o.serviceType === input.serviceType);
    }
    if (input.shippingScope) {
      orders = orders.filter((o) => o.shippingScope === input.shippingScope);
    }

    if (orders.length === 0) {
      throw new RpcException('No orders match the given filters.');
    }

    // Step 3: Generate QR codes
    const qrResults = [];

    for (const order of orders) {
      const qrPayload: OrderQRCodeData = {
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
        console.log('qrPayload: ', qrPayload);

        const qrCode = await generateOrderQRCode(qrPayload);

        // Optionally: create a downloadable URL for QR (example)
        const qrDownloadUrl = `data:image/png;base64,${qrCode.split(',')[1]}`;

        qrResults.push({
          orderId: order.id,
          batchId: order.batchId,
          trackingCode: order.trackingCode,
          qrCode, // Base64 QR
          qrDownloadUrl, // Optional download link
        });
      } catch (err) {
        throw new RpcException(
          `Failed to generate QR for order ${order.id}: ${err}`,
        );
      }
    }

    return qrResults;
  }

  async scanOrder(officerId: string, scannedToken: string) {
    // 1️⃣ Decode token first
    let payload: OrderQRCodeData;
    try {
      const jsonString = Buffer.from(
        scannedToken.split(',')[1],
        'base64',
      ).toString();
      payload = JSON.parse(jsonString);
    } catch (err) {
      throw new RpcException('Invalid QR token format');
    }

    // 2️⃣ Find order by trackingCode
    const order = await this.dispatchRepo.findByTrackingCode(
      payload.trackingCode,
    );
    if (!order) throw new RpcException('Order not found');

    // 3️⃣ Validate
    const result = decodeAndValidateQRCode(scannedToken, order);

    const location = 'At airport';
    // 4️⃣ Save scan log
    await this.dispatchRepo.createScan(
      {
        orderId: order.id,
        scannedBy: officerId,
        valid: result.valid,
        notes: result.notes,
        batchId: order.batchId ?? undefined,
      },
      location,
    );

    return result;
  }

  async compareOrders(officerId: string) {
    // 1️⃣ Validate officer
    const officer = await this.dispatchRepo.findUserById(officerId);
    if (!officer) {
      throw new NotFoundException(`Officer with ID ${officerId} not found.`);
    }

    // 2️⃣ Validate branch
    if (!officer.branchId) {
      throw new BadRequestException(
        `Officer ${officerId} is not assigned to any branch.`,
      );
    }

    const branch = await this.dispatchRepo.findBranchById(officer.branchId);
    if (!branch) {
      throw new NotFoundException(
        `Branch with ID ${officer.branchId} not found.`,
      );
    }

    // 3️⃣ Find all batches sent to this branch that are IN_TRANSIT or ARRIVED_AT_DESTINATION
    const batches = await this.dispatchRepo.findBatchesByBranchId(branch.id, [
      'IN_TRANSIT',
      'ARRIVED_AT_DESTINATION',
    ]);
    if (batches.length === 0) {
      return {
        message: 'No batches pending for this branch.',
        missingOrders: [],
        scannedOrders: [],
      };
    }

    // 4️⃣ Collect all orders from these batches
    const batchIds = batches.map((b) => b.id);
    const expectedOrders =
      await this.dispatchRepo.findOrdersByBatchIds(batchIds);

    // 5️⃣ Collect all scanned orders by this officer for these batches
    const scannedOrders = await this.dispatchRepo.findScannedOrdersByOfficer(
      officer.id,
      batchIds,
    );

    // 6️⃣ Compare expected vs scanned
    const expectedTrackingCodes = expectedOrders.map((o) => o.trackingCode);
    const scannedTrackingCodes = scannedOrders.map((s) => s.order.trackingCode);

    const missingOrders = expectedOrders.filter(
      (o) => !scannedTrackingCodes.includes(o.trackingCode),
    );
    const mismatchedOrders = scannedOrders.filter(
      (s) => !expectedTrackingCodes.includes(s.order.trackingCode),
    );

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

  async confirmHandover(dto: ConfirmBatchHandoverDto) {
    const officer = await this.dispatchRepo.findUserById(dto.handedById);
    if (!officer) throw new RpcException('Officer not found');

    const result = await this.dispatchRepo.confirmBatchHandoverAutomatic(
      dto.handedById,
      dto.method,
      dto.reference,
      dto.notes,
    );

    return {
      success: true,
      message: 'All scanned valid orders have been confirmed.',
      ...result,
    };
  }

   async createDriver(data: CreateDriver) {
    const user= await this.dispatchRepo.findUserById(data.userId);
    if (!user) {
      throw new RpcException({
        statusCode: 404,
        message: `User with ID ${data.userId} not found and can not create driver with it.`,
      });
    }

    const vehicle = await this.dispatchRepo.findVehicleById(data.vehicleId);
    if (!vehicle) {
      throw new RpcException({
        statusCode: 404,
        message: `Vehicle with ID ${data.vehicleId} not found and can not create driver for it.`,
      });
    }
    return await this.dispatchRepo.createDriver(data);
  }

  async findDriver(query: ListQueryDto) {
    return await this.dispatchRepo.findDriver(query);
  }
}
