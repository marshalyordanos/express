import { Injectable } from '@nestjs/common';
import { OrderUseCases } from './order.usecase';
import {
  AddException,
  CancelOrderDto,
  CreateOrderDto,
  UpdateOrderDto,
  ValidateOrderDto,
} from './order.entity';
import { OrderRepository } from './order.repository';
import {
  FulfillmentType,
  Order,
  OrderStatus,
  OrderTracking,
  ServiceType,
  ShippingScope,
} from '@prisma/client'; // assuming you use Prisma enums
import { RpcException } from '@nestjs/microservices';
import { IPagination, IResponse } from 'src/common/types';

@Injectable()
export class OrderUseCasesImpl implements OrderUseCases {
  constructor(private readonly orderRepo: OrderRepository) {}
  //Customer order creating API: For customer to create for it self and staff/Admin to create for customer
  async createOrder(data: any): Promise<any> {
    console.log('data: ', data);

    // Find or create customer
    let customer =
      (data.customerId &&
        (await this.orderRepo.findCustomer(data.customerId))) ||
      ((data.email || data.phone) &&
        (await this.orderRepo.findCustomerByEmailOrPhone(
          data.email,
          data.phone,
        )));

    if (!customer) {
      if (!data.name || (!data.email && !data.phone)) {
        throw new RpcException(
          'Customer not found or required details (name and either email or phone) not provided',
        );
      }
      customer = await this.orderRepo.createCustomer({
        name: data.name,
        email: data.email,
        phone: data.phone,
      });
    }

    console.log('customer: ', customer);

    // Generate tracking code
    const username = customer.name.substring(0, 3).toUpperCase();
    const trackingCode = this.generateTrackingCode(username);
    console.log('trackingCode: ', trackingCode);

    // Helper to create connect object or undefined
    const connectIfExists = async (
      id: string,
      findFn: (id: string) => Promise<any>,
    ) => {
      if (!id) return undefined;
      const entity = await findFn(id);
      if (!entity)
        throw new RpcException(`${findFn.name.replace('find', '')} not found`);
      return { connect: { id } };
    };
    // Validate pickup details
    if (data.fulfillmentType === 'PICKUP' && !data.pickupAddress) {
      throw new RpcException('Pickup address is required for pickup orders');
    }

    const customerConnect = { connect: { id: customer.id } };
    const branchConnect = await connectIfExists(
      data.branchId,
      this.orderRepo.findBranch.bind(this.orderRepo),
    );
    const driverConnect = await connectIfExists(
      data.driverId,
      this.orderRepo.findDriver.bind(this.orderRepo),
    );
    const paymentConnect = await connectIfExists(
      data.paymentId,
      this.orderRepo.findPayment.bind(this.orderRepo),
    );

    let location: string | null = null;

    if (data.fulfillmentType === 'PICKUP') {
      location = data.pickupAddress;
    } else if (data.fulfillmentType === 'DROPOFF' && data.branchId) {
      const branch = await this.orderRepo.findBranch(data.branchId);
      location = branch?.location ?? null;
    }

    const updatedBy = customer.id;
    return this.orderRepo.createOrder(
      data,
      customerConnect,
      branchConnect,
      driverConnect,
      paymentConnect,
      trackingCode,
      location,
      updatedBy,
    );
  }

  async solveExceptions(orderId: string, data: UpdateOrderDto): Promise<any> {
    const order = await this.orderRepo.getOrderById(orderId);
    if (!order) {
      throw new RpcException(`Order with ID ${orderId} not found`);
    }
    if (order.status !== 'EXCEPTION') {
      throw new RpcException(
        `Order with ID ${orderId} is not in exception state`,
      );
    }
    return this.orderRepo.solveException(orderId, data);
  }

  async acceptDropOff(trackingCode: string): Promise<any> {
    console.log('trackingCode 1: ', trackingCode);

    const order = await this.orderRepo.getOrderByTrackingCode(trackingCode);
    if (!order) {
      throw new RpcException(
        `Order with tracking code ${trackingCode} not found`,
      );
    }

    // Determine branchId from order or driver's branch
    const branchId = order.branchId ?? order.driver?.branchId;

    if (!branchId) {
      throw new RpcException(
        `Order with tracking code ${trackingCode} does not have a branch assigned`,
      );
    }

    // Fetch branch details
    const branch = await this.orderRepo.findBranch(branchId);

    if (!branch) {
      throw new RpcException(
        `Branch with ID ${branchId} not found for order ${trackingCode}`,
      );
    }

    if (order.status !== 'CREATED' && order.status !== 'PICKED_UP') {
      throw new RpcException(
        `Order with tracking code ['${trackingCode}'] or Order Id ['${order.id}'] can not be COLLECTED because it does not meet the requirement for COLLECTED it have to be in CREATED or PICKED_UP state.`,
      );
    }
    const updatedBy = order.customerId;
    return this.orderRepo.acceptDropOffOrder(
      trackingCode,
      order.id,
      branchId,
      updatedBy,
      branch.location,
    );
  }

  async confirmPickupOrder(orderId: string, driverId: string) {
    const order = await this.orderRepo.getOrderById(orderId);
    if (!order) {
      throw new RpcException({
        statusCode: 404,
        message: `Order with ID ${orderId} not found.`,
      });
    }

    // ✅ Check if order is assigned to this driver
    if (order.driverId !== driverId) {
      throw new RpcException({
        statusCode: 403, // Forbidden
        message: `Order with ID ${orderId} is not assigned to this driver.`,
      });
    }
    if (order.status !== 'ASSIGNED') {
      throw new RpcException({
        statusCode: 403, // Forbidden
        message: `Order with Tracking code ['${order.trackingCode}'] or Order Id ['${order.id}'] is not ASSIGNED to the driver for the pick up or the package already picked up.`,
      });
    }
    const location = order.pickupAddress;

    return this.orderRepo.confirmPickupOrder(orderId, location, driverId);
  }

  // done
  async validateOrder(orderId: string, data: ValidateOrderDto) {
    console.log('updates: ', data);
    const order = await this.orderRepo.getOrderById(orderId);
    if (!order) {
      throw new RpcException({
        statusCode: 404,
        message: `Order with ID ${orderId} not found.`,
      });
    }
    console.log('Order for validation: ', order);

    const officer = await this.orderRepo.findStaffById(data.validatedBy);
    if (!officer) {
      throw new RpcException({
        statusCode: 404,
        message: `Officer with ID ${data.validatedBy} not found.`,
      });
    }
    console.log('Office for validation: ', officer);

    let location: string | null = null;

    if (order.branchId || officer.branchId) {
      // Choose the branchId from order first, then officer
      const branchId = order.branchId ?? officer.branchId;

      // Fetch branch location from DB
      const branch = await this.orderRepo.findBranch(branchId);
      console.log('Found location in branch : ', branch);

      location = branch ? branch.location : null;
    }

    console.log('location for validation: ', location);

    if (!location) {
      throw new RpcException({
        statusCode: 404,
        message: `Order with ID ${order.id} do not have a branch to be found.`,
      });
    }

    if (order.status !== 'DROPPED_OFF') {
      throw new RpcException({
        statusCode: 404,
        message: `Order with Tracking code ['${order.trackingCode}'] can not be validated. It is already Validated or not Collected.`,
      });
    }

    const validatedBy = data.validatedBy;
    return this.orderRepo.validateOrder(orderId, validatedBy, location, data);
  }

  //done
  async markUnusualOrder(orderId: string, data: any) {
    const order = await this.orderRepo.getOrderById(orderId);
    if (!order) {
      throw new RpcException({
        statusCode: 404,
        message: `Order with ID ${orderId} not found.`,
      });
    }
    return this.orderRepo.markUnusualOrder(orderId, data);
  }

  //done
  async approveOrder(orderId: string, reason: string) {
    const order = await this.orderRepo.getOrderById(orderId);
    if (!order) {
      throw new RpcException({
        statusCode: 404,
        message: `Order with ID ${orderId} not found.`,
      });
    }
    if (order.status !== 'PENDING_APPROVAL') {
      throw new RpcException({
        statusCode: 404,
        message: `Order with Tracking code  ['${order.trackingCode}'] can not be approved. It may not be Validated or it already approved.`,
      });
    }

    const location = order.branchId;
    const updatedBy = order.customerId;
    return this.orderRepo.approveOrder(order, reason, location, updatedBy);
  }

  async getAllOrders(payload: {
    filters: any;
    page: number;
    pageSize: number;
  }) {
    const { filters, page, pageSize } = payload;
    const result = await this.orderRepo.getAllOrders(filters, {
      page,
      pageSize,
    });
    return result;
  }
  async getOrderById(id: string): Promise<any> {
    return this.orderRepo.getOrderById(id);
  }

  async getException(
    search: any,
    page: number,
    pageSize: number,
  ): Promise<any> {
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (search) {
      where.OR = [
        { location: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
        { status: { contains: search, mode: 'insensitive' } },
      ];
    }
    return await this.orderRepo.getException(skip, pageSize, where);
  }
  async updateOrder(orderId: string, data: UpdateOrderDto): Promise<any> {
    const order = await this.orderRepo.getOrderById(orderId);
    if (!order) {
      throw new RpcException({
        statusCode: 404,
        message: `Order with ID ${orderId} not found.`,
      });
    }

    return this.orderRepo.updateOrder(orderId, data);
  }
  deleteOrder(id: string): Promise<any> {
    throw new Error('Method not implemented.');
  }
  updateOrderStatus(id: string, data: any): Promise<any> {
    throw new Error('Method not implemented.');
  }
  updateOrderType(id: string, data: any): Promise<any> {
    throw new Error('Method not implemented.');
  }
  updateOrderDriver(id: string, data: any): Promise<any> {
    throw new Error('Method not implemented.');
  }
  async trackOrder(code: string): Promise<any> {
    console.log('Controller received tracking code:', code);
    const order = await this.orderRepo.getOrderByTrackingCode(code);
    if (!order) {
      throw new RpcException({
        code: 404,
        message: `Order with tracking code ${code} not found`,
      });
    }
    const tracking = await this.orderRepo.trackOrder(order.id);
    if (!tracking) {
      throw new RpcException({
        code: 404,
        message: `Order with tracking code ${code} Does not have a tracking`,
      });
    }

    return {
      order,
      tracking,
    };
  }

  async getOrdersGroupedByScope(data: any): Promise<any> {
    const { page, pageSize } = data;
    const skip = (page - 1) * pageSize;
    const [orders, total] = await this.orderRepo.getOrdersGroupedByScope(
      skip,
      pageSize,
    );
    // Initialize structure
    const grouped: Record<ShippingScope, Record<ServiceType, any[]>> = {
      TOWN: { STANDARD: [], EXPRESS: [], SAME_DAY: [], OVERNIGHT: [] },
      REGIONAL: { STANDARD: [], EXPRESS: [], SAME_DAY: [], OVERNIGHT: [] },
      INTERNATIONAL: { STANDARD: [], EXPRESS: [], SAME_DAY: [], OVERNIGHT: [] },
    };

    // Group orders
    for (const order of orders) {
      if (order.shippingScope && order.serviceType) {
        grouped[order.shippingScope][order.serviceType].push(order);
      }
    }
    const totalPages = Math.ceil(total / pageSize);
    return {
      grouped,
      pagination: {
        total,
        page,
        pageSize,
        totalPages,
      },
    };
  }

  async getOrderStatusLog(data: any): Promise<{
    // ordersLog: OrderTracking[];
    ordersLog: { id: string; logs: OrderTracking[] }[];
    pagination: IPagination;
  }> {
    const { page, pageSize, updatedBy, orderId, search } = data;
    const skip = (page - 1) * pageSize;

    const where: any = {};

    if (updatedBy) {
      where.updatedBy = updatedBy;
    }
    if (orderId) {
      where.orderId = orderId;
    }
    if (search) {
      where.OR = [
        { location: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
        { status: { contains: search, mode: 'insensitive' } },
      ];
    }
    const [ordersLogFlat, total] = await this.orderRepo.getOrderStatusLog(
      skip,
      pageSize,
      where,
    );

    // Group by orderId
    const ordersLogGrouped = Object.entries(
      ordersLogFlat.reduce(
        (acc, log) => {
          if (!acc[log.orderId]) acc[log.orderId] = [];
          acc[log.orderId].push(log);
          return acc;
        },
        {} as Record<string, OrderTracking[]>,
      ),
    ).map(([orderId, logs]) => ({
      id: orderId,
      logs,
    }));

    // const ordersLogFlatSorted = ordersLogFlat.sort((a, b) =>
    //   a.orderId.localeCompare(b.orderId),
    // );
    const totalPages = Math.ceil(total / pageSize);
    return {
      ordersLog: ordersLogGrouped,
      // ordersLog: ordersLogFlatSorted,
      pagination: {
        total,
        page,
        pageSize,
        totalPages,
      },
    };
  }

  async getPendingApproval(
    filters: string,
    page: number,
    pageSize: number,
  ): Promise<any> {
    const skip = (page - 1) * pageSize;

    return await this.orderRepo.getPendingApprovals(skip, pageSize);
  }

  async cancelOrder(data: CancelOrderDto): Promise<any> {
    const { orderId, reason } = data;
    return await this.orderRepo.cancelOrder(orderId, reason);
  }

  async addException(data: AddException): Promise<any> {
    const { orderId, reason, type } = data;
    const order = await this.orderRepo.getOrderById(orderId);
    if (!order) {
      throw new RpcException({
        code: 404,
        message: `Order with id ${orderId} not found`,
      });
    }
    const exception = await this.orderRepo.addException(orderId, reason, type);
    if (!exception) {
      throw new RpcException({
        code: 404,
        message: `Order with id ${orderId} not found`,
      });
    }
    return exception;
  }
  // Local method for tracking code generation
  private generateTrackingCode(username: string): string {
    if (!username || username.length !== 3) {
      throw new Error('Username must be exactly 3 letters');
    }

    let trackingCode: string;
    const usedCodes = new Set();
    do {
      const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
      const randomSuffix = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, '0'); // 3-digit random
      trackingCode = `${username.toUpperCase()}-${timestamp}-${randomSuffix}`;
    } while (usedCodes.has(trackingCode));

    usedCodes.add(trackingCode);
    return trackingCode;
  }
}
