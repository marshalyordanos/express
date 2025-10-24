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
  Address,
  FulfillmentType,
  Order,
  OrderStatus,
  OrderTracking,
  ServiceType,
  ShippingScope,
} from '@prisma/client'; // assuming you use Prisma enums
import { RpcException } from '@nestjs/microservices';
import { IPagination, IResponse } from '../../common/types';
import { ListQueryDto } from '../../common/query/query.dto';
import { MapsService } from '../maps/maps.service';
// import { MapsService } from '../maps/maps.usecase.impl';

@Injectable()
export class OrderUseCasesImpl implements OrderUseCases {

  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly mapsService: MapsService,
    // private readonly mapsService: MapsService,
  ) {}
  //Customer order creating API: For customer to create for it self and staff/Admin to create for customer
  async createOrder(data: any): Promise<Order> {
    // 🔹 Find or create customer
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
          'Customer not found or required details not provided',
        );
      }
      customer = await this.orderRepo.createCustomer({
        name: data.name,
        email: data.email,
        phone: data.phone,
      });
    }

    const username = customer.name.substring(0, 3).toUpperCase();
    const trackingCode = this.generateTrackingCode(username);

    let pickupAddress: any;

    if(data.fulfillmentType === 'PICKUP'){
       pickupAddress= await this.mapsService.reverseGeocode(data.pickupAddress.lat, data.pickupAddress.long);
    }
    // console.log("Repository inside creation order for addresses pickup :::::: ", pickupAddress);

    const deliveryAddress= await this.mapsService.reverseGeocode(data.deliveryAddress.lat, data.deliveryAddress.long);
    // console.log("Repository inside creation order for addresses delivery :::::: ", deliveryAddress);

    // 🔹 Delegate entire order creation + addresses + tracking + distance to repository
    const order = await this.orderRepo.createOrderWithAddresses(
      data,
      customer.id,
      trackingCode,
      pickupAddress,
      deliveryAddress
    );

    return order;
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
    const branchId = order.branchId ?? order.pickupDriver?.branchId;

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

    console.log("Order for comfirming order pickup : ", order);
    
    // ✅ Check if order is assigned to this driver
    if (order.pickupDriverId !== driverId) {
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
    const location = order.pickupAddress.addressLine;

    console.log("location to be the pickup happened. : ", location);
    
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

  async getAllOrders(query: ListQueryDto) {
    const result = await this.orderRepo.getAllOrders(query);
    return result;
  }
  async getOrderById(id: string): Promise<any> {
    return this.orderRepo.getOrderById(id);
  }

  async getException(query: ListQueryDto) {
    return await this.orderRepo.getException(query);
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

  async getOrdersGroupedByScope(query: ListQueryDto) {
    const result = await this.orderRepo.getOrdersGroupedByScope(query);
    // Initialize structure
    const grouped: Record<ShippingScope, Record<ServiceType, any[]>> = {
      TOWN: { STANDARD: [], EXPRESS: [], SAME_DAY: [], OVERNIGHT: [] },
      REGIONAL: { STANDARD: [], EXPRESS: [], SAME_DAY: [], OVERNIGHT: [] },
      INTERNATIONAL: { STANDARD: [], EXPRESS: [], SAME_DAY: [], OVERNIGHT: [] },
    };

    // Group orders
    for (const order of result.orders) {
      if (order.shippingScope && order.serviceType) {
        grouped[order.shippingScope][order.serviceType].push(order);
      }
    }

    return {
      grouped,
      pagination: result.pagination,
    };
  }

  async getOrderStatusLog(query: ListQueryDto) {
    const result = await this.orderRepo.getOrderStatusLog(query);

    // Group by orderId
    const ordersLogGrouped = Object.entries(
      result.orders.reduce(
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
    return {
      orders: ordersLogGrouped,
      // ordersLog: ordersLogFlatSorted,
      pagination: result.pagination,
    };
  }

  async getPendingApproval(query: ListQueryDto) {
    return await this.orderRepo.getPendingApprovals(query);
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


  async updateOrderDistance(orderId: string, distance: number) {
   return await this.orderRepo.updateOrderDistance(orderId, distance);
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

   async getMyOrders(userId: string, query: ListQueryDto) {
    return await this.orderRepo.getMyOrders(userId, query);
  }
}

function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2)); // Distance in km
}
