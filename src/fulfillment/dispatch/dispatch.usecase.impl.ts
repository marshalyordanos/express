import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DispatchUseCases } from './dispatch.usecase';
import { DispatchRepository } from './dispatch.repository';
import {
  AssignDriverForBatch,
  AssignDriverForPickup,
  BatchDispatchDto,
} from './dispatch.entity';
import { RpcException } from '@nestjs/microservices';
import { DispatchStatus, ShippingScope, ServiceType } from '@prisma/client';
import { IResponse } from 'src/common/types';

@Injectable()
export class DispatchUseCasesImpl implements DispatchUseCases {
  constructor(private readonly dispatchRepo: DispatchRepository) {}

  async assignDriverForPickup(data: AssignDriverForPickup): Promise<any> {
    const driver = await this.dispatchRepo.findUserById(data.driverId);
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

    // Assign driver
    const updatedOrder = await this.dispatchRepo.assignDriverForPickup(data);

    return {
      statusCode: 200,
      message: `Driver ${driver.name} (ID: ${driver.id}) successfully assigned to order ${order.id}.`,
      data: updatedOrder,
    };
  }

  async confirmDispatch(data: AssignDriverForBatch): Promise<any> {
    // 1. Check if driver exists (optional, depending on your business rules)
    const driver = await this.dispatchRepo.findUserById(data.driverId);
    if (!driver) {
      throw new NotFoundException(`Driver with ID ${data.driverId} not found`);
    }

    // 2. Check that all batch IDs exist
    const batches = await this.dispatchRepo.findBatches(data.batchId);

    if (batches.length !== data.batchId.length) {
      const foundIds = batches.map((b) => b.id);
      const missing = data.batchId.filter((id) => !foundIds.includes(id));
      throw new NotFoundException(`Batch IDs not found: ${missing.join(', ')}`);
    }

    // 3. Assign driver to the batches
    const result = await this.dispatchRepo.confirmDispatch(data.batchId);

    return {
      success: true,
      message: `Batches are ready for delivering to the airport or given to the cargo officer.`,
      result,
    };
  }

  async collectBatchByCargoOfficer(data: any): Promise<any> {
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

  async deliverBatchToAirport(data: any): Promise<any> {
    //  Check that all batch IDs exist
    const batches = await this.dispatchRepo.findBatches(data.batchId);

    if (batches.length !== data.batchId.length) {
      const foundIds = batches.map((b) => b.id);
      const missing = data.batchId.filter((id) => !foundIds.includes(id));
      throw new NotFoundException(`Batch IDs not found: ${missing.join(', ')}`);
    }
    const result = await this.dispatchRepo.deliverBatchToAirport(
      batches.map((b) => b.id),
    );

    return {
      success: true,
      message: `Batches are delivered to the airport.`,
      result,
    };
  }

  

  async assignDriverForDelivery(data: AssignDriverForPickup): Promise<any> {
    return this.dispatchRepo.assignDriverForDelivery(data);
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
    const batch = await this.dispatchRepo.findBatchById(batchId);
    if (!batch) throw new RpcException(`Batch ${batchId} not found.`);

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

  async getBatches(requestFilters: any) {
    const filters = requestFilters.filters || {};
    console.log('filters: ', filters);
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 10;

    const result = await this.dispatchRepo.getBatches({
      status: filters.status,
      scope: filters.scope,
      serviceType: filters.serviceType,
      fragile: filters.fragile,
      unusual: filters.unusual,
      search: filters.search,
      page,
      pageSize,
    });

    return {
      success: true,
      message: 'Batch dispatches fetched successfully',
      data: result.data,
      pagination: {
        page,
        pageSize,
        total: result.total,
        totalPages: Math.ceil(result.total / pageSize),
      },
    };
  }
}
