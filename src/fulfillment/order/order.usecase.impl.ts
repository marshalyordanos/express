import { Injectable } from '@nestjs/common';
import { OrderUseCases } from './order.usecase';
import { CreateOrderDto, ValidateOrderDto } from './order.entity';
import { OrderRepository } from './order.repository';
import { FulfillmentType, OrderStatus, ServiceType } from '@prisma/client'; // assuming you use Prisma enums
import { RpcException } from '@nestjs/microservices';
import { IResponse } from 'src/common/types';

@Injectable()
export class OrderUseCasesImpl implements OrderUseCases {
  constructor(private readonly orderRepo: OrderRepository) {}
  //Customer order creating API: For customer to create for it self and staff/Admin to create for customer
  async createOrder(data: CreateOrderDto): Promise<any> {
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

    return this.orderRepo.createOrder(
      data,
      customerConnect,
      branchConnect,
      driverConnect,
      paymentConnect,
      trackingCode,
    );
  }

  async acceptDropOff(trackingCode: string): Promise<any> {
    console.log('trackingCode 1: ', trackingCode);

    const order = await this.orderRepo.getOrderByTrackingCode(trackingCode);
    if (!order) {
      throw new RpcException(
        `Order with tracking code ${trackingCode} not found`,
      );
    }
    if (order.status !== 'PENDING') {
      throw new RpcException(
        `Order with tracking code ${trackingCode} is not in PENDING status`,
      );
    }
    return this.orderRepo.acceptDropOffOrder(trackingCode);
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
        message: `Order with ID ${orderId} is not ASSIGNED to the driver for the pick up or the package already picked up.`,
      });
    }

    return this.orderRepo.confirmPickupOrder(orderId);
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
    const officer = await this.orderRepo.findStaffById(data.validatedBy);
    if (!officer) {
      throw new RpcException({
        statusCode: 404,
        message: `Officer with ID ${data.validatedBy} not found.`,
      });
    }

    const validatedBy = data.validatedBy;
    return this.orderRepo.validateOrder(orderId, validatedBy, data);
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
  async approveOrder(orderId: string) {
    const order = await this.orderRepo.getOrderById(orderId);
    if (!order) {
      throw new RpcException({
        statusCode: 404,
        message: `Order with ID ${orderId} not found.`,
      });
    }
    return this.orderRepo.approveOrder(orderId);
  }

  //DONE
  async getFragileOrders(data: any): Promise<any> {
    const { page, pageSize } = data;
    const skip = (page - 1) * pageSize;
console.log("This is getting fragile orders with page and page size of this : ", page,pageSize)
    const [order, total] = await this.orderRepo.getFragileOrder(skip, pageSize);
    console.log("Fragile total and fragile orders are :", total, order)
    const totalPages = Math.ceil(total / pageSize);
    return {
      order,
      pagination: {
        total,
        page,
        pageSize,
        totalPages,
      },
    };
  }

  //done
  async getUnusualOrders(data: any): Promise<any> {
    const { page, pageSize } = data;
    const skip = (page - 1) * pageSize;
    const [order, total] = await this.orderRepo.getUnusualOrder(skip, pageSize);
    const totalPages = Math.ceil(total / pageSize);
    return {
      order,
      pagination: {
        total,
        page,
        pageSize,
        totalPages,
      },
    };
  }

  //done
  async getPendingOrders(data: any): Promise<any> {
    const { page, pageSize } = data;
    const skip = (page - 1) * pageSize;
    const [order, total] = await this.orderRepo.getPendingOrder(skip, pageSize);
    const totalPages = Math.ceil(total / pageSize);
    return {
      order,
      pagination: {
        total,
        page,
        pageSize,
        totalPages,
      },
    };
  }

  //done
  async getPendingApprovalOrders(data: any): Promise<any> {
    const { page, pageSize } = data;
    const skip = (page - 1) * pageSize;
    const [order, total] = await this.orderRepo.getPendingApprovalOrder(skip, pageSize);
    const totalPages = Math.ceil(total / pageSize);
    return {
      order,
      pagination: {
        total,
        page,
        pageSize,
        totalPages,
      },
    };
  }

  //done
  async getPendingPickupOrders(data: any): Promise<any> {
    const { page, pageSize } = data;
    const skip = (page - 1) * pageSize;
    const [order, total] = await this.orderRepo.getPendingPickupOrder(skip, pageSize);
    const totalPages = Math.ceil(total / pageSize);
    return {
      order,
      pagination: {
        total,
        page,
        pageSize,
        totalPages,
      },
    };
  }

  //done
  async getAllOrders(data: any): Promise<any> {
    const { page, pageSize } = data;
    const skip = (page - 1) * pageSize;
    const [order, total] = await this.orderRepo.getAllOrders(skip, pageSize);
    const totalPages = Math.ceil(total / pageSize);
    return {
      order,
      pagination: {
        total,
        page,
        pageSize,
        totalPages,
      },
    };
  }
  async getOrderById(id: string): Promise<any> {
    return this.orderRepo.getOrderById(id);
  }

  async getOrderByFullfillmentType(
    type: FulfillmentType,
    data: any,
  ): Promise<any> {
    console.log('Controller received fullfillment type:', type);
    console.log('Controller received fullfillment payload:', data);
    const { page, pageSize } = data;
    const skip = (page - 1) * pageSize;
    console.log(
      '=================== this is getOrderByFullfillmentType =========================',
    );
    console.log('page', page);
    console.log('pageSize', pageSize);
    console.log('============================================');
    const [order, total] = await this.orderRepo.getOrderByFullfillmentType(
      type,
      skip,
      pageSize,
    );
    const totalPages = Math.ceil(total / pageSize);
    return {
      order,
      pagination: {
        total,
        page,
        pageSize,
        totalPages,
      },
    };
  }
  updateOrder(id: string, data: any): Promise<any> {
    throw new Error('Method not implemented.');
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
    return this.orderRepo.getOrderByTrackingCode(code);
  }
  async getOrderByBranch(id: string, data: any): Promise<any> {
    console.log('Controller received branch id:', id);
    console.log('Controller received branch payload:', data);
    const { page, pageSize } = data;
    const skip = (page - 1) * pageSize;
    console.log(
      '=================== this is getOrderByBranch =========================',
    );
    console.log('page', page);
    console.log('pageSize', pageSize);
    console.log('============================================');
    const [order, total] = await this.orderRepo.getOrderByBranch(
      id,
      skip,
      pageSize,
    );
    const totalPages = Math.ceil(total / pageSize);
    return {
      order,
      pagination: {
        total,
        page,
        pageSize,
        totalPages,
      },
    };
  }
  async getOrderByCustomer(id: string, data: any): Promise<any> {
    console.log('Controller received customer id:', id);
    console.log('Controller received customer payload:', data);
    const { page, pageSize } = data;
    const skip = (page - 1) * pageSize;
    console.log(
      '=================== this is getOrderByCustomer =========================',
    );
    console.log('page', page);
    console.log('pageSize', pageSize);
    console.log('============================================');
    const [order, total] = await this.orderRepo.getOrderByCustomerId(
      id,
      skip,
      pageSize,
    );
    const totalPages = Math.ceil(total / pageSize);
    return {
      order,
      pagination: {
        total,
        page,
        pageSize,
        totalPages,
      },
    };
  }
  async getOrderByStatus(status: OrderStatus, data: any): Promise<any> {
    console.log('Controller received status status:', status);
    console.log('Controller received status payload:', data);

    const { page, pageSize } = data;
    const skip = (page - 1) * pageSize;
    console.log(
      '=================== this is getOrderByStatus =========================',
    );
    console.log('page', page);
    console.log('pageSize', pageSize);
    console.log('============================================');
    const [order, total] = await this.orderRepo.getOrderByStatus(
      status,
      skip,
      pageSize,
    );
    const totalPages = Math.ceil(total / pageSize);
    return {
      order,
      pagination: {
        total,
        page,
        pageSize,
        totalPages,
      },
    };
  }
  async getOrderByDriver(id: string, data: any): Promise<any> {
    console.log('Controller received driver id:', id);
    console.log('Controller received driver payload:', data);
    const { page, pageSize } = data;
    const skip = (page - 1) * pageSize;
    console.log(
      '=================== this is getOrderByDriver =========================',
    );
    console.log('page', page);
    console.log('pageSize', pageSize);
    console.log('============================================');

    const [order, total] = await this.orderRepo.getOrderByDriverId(
      id,
      skip,
      pageSize,
    );

    const totalPages = Math.ceil(total / pageSize);
    return {
      order,
      pagination: {
        total,
        page,
        pageSize,
        totalPages,
      },
    };
  }
  async getOrderByType(type: ServiceType, data: any): Promise<any> {
    console.log('Controller received type:', type);
    console.log('Controller received type payload:', data);
    const { page, pageSize } = data;
    console.log(
      '===================this is getOrderByType=========================',
    );
    console.log('page', page);
    console.log('pageSize', pageSize);
    console.log('============================================');

    const skip = (page - 1) * pageSize;
    const [order, total] = await this.orderRepo.getOrderByServiceType(
      type,
      skip,
      pageSize,
    );
    const totalPages = Math.ceil(total / pageSize);
    return {
      order,
      pagination: {
        total,
        page,
        pageSize,
        totalPages,
      },
    };
  }
  async getOrderByPayment(payment: string): Promise<any> {
    throw new Error('Method not implemented.');
  }

  // Local method for tracking code generation
  private generateTrackingCode(username: string): string {
    if (!username || username.length !== 3) {
      throw new Error('Username must be exactly 3 letters');
    }

    let trackingCode: string;
    const usedCodes = new Set(); // Should be managed in a service or database in production
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
