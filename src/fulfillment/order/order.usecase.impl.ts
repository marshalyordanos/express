import { Injectable, Logger } from '@nestjs/common';
import { OrderUseCases } from './order.usecase';
import {
  AddException,
  CancelOrderDto,
  UpdateOrderDto,
  ValidateOrderDto,
} from './order.entity';
import { OrderRepository } from './order.repository';
import {
  OrderTracking,
  ServiceType,
  Order,
  ShippingScope,
  OrderRouteSegment,
  Address,
} from '@prisma/client';
import { RpcException } from '@nestjs/microservices';
import { ListQueryDto } from '../../common/query/query.dto';
import { MapsService } from '../maps/maps.service';
import { handleCatch } from '../../common/handleCatch';
import { AppLogger } from '../../common/app-logger.service';
import { PricingUseCasesImpl } from '../pricing/pricing.usecase.impl';
import { NotificationPublisher } from '../../common/notification-publisher';
import { DriverAssignmentQueue } from './queue/driver-assignment.queue';
import { OrderQueue } from './queue/order.queue';

@Injectable()
export class OrderUseCasesImpl implements OrderUseCases {
  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly mapsService: MapsService,
    // private readonly mapsService: MapsService,
    private readonly pricingUseCases: PricingUseCasesImpl,
    private readonly logger: AppLogger,
    private readonly notificationPublisher: NotificationPublisher,
    private readonly orderQueue: OrderQueue,
    private readonly driverQueue: DriverAssignmentQueue,
  ) {
    this.logger.setContext('FulfillmentService', 'OrderUsecaseImpl');
  }
  //Customer order creating API: For customer to create for it self and staff/Admin to create for customer
  // async createOrder(data: any, userId: string): Promise<Order> {
  //   this.logger.log(`Order creation requested by userId: ${userId}`);

  //   try {
  //     // 🔹 Find or create customer
  //     let customer =
  //       (data.customerId &&
  //         (await this.orderRepo.findCustomer(data.customerId))) ||
  //       ((data.email || data.phone) &&
  //         (await this.orderRepo.findCustomerByEmailOrPhone(
  //           data.email,
  //           data.phone,
  //         )));

  //     if (customer && customer.id !== userId) {
  //       this.logger.warn(
  //         `Unauthorized order creation attempt by userId: ${userId}, customerId: ${customer.id}`,
  //       );
  //       throw new RpcException({
  //         statusCode: 403,
  //         message: 'You are not authorized to create this order.',
  //       });
  //     }

  //     // 🔹 Find or create receiver
  //     let receiver =
  //       (data.receiverId &&
  //         (await this.orderRepo.findCustomer(data.receiverId))) ||
  //       ((data.receiverEmail || data.receiverPhone) &&
  //         (await this.orderRepo.findCustomerByEmailOrPhone(
  //           data.receiverEmail,
  //           data.receiverPhone,
  //         )));

  //     // 🔹 Create customer if not found
  //     if (!customer) {
  //       if (!data.name || (!data.email && !data.phone)) {
  //         this.logger.warn(
  //           `Customer details missing for order creation by userId: ${userId}`,
  //         );
  //         throw new RpcException({
  //           statusCode: 400,
  //           message: 'Customer not found or required details not provided',
  //         });
  //       }
  //       customer = await this.orderRepo.createCustomer({
  //         name: data.name,
  //         email: data.email,
  //         phone: data.phone,
  //         userId,
  //       });
  //       this.logger.verbose(`Customer with id: ${customer.id} created with notification preference`);
  //     }

  //     // 🔹 Create receiver if not found
  //     if (!receiver) {
  //       if (
  //         !data.receiverName ||
  //         (!data.receiverEmail && !data.receiverPhone)
  //       ) {
  //         this.logger.warn(
  //           `Receiver details missing for order creation by userId: ${userId}`,
  //         );
  //         throw new RpcException({
  //           statusCode: 400,
  //           message: 'Receiver not found or required details not provided',
  //         });
  //       }
  //       receiver = await this.orderRepo.findOrCreateCustomer({
  //         name: data.receiverName,
  //         email: data.receiverEmail,
  //         phone: data.receiverPhone,
  //         userId,
  //       });
  //       this.logger.verbose(`Receiver created with id: ${receiver.id}`);
  //     }

  //     // 🔹 Generate tracking code
  //     const username = customer.name.substring(0, 3).toUpperCase();
  //     const trackingCode = this.generateTrackingCode(username);

  //     // 🔹 Resolve addresses
  //     let pickupAddress: any = null;
  //     if (data.fulfillmentType === 'PICKUP') {
  //       pickupAddress = await this.mapsService.reverseGeocode(
  //         data.pickupAddress.lat,
  //         data.pickupAddress.long,
  //       );
  //       this.logger.verbose('Pickup address resolved');
  //     }

  //     const deliveryAddress = await this.mapsService.reverseGeocode(
  //       data.deliveryAddress.lat,
  //       data.deliveryAddress.long,
  //     );
  //     this.logger.verbose('Delivery address resolved');

  //     // 🔹 Delegate order creation to repository
  //     const order = await this.orderRepo.createOrderWithAddresses(
  //       data,
  //       customer.id,
  //       receiver.id,
  //       trackingCode,
  //       pickupAddress,
  //       deliveryAddress,
  //       userId,
  //     );

  //     let origin: { lat: number; lon: number };
  //     if (order.pickupAddress) {
  //       origin = {
  //         lat: Number(order.pickupAddress.lat),
  //         lon: Number(order.pickupAddress.long),
  //       };
  //     } else {
  //       origin = (await this.orderRepo.getBranchCoordinates(
  //         data.branchId,
  //       )) as any;
  //     }

  //     const destination = {
  //       lat: Number(order.deliveryAddress.lat),
  //       lon: Number(order.deliveryAddress.long),
  //     };

  //     console.log('before calculating : ', origin, destination);

  //     // Emit WebSocket or background job for async processing
  //     this.calculateDistanceAndPrice(order.id, origin, destination);

  //     this.logger.log(
  //       `Order created successfully with id: ${order.id}, trackingCode: ${trackingCode}`,
  //     );

  //     await this.notificationPublisher.publish('order.created', {
  //       type: 'order.created',
  //       userId,
  //       userEmail: customer.email,
  //       subject: 'New Order created',
  //       message: `Your order ${order.trackingCode} has been created.`,
  //       payload: { orderId: order.id, tracking: trackingCode }, // extra metadata
  //     });

  //     return order;
  //   } catch (error) {
  //     // ✅ Handle known and unknown errors
  //     this.logger.error(
  //       `Order creation failed for userId: ${userId}: ${error.message}`,
  //     );
  //     throw handleCatch(error);
  //   }
  // }

  async createOrder(data: any, userId: string): Promise<Order> {
    this.logger.log(`Order creation requested by userId: ${userId}`);

    try {
      // 1️⃣ Find/create customer and receiver (fast queries)
      const { customer, receiver } = await this.resolveCustomerReceiver(
        data,
        userId,
      );

      console.log(
        `Order creation for customer ${customer}, and receiver ${receiver}`,
      );

      // 2️⃣ Create order inside small transaction
      const order = await this.orderRepo.createOrderWithAddresses(
        data,
        customer.id,
        receiver.id,
        this.generateTrackingCode(customer.name.substring(0, 3)),
        userId,
      );

      console.log(`Order created one ::: ${order}`);

      await this.orderQueue.enqueueDistancePrice(order.id, {
        origin: order.pickupAddress,
        destination: order.deliveryAddress,
      });
      console.log(`Sending order to ques`);

      await this.orderQueue.enqueueSegmentCreation(order.id);
      // await this.driverQueue.enqueueInternalDriverAssignment(order.id);

      //       await this.orderQueue.enqueueDistancePrice(order.id, {...});
      // await this.orderQueue.enqueueSegmentCreation(order.id);
      // await this.driverQueue.enqueueInternalDriverAssignment(order.id);

      // 3️⃣ Push heavy tasks to queue (non-blocking)
      // this.queueService.add('order.calculateDistance', {
      //   orderId: order.id,
      //   branchId: data.branchId,
      //   pickupAddress: order.pickupAddress,
      //   deliveryAddress: order.deliveryAddress,
      // });

      // this.queueService.add('order.notifyCreated', {
      //   orderId: order.id,
      //   email: customer.email,
      //   tracking: order.trackingCode,
      //   userId,
      // });

      // this.queueService.add('order.assignDriver', {
      //   orderId: order.id,
      // });

      return order; // ⚡ returns instantly
    } catch (err) {
      this.logger.error(err);
      throw handleCatch(err);
    }
  }

  public async calculateDistancePriceBackground(
    orderId: string,
  ): Promise<void> {
    console.log(
      `[DistancePrice] Calculating distance & price for order ${orderId}`,
    );

    // 1️⃣ Fetch order with coordinates
    const order = await this.orderRepo.getOrderCoordinates(orderId);
    if (!order) throw new Error(`[DistancePrice] Order ${orderId} not found`);

    const pickup = order.pickupAddress;
    const delivery = order.deliveryAddress;
    const branch = order.branch?.address; // branch location, if pickup missing

    if (!delivery?.lat || !delivery?.long)
      throw new Error(
        `[DistancePrice] Invalid delivery coordinates for order ${orderId}`,
      );

    // 2️⃣ Determine origin: pickup or branch
    const originCoords =
      pickup?.lat && pickup?.long
        ? { lat: parseFloat(pickup.lat), lon: parseFloat(pickup.long) }
        : branch
          ? { lat: parseFloat(branch.lat), lon: parseFloat(branch.long) }
          : null;

    if (!originCoords)
      throw new Error(
        `[DistancePrice] No valid origin coordinates for order ${orderId}`,
      );

    const destinationCoords = {
      lat: parseFloat(delivery.lat),
      lon: parseFloat(delivery.long),
    };

    // 3️⃣ Calculate distance for main segment
    const distanceKm = await this.mapsService.calculateDistance(
      originCoords,
      destinationCoords,
    );
    console.log(`[DistancePrice] Distance calculated: ${distanceKm} km`);

    // 5️⃣ Calculate price
    await this.pricingUseCases.calculatePrice(orderId);

    const price = await this.orderRepo.findPrice(orderId);
    this.notificationPublisher.publish('order.price.calculated', {
      orderId,
      userId: order.customerId,
      payload: { price },
    });

    console.log(
      `[DistancePrice] Price calculation completed for order ${orderId}`,
    );
  }

public async generateSegments(orderId: string): Promise<void> {
  console.log(`[Segments] Generating segments for order ${orderId}`);

  const order = await this.orderRepo.getOrderById(orderId);
  if (!order) throw new Error(`[Segments] Order ${orderId} not found`);

  const pickup = order.pickupAddress;
  const delivery = order.deliveryAddress;

  if (!delivery?.lat || !delivery?.long)
    throw new Error(`[Segments] Invalid delivery coordinates for order ${orderId}`);

  const segmentsToCreate: Partial<OrderRouteSegment>[] = [];
  let sequence = 1;
  let totalDistance = 0; // <-- accumulate total distance

  // ✅ Town scope → pickup → delivery directly
  if (order.shippingScope === 'TOWN') {
    const distanceKm = await this.mapsService.calculateDistance(
      { lat: parseFloat(pickup?.lat || '0'), lon: parseFloat(pickup?.long || '0') },
      { lat: parseFloat(delivery.lat), lon: parseFloat(delivery.long) },
    );

    segmentsToCreate.push({
      orderId,
      originId: pickup?.id || order.branch?.id || 'origin-placeholder',
      destinationId: delivery.id,
      distanceKm,
      sequence: sequence++,
    });

    totalDistance += distanceKm;
  }

  // ✅ Regional / International placeholders
  if (order.shippingScope === 'REGIONAL' || order.shippingScope === 'INTERNATIONAL') {
    const branchAddress = {
      id: 'branch-placeholder-id',
      lat: parseFloat(order.branch?.location?.split(',')[0] || '0'),
      long: parseFloat(order.branch?.location?.split(',')[1] || '0'),
      label: 'Branch Placeholder',
    };
    const airportAddress = { id: 'airport-placeholder-id', lat: 9.03, long: 38.76, label: 'Airport Placeholder' };

    // Pickup → Branch
    if (pickup) {
      const dist = await this.mapsService.calculateDistance(
        { lat: parseFloat(pickup.lat), lon: parseFloat(pickup.long) },
        { lat: branchAddress.lat, lon: branchAddress.long },
      );
      segmentsToCreate.push({
        orderId,
        originId: pickup.id,
        destinationId: branchAddress.id,
        distanceKm: dist,
        sequence: sequence++,
      });
      totalDistance += dist;
    }

    // Branch → Airport
    let dist = await this.mapsService.calculateDistance(
      { lat: branchAddress.lat, lon: branchAddress.long },
      { lat: airportAddress.lat, lon: airportAddress.long },
    );
    segmentsToCreate.push({
      orderId,
      originId: branchAddress.id,
      destinationId: airportAddress.id,
      distanceKm: dist,
      sequence: sequence++,
    });
    totalDistance += dist;

    // Airport → Destination Branch
    dist = await this.mapsService.calculateDistance(
      { lat: airportAddress.lat, lon: airportAddress.long },
      { lat: branchAddress.lat, lon: branchAddress.long },
    );
    segmentsToCreate.push({
      orderId,
      originId: airportAddress.id,
      destinationId: branchAddress.id,
      distanceKm: dist,
      sequence: sequence++,
    });
    totalDistance += dist;

    // Branch → Delivery
    dist = await this.mapsService.calculateDistance(
      { lat: branchAddress.lat, lon: branchAddress.long },
      { lat: parseFloat(delivery.lat), lon: parseFloat(delivery.long) },
    );
    segmentsToCreate.push({
      orderId,
      originId: branchAddress.id,
      destinationId: delivery.id,
      distanceKm: dist,
      sequence: sequence++,
    });
    totalDistance += dist;
  }

  // Save segments
  for (const segment of segmentsToCreate) {
    await this.orderRepo.createSegment(orderId, segment);
    console.log(`[Segments] Segment saved: ${segment.sequence} | ${segment.originId} → ${segment.destinationId}`);
  }

  // Save total distance to order
  await this.orderRepo.updateOrderDistance(orderId, totalDistance);
  console.log(`[Segments] Total distance ${totalDistance} km saved for order ${orderId}`);
}

  private async resolveCustomerReceiver(data: any, userId: string) {
    // 🔹 1. Find existing customer
    let customer =
      (data.customerId &&
        (await this.orderRepo.findCustomer(data.customerId))) ||
      ((data.email || data.phone) &&
        (await this.orderRepo.findCustomerByEmailOrPhone(
          data.email,
          data.phone,
        )));

    // Validate ownership
    if (customer && customer.id !== userId) {
      throw new RpcException({
        statusCode: 403,
        message: 'You are not authorized to create this order.',
      });
    }

    // 🔹 2. Create customer if not found
    if (!customer) {
      if (!data.name || (!data.email && !data.phone)) {
        throw new RpcException({
          statusCode: 400,
          message: 'Customer details missing',
        });
      }

      customer = await this.orderRepo.createCustomer({
        name: data.name,
        email: data.email,
        phone: data.phone,
        userId,
      });
    }

    // 🔹 3. Find existing receiver
    let receiver =
      (data.receiverId &&
        (await this.orderRepo.findCustomer(data.receiverId))) ||
      ((data.receiverEmail || data.receiverPhone) &&
        (await this.orderRepo.findCustomerByEmailOrPhone(
          data.receiverEmail,
          data.receiverPhone,
        )));

    // 🔹 4. Create receiver if not found
    if (!receiver) {
      if (!data.receiverName || (!data.receiverEmail && !data.receiverPhone)) {
        throw new RpcException({
          statusCode: 400,
          message: 'Receiver details missing',
        });
      }

      receiver = await this.orderRepo.findOrCreateCustomer({
        name: data.receiverName,
        email: data.receiverEmail,
        phone: data.receiverPhone,
        userId,
      });
    }

    return { customer, receiver };
  }

  async calculateDistanceAndPrice(
    orderId: string,
    origin: { lat: number; lon: number },
    destination: { lat: number; lon: number },
  ) {
    console.log(
      'Corrected to be calculated origin and destination :: ',
      origin,
      destination,
    );

    const distance = await this.mapsService.calculateDistance(
      origin,
      destination,
    );

    console.log('calculated data for distance ::: ', distance);

    await this.updateOrderDistance(orderId, distance);

    const priceData = await this.pricingUseCases.calculatePrice(orderId);
    console.log('Calculated data for price ::: ', priceData);

    console.log(
      `responsing after calculating of distance ${distance} and price ${priceData}`,
    );

    return { distance, priceData };
  }
  async createUserOrder(data: any): Promise<Order> {
    this.logger.log('User order creation requested');

    try {
      // 🔹 Find or create customer
      let customer =
        (data.customerId &&
          (await this.orderRepo.findCustomer(data.customerId))) ||
        ((data.email || data.phone) &&
          (await this.orderRepo.findCustomerByEmailOrPhone(
            data.email,
            data.phone,
          )));

      let receiver =
        (data.receiverId &&
          (await this.orderRepo.findCustomer(data.receiverId))) ||
        ((data.receiverEmail || data.receiverPhone) &&
          (await this.orderRepo.findCustomerByEmailOrPhone(
            data.receiverEmail,
            data.receiverPhone,
          )));

      // 🔹 Create customer if not found
      if (!customer) {
        if (!data.name || (!data.email && !data.phone)) {
          this.logger.warn('Customer not found or required details missing');
          throw new RpcException({
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

      // 🔹 Create receiver if not found
      if (!receiver) {
        if (
          !data.receiverName ||
          (!data.receiverEmail && !data.receiverPhone)
        ) {
          this.logger.warn('Receiver not found or required details missing');
          throw new RpcException({
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

      // 🔹 Generate tracking code
      const username = customer.name.substring(0, 3).toUpperCase();
      const trackingCode = this.generateTrackingCode(username);

      // 🔹 Resolve addresses
      let pickupAddress: any = null;
      if (data.fulfillmentType === 'PICKUP') {
        pickupAddress = await this.mapsService.reverseGeocode(
          data.pickupAddress.lat,
          data.pickupAddress.long,
        );
        this.logger.verbose('Pickup address resolved ::: ', pickupAddress);
      }

      const deliveryAddress = await this.mapsService.reverseGeocode(
        data.deliveryAddress.lat,
        data.deliveryAddress.long,
      );
      this.logger.verbose(
        'Delivery address resolved ::: ',
        deliveryAddress as string,
      );

      // 🔹 Create order with addresses
      // const order = await this.orderRepo.createOrderWithAddresses(
      //   data,
      //   customer.id,
      //   receiver.id,
      //   trackingCode,
      //   pickupAddress,
      //   deliveryAddress,
      // );

      const order: any = [];
      let origin: { lat: number; lon: number };
      if (order.pickupAddress) {
        origin = {
          lat: Number(order.pickupAddress.lat),
          lon: Number(order.pickupAddress.long),
        };
      } else {
        origin = (await this.orderRepo.getBranchCoordinates(
          data.branchId,
        )) as any;
      }

      const destination = {
        lat: Number(order.deliveryAddress.lat),
        lon: Number(order.deliveryAddress.long),
      };

      console.log('before calculating : ', origin, destination);

      // Emit WebSocket or background job for async processing
      this.calculateDistanceAndPrice(order.id, origin, destination);

      this.logger.log(
        `Order created successfully with id: ${order.id}, trackingCode: ${trackingCode}`,
      );
      return order;
    } catch (error) {
      this.logger.error(`User order creation failed: ${error.message}`);
      throw handleCatch(error);
    }
  }

  async solveExceptions(
    orderId: string,
    data: UpdateOrderDto,
    userId: string,
  ): Promise<any> {
    this.logger.log(
      `Solve exception requested for orderId=${orderId} by userId=${userId}`,
    );

    try {
      const order = await this.orderRepo.getOrderById(orderId);
      if (!order) {
        this.logger.warn(`Order not found: ${orderId}`);
        throw new RpcException({
          statusCode: 404,
          message: `Order with ID ${orderId} not found`,
        });
      }

      if (order.status !== 'EXCEPTION') {
        this.logger.warn(`Order ${orderId} not in exception state`);
        throw new RpcException({
          statusCode: 400,
          message: `Order with ID ${orderId} is not in exception state`,
        });
      }

      const result = await this.orderRepo.solveException(orderId, data, userId);
      this.logger.log(`Order exception solved for orderId=${orderId}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to solve exception for orderId=${orderId}: ${error.message}`,
      );
      throw handleCatch(error);
    }
  }

  async acceptDropOff(trackingCode: string): Promise<any> {
    this.logger.log(
      `Accept drop-off requested for trackingCode=${trackingCode}`,
    );

    try {
      const order = await this.orderRepo.getOrderByTrackingCode(trackingCode);
      if (!order) {
        this.logger.warn(`Order not found for trackingCode=${trackingCode}`);
        throw new RpcException({
          statusCode: 404,
          message: `Order with tracking code ${trackingCode} not found`,
        });
      }

      console.log('Pickup driver branch id :: ', order.pickupDriver?.branchId);

      const branchId = order.branchId ?? order.pickupDriver?.branchId;
      if (!branchId) {
        this.logger.warn(
          `Branch not assigned for order trackingCode=${trackingCode}`,
        );
        throw new RpcException({
          statusCode: 400,
          message: `Order with tracking code ${trackingCode} does not have a branch assigned`,
        });
      }

      const branch = await this.orderRepo.findBranch(branchId);
      if (!branch) {
        this.logger.warn(
          `Branch not found: ${branchId} for order trackingCode=${trackingCode}`,
        );
        throw new RpcException({
          statusCode: 404,
          message: `Branch with ID ${branchId} not found for order ${trackingCode}`,
        });
      }

      if (order.status !== 'CREATED' && order.status !== 'PICKED_UP') {
        this.logger.warn(
          `Order status invalid for drop-off: trackingCode=${trackingCode}, status=${order.status}`,
        );
        throw new RpcException({
          statusCode: 400,
          message: `Order with tracking code ['${trackingCode}'] or Order Id ['${order.id}'] cannot be collected because it must be in CREATED or PICKED_UP state`,
        });
      }

      const updatedBy = order.customerId;
      const result = await this.orderRepo.acceptDropOffOrder(
        trackingCode,
        order.id,
        branchId,
        updatedBy,
        branch.location,
      );

      this.logger.log(`Drop-off accepted for orderId=${order.id}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to accept drop-off for trackingCode=${trackingCode}: ${error.message}`,
      );
      throw handleCatch(error);
    }
  }

  async confirmPickupOrder(orderId: string, driverId: string, userId: string) {
    this.logger.log(
      `Confirm pickup requested for orderId=${orderId} by userId=${userId}`,
    );

    try {
      if (userId !== driverId) {
        this.logger.warn(`Unauthorized pickup attempt by userId=${userId}`);
        throw new RpcException({
          statusCode: 403,
          message: 'You are not authorized for this request',
        });
      }

      const order = await this.orderRepo.getOrderById(orderId);
      if (!order) {
        this.logger.warn(`Order not found: ${orderId}`);
        throw new RpcException({
          statusCode: 404,
          message: `Order with ID ${orderId} not found`,
        });
      }

      if (order.pickupDriverId !== userId) {
        this.logger.warn(`Order ${orderId} not assigned to driver ${userId}`);
        throw new RpcException({
          statusCode: 403,
          message: `Order with ID ${orderId} is not assigned to this driver`,
        });
      }

      if (order.status !== 'ASSIGNED') {
        this.logger.warn(
          `Order ${orderId} status invalid for pickup: ${order.status}`,
        );
        throw new RpcException({
          statusCode: 400,
          message: `Order with Tracking code ['${order.trackingCode}'] or Order Id ['${order.id}'] is not in ASSIGNED state for pickup`,
        });
      }

      const location = order.pickupAddress.addressLine;
      const result = await this.orderRepo.confirmPickupOrder(
        orderId,
        location,
        userId,
      );

      this.logger.log(
        `Pickup confirmed for orderId=${orderId} at location=${location}`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to confirm pickup for orderId=${orderId}: ${error.message}`,
      );
      throw handleCatch(error);
    }
  }
  // done
  async validateOrder(orderId: string, data: ValidateOrderDto, userId: string) {
    this.logger.log(
      `Validate order requested for orderId=${orderId} by userId=${userId}`,
    );

    try {
      const order = await this.orderRepo.getOrderById(orderId);
      if (!order) {
        this.logger.warn(`Order not found: ${orderId}`);
        throw new RpcException({
          statusCode: 404,
          message: `Order with ID ${orderId} not found.`,
        });
      }
      this.logger.log(`Order found: ${order.id}`);

      const officer = await this.orderRepo.findStaffById(userId);
      if (!officer) {
        this.logger.warn(`Officer not found: ${userId}`);
        throw new RpcException({
          statusCode: 404,
          message: `Officer with ID ${userId} not found.`,
        });
      }

      let location: string | null = null;
      if (order.branchId || officer.branchId) {
        const branchId = order.branchId ?? officer.branchId;
        const branch = await this.orderRepo.findBranch(branchId);
        location = branch?.location ?? null;
        this.logger.log(`Branch location determined: ${location}`);
      }

      if (!location) {
        this.logger.warn(`No branch location for orderId=${orderId}`);
        throw new RpcException({
          statusCode: 404,
          message: `Order with ID ${order.id} has no branch.`,
        });
      }

      if (order.status !== 'DROPPED_OFF') {
        this.logger.warn(
          `Order status invalid for validation: ${order.status}`,
        );
        throw new RpcException({
          statusCode: 400,
          message: `Order with Tracking code ['${order.trackingCode}'] cannot be validated. It is already validated or not collected.`,
        });
      }

      const result = await this.orderRepo.validateOrder(
        orderId,
        userId,
        location,
        data,
      );
      this.logger.log(`Order validated successfully: orderId=${orderId}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to validate order ${orderId}: ${error.message}`,
      );
      throw handleCatch(error);
    }
  }

  async markUnusualOrder(orderId: string, data: any) {
    this.logger.log(`Mark unusual order requested for orderId=${orderId}`);

    try {
      const order = await this.orderRepo.getOrderById(orderId);
      if (!order) {
        this.logger.warn(`Order not found: ${orderId}`);
        throw new RpcException({
          statusCode: 404,
          message: `Order with ID ${orderId} not found.`,
        });
      }

      const result = await this.orderRepo.markUnusualOrder(orderId, data);
      this.logger.log(
        `Order marked as unusual successfully: orderId=${orderId}`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to mark unusual order ${orderId}: ${error.message}`,
      );
      throw handleCatch(error);
    }
  }

  async approveOrder(orderId: string, reason: string, userId: string) {
    this.logger.log(
      `Approve order requested for orderId=${orderId} by userId=${userId}`,
    );

    try {
      const order = await this.orderRepo.getOrderById(orderId);
      if (!order) {
        this.logger.warn(`Order not found: ${orderId}`);
        throw new RpcException({
          statusCode: 404,
          message: `Order with ID ${orderId} not found.`,
        });
      }

      if (order.status !== 'PENDING_APPROVAL') {
        this.logger.warn(`Order status invalid for approval: ${order.status}`);
        throw new RpcException({
          statusCode: 400,
          message: `Order with Tracking code ['${order.trackingCode}'] cannot be approved. It may not be validated or already approved.`,
        });
      }

      const location = order.branchId;

      const result = await this.orderRepo.approveOrder(
        order,
        reason,
        location,
        userId,
      );
      this.logger.log(`Order approved successfully: orderId=${orderId}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to approve order ${orderId}: ${error.message}`);
      throw handleCatch(error);
    }
  }

  async getAllOrders(query: ListQueryDto) {
    this.logger.log(`Fetching all orders with query: ${JSON.stringify(query)}`);

    try {
      const result = await this.orderRepo.getAllOrders(query);
      this.logger.log(`Fetched ${result.pagination.total} orders successfully`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to fetch orders: ${error.message}`);
      throw handleCatch(error);
    }
  }

  async getOrderById(id: string): Promise<any> {
    this.logger.log(`Fetching order by ID: ${id}`);
    try {
      const order = await this.orderRepo.getOrderById(id);
      if (!order) {
        this.logger.warn(`Order not found: ${id}`);
        throw new RpcException({
          statusCode: 404,
          message: `Order with ID ${id} not found.`,
        });
      }
      this.logger.log(`Order fetched successfully: ${id}`);
      return order;
    } catch (error) {
      this.logger.error(`Failed to fetch order ${id}: ${error.message}`);
      throw handleCatch(error);
    }
  }

  async getException(query: ListQueryDto) {
    this.logger.log(`Fetching exceptions with query: ${JSON.stringify(query)}`);
    try {
      const exceptions = await this.orderRepo.getException(query);
      this.logger.log(
        `Fetched ${exceptions.pagination.total} exceptions successfully`,
      );
      return exceptions;
    } catch (error) {
      this.logger.error(`Failed to fetch exceptions: ${error.message}`);
      throw handleCatch(error);
    }
  }

  async updateOrder(
    orderId: string,
    data: UpdateOrderDto,
    userId: string,
  ): Promise<any> {
    this.logger.log(`Updating order ${orderId} by user ${userId}`);
    try {
      const order = await this.orderRepo.getOrderById(orderId);
      if (!order) {
        this.logger.warn(`Order not found: ${orderId}`);
        throw new RpcException({
          statusCode: 404,
          message: `Order with ID ${orderId} not found.`,
        });
      }

      const updatedOrder = await this.orderRepo.updateOrder(
        orderId,
        data,
        userId,
      );
      this.logger.log(`Order updated successfully: ${orderId}`);
      return updatedOrder;
    } catch (error) {
      this.logger.error(`Failed to update order ${orderId}: ${error.message}`);
      throw handleCatch(error);
    }
  }

  deleteOrder(id: string): Promise<any> {
    throw new Error('Method not implemented.');
  }

  async trackOrder(code: string): Promise<any> {
    this.logger.log(`Tracking order with code: ${code}`);
    try {
      const order = await this.orderRepo.getOrderByTrackingCode(code);
      if (!order) {
        this.logger.warn(`Order not found for code: ${code}`);
        throw new RpcException({
          statusCode: 404,
          message: `Order with tracking code ${code} not found`,
        });
      }

      const tracking = await this.orderRepo.trackOrder(order.id);
      if (!tracking) {
        this.logger.warn(`Tracking info not found for order code: ${code}`);
        throw new RpcException({
          statusCode: 404,
          message: `Order with tracking code ${code} does not have tracking info`,
        });
      }

      this.logger.log(`Order tracking fetched successfully for code: ${code}`);
      return { order, tracking };
    } catch (error) {
      this.logger.error(`Failed to track order ${code}: ${error.message}`);
      throw handleCatch(error);
    }
  }

  async trackUserOrder(code: string, userId: string): Promise<any> {
    this.logger.log(
      `Tracking user order with code: ${code}, userId: ${userId}`,
    );
    try {
      const order = await this.orderRepo.getOrderByTrackingCode(code, userId);
      if (!order) {
        this.logger.warn(
          `User order not found for code: ${code}, userId: ${userId}`,
        );
        throw new RpcException({
          statusCode: 404,
          message: `Order with tracking code ${code} not found`,
        });
      }

      const tracking = await this.orderRepo.trackOrder(order.id);
      if (!tracking) {
        this.logger.warn(`Tracking info not found for order code: ${code}`);
        throw new RpcException({
          statusCode: 404,
          message: `Order with tracking code ${code} does not have tracking info`,
        });
      }

      this.logger.log(
        `User order tracking fetched successfully for code: ${code}`,
      );
      return { order, tracking };
    } catch (error) {
      this.logger.error(`Failed to track user order ${code}: ${error.message}`);
      throw handleCatch(error);
    }
  }

  async getOrdersGroupedByScope(query: ListQueryDto) {
    this.logger.log('Fetching orders grouped by shipping scope');
    try {
      const result = await this.orderRepo.getOrdersGroupedByScope(query);

      const grouped: Record<ShippingScope, Record<ServiceType, any[]>> = {
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
    } catch (error) {
      this.logger.error(`Failed to fetch grouped orders: ${error.message}`);
      throw handleCatch(error);
    }
  }

  async getOrderStatusLog(query: ListQueryDto) {
    this.logger.log('Fetching order status logs');
    try {
      const result = await this.orderRepo.getOrderStatusLog(query);

      const ordersLogGrouped = Object.entries(
        result.orders.reduce(
          (acc, log) => {
            if (!acc[log.orderId]) acc[log.orderId] = [];
            acc[log.orderId].push(log);
            return acc;
          },
          {} as Record<string, OrderTracking[]>,
        ),
      ).map(([orderId, logs]) => ({ id: orderId, logs }));

      this.logger.log('Order status logs fetched successfully');
      return { orders: ordersLogGrouped, pagination: result.pagination };
    } catch (error) {
      this.logger.error(`Failed to fetch order status logs: ${error.message}`);
      throw handleCatch(error);
    }
  }

  async getPendingApproval(query: ListQueryDto) {
    this.logger.log('Fetching orders pending approval');
    try {
      const result = await this.orderRepo.getPendingApprovals(query);
      this.logger.log('Pending approval orders fetched successfully');
      return result;
    } catch (error) {
      this.logger.error(`Failed to fetch pending approvals: ${error.message}`);
      throw handleCatch(error);
    }
  }

  async cancelOrder(data: CancelOrderDto, userId: string): Promise<any> {
    const { orderId, reason } = data;
    this.logger.log(`Cancelling order ${orderId} by user ${userId}`);
    try {
      const result = await this.orderRepo.cancelOrder(orderId, reason, userId);
      this.logger.log(`Order ${orderId} cancelled successfully`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to cancel order ${orderId}: ${error.message}`);
      throw handleCatch(error);
    }
  }

  async addException(data: AddException, userId: string): Promise<any> {
    const { orderId, reason, type } = data;
    this.logger.log(`Adding exception to order ${orderId} by user ${userId}`);
    try {
      const order = await this.orderRepo.getOrderById(orderId);
      if (!order) {
        this.logger.warn(`Order not found: ${orderId}`);
        throw new RpcException({
          statusCode: 404,
          message: `Order with id ${orderId} not found`,
        });
      }

      const exception = await this.orderRepo.addException(
        orderId,
        reason,
        type,
        userId,
      );
      if (!exception) {
        this.logger.warn(`Failed to add exception for order: ${orderId}`);
        throw new RpcException({
          statusCode: 500,
          message: `Could not add exception for order ${orderId}`,
        });
      }

      this.logger.log(`Exception added successfully for order ${orderId}`);
      return exception;
    } catch (error) {
      this.logger.error(
        `Add exception failed for order ${orderId}: ${error.message}`,
      );
      throw handleCatch(error);
    }
  }

  async updateOrderDistance(orderId: string, distance: number) {
    this.logger.log(`Updating distance for order ${orderId} to ${distance}km`);
    try {
      const result = await this.orderRepo.updateOrderDistance(
        orderId,
        distance,
      );
      this.logger.log(`Distance updated successfully for order ${orderId}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Update distance failed for order ${orderId}: ${error.message}`,
      );
      throw handleCatch(error);
    }
  }

  // Local method for tracking code generation
  private generateTrackingCode(username: string): string {
    if (!username || username.length !== 3) {
      this.logger.error('Username for tracking code must be exactly 3 letters');
      throw new Error('Username must be exactly 3 letters');
    }

    let trackingCode: string;
    const usedCodes = new Set<string>();
    do {
      const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
      const randomSuffix = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, '0'); // 3-digit random
      trackingCode = `${username.toUpperCase()}-${timestamp}-${randomSuffix}`;
    } while (usedCodes.has(trackingCode));

    usedCodes.add(trackingCode);
    this.logger.verbose(`Generated tracking code: ${trackingCode}`);
    return trackingCode;
  }

  async getMyOrders(userId: string, query: ListQueryDto) {
    this.logger.log(`Fetching orders for user ${userId}`);
    try {
      const orders = await this.orderRepo.getMyOrders(userId, query);
      this.logger.log(
        `Fetched ${orders?.pagination?.total || 0} orders for user ${userId}`,
      );
      return orders;
    } catch (error) {
      this.logger.error(
        `Fetching orders failed for user ${userId}: ${error.message}`,
      );
      throw handleCatch(error);
    }
  }
}
