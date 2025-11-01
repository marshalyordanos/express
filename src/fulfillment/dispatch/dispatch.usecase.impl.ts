import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DispatchUseCases } from './dispatch.usecase';
import { DispatchRepository } from './dispatch.repository';
import {
  AssignDriverForPickup,
  AssignOfficerForBatch,
  BatchDispatchDto,
  BatchHandoverDto,
  CompleteDeliveryDto,
  ConfirmBatchHandoverDto,
  CreateDriver,
} from './dispatch.entity';
import { RpcException } from '@nestjs/microservices';
import { ShippingScope, ServiceType } from '@prisma/client';
import { IResponse } from '../../common/types';
import {
  generateOrderQRCode,
  decodeAndValidateQRCode,
  OrderQRCodeData,
} from '../utils/qr-code.helper';
import { PrismaService } from '../../prisma/prisma.service';
import { ListQueryDto } from '../../common/query/query.dto';
import { handleCatch } from '../../common/handleCatch';
import { AppLogger } from '../../common/app-logger.service';
import { podUploader } from '../../common/cloudinary/cloudinary.storage';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class DispatchUseCasesImpl implements DispatchUseCases {
  constructor(
    private readonly dispatchRepo: DispatchRepository,
    private readonly qrCodeService: PrismaService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext('FulfillmentService', 'DispatchUseCaseImpl');
  }

  async assignDriverForPickup(
    data: AssignDriverForPickup,
    userId: string,
  ): Promise<any> {
    this.logger.log(
      `Assign driver request received for order ${data.orderId} by user ${userId}`,
    );

    try {
      // Step 1: Validate driver existence
      const driver = await this.dispatchRepo.findDriverById(data.driverId);
      if (!driver) {
        this.logger.warn(`Driver not found: ${data.driverId}`);
        throw new RpcException({
          statusCode: 404,
          message: `Driver with ID ${data.driverId} not found.`,
        });
      }

      this.logger.debug(
        `Driver found: ${driver.user?.name ?? 'N/A'} (ID: ${driver.id})`,
      );

      // Step 2: Validate order existence
      const order = await this.dispatchRepo.findOrderById(data.orderId);
      if (!order) {
        this.logger.warn(`Order not found: ${data.orderId}`);
        throw new RpcException({
          statusCode: 404,
          message: `Order with ID ${data.orderId} not found.`,
        });
      }

      this.logger.debug(`Order found: ID ${order.id}, Status ${order.status}`);

      // Step 3: Ensure order not already assigned
      if (order.pickupDriverId) {
        this.logger.warn(
          `Order ${order.id} already assigned to driver ID ${order.pickupDriverId}`,
        );
        throw new RpcException({
          statusCode: 400,
          message: `Order with ID ${data.orderId} is already assigned to another driver.`,
        });
      }

      // Step 4: Check order status
      if (order.status !== 'CREATED') {
        let message = `Order ${order.id} not eligible for assignment (Status: ${order.status})`;

        if (order.status === 'ASSIGNED') {
          message = `Order ${order.id} already assigned, driver en route.`;
        }

        this.logger.warn(message);
        throw new RpcException({
          statusCode: 400,
          message,
        });
      }

      // Step 5: Validate pickup date
      if (!order.pickupDate) {
        this.logger.warn(`Order ${order.id} missing pickup date`);
        throw new RpcException({
          statusCode: 400,
          message: `Order with ID ${data.orderId} does not have a scheduled pickup date.`,
        });
      }

      const now = new Date();
      const pickupDate = new Date(order.pickupDate);

      if (pickupDate < new Date(now.setHours(0, 0, 0, 0))) {
        this.logger.warn(
          `Invalid pickup date for order ${order.id}: ${pickupDate.toISOString()}`,
        );
        throw new RpcException({
          statusCode: 400,
          message: `Order with ID ${data.orderId} has an invalid pickup date (${pickupDate.toISOString()}). Pickup date cannot be in the past.`,
        });
      }

      // Step 6: Assign driver
      this.logger.log(`Assigning driver ${driver.id} to order ${order.id}`);
      const updatedOrder = await this.dispatchRepo.assignDriverForPickup(
        data.driverId,
        order.id,
        userId,
      );

      this.logger.verbose(
        `Driver ${driver.user?.name ?? driver.id} successfully assigned to order ${order.id}`,
      );

      return {
        statusCode: 200,
        message: `Driver ${driver.user.name} (ID: ${driver.user.id}) successfully assigned to order ${order.id}.`,
        data: updatedOrder,
      };
      // {updatedOrder}
    } catch (error) {
      // Step 7: Catch and log errors
      this.logger.error(
        `Failed to assign driver for order ${data.orderId}: ${error.message}`,
        // error.stack,
      );
      throw handleCatch(error);
    }
  }
  async confirmDispatch(
    data: AssignOfficerForBatch,
    userId: string,
  ): Promise<any> {
    this.logger.log(
      `Confirm dispatch request received for officer ${data.officerId}`,
    );

    try {
      // 1. Check if Officer exists
      const officer = await this.dispatchRepo.findUserById(data.officerId);
      if (!officer) {
        this.logger.warn(`Officer with ID ${data.officerId} not found`);
        throw new NotFoundException(
          `Officer with ID ${data.officerId} not found`,
        );
      }

      this.logger.debug(`Officer found: ${officer.name ?? officer.id}`);

      // 2. Check that all batch IDs exist
      const batches = await this.dispatchRepo.findBatches(data.batchId, userId);

      if (batches.length !== data.batchId.length) {
        const foundIds = batches.map((b) => b.id);
        const missing = data.batchId.filter((id) => !foundIds.includes(id));
        this.logger.warn(`Missing batch IDs: ${missing.join(', ')}`);

        throw new NotFoundException(
          `Batch IDs not found: ${missing.join(', ')}`,
        );
      }

      this.logger.debug(
        `All ${batches.length} batches found for officer ${officer.name ?? officer.id}`,
      );

      // 3. Assign Officer to the batches
      this.logger.log(
        `Assigning officer ${officer.name ?? officer.id} to batches: ${data.batchId.join(', ')}`,
      );

      const result = await this.dispatchRepo.confirmDispatch(
        data.batchId,
        data.officerId,
      );

      this.logger.verbose(
        `Officer ${officer.name ?? officer.id} successfully assigned to ${data.batchId.length} batches.`,
      );

      return {
        success: true,
        message: `Batches are ready for delivering to the airport or assigned to the cargo officer.`,
        result,
      };
    } catch (error) {
      this.logger.error(
        `Failed to confirm dispatch for officer ${data.officerId}: ${error.message}`,
        error.stack,
      );
      throw handleCatch(error);
    }
  }

  async collectBatchByCargoOfficer(
    data: AssignOfficerForBatch,
    userId: string,
  ): Promise<any> {
    this.logger.log(
      `Collect batch request initiated by user ${userId} for officer ${data.officerId}`,
    );

    try {
      // Step 1: Authorization check
      if (userId !== data.officerId) {
        this.logger.warn(
          `Unauthorized attempt: user ${userId} tried to collect batches for officer ${data.officerId}`,
        );
        throw new RpcException({
          statusCode: 403,
          message: 'You are not authorized to do this action.',
        });
      }

      // Step 2: Officer validation
      const officer = await this.dispatchRepo.findUserById(data.officerId);
      if (!officer) {
        this.logger.warn(`Officer not found: ${data.officerId}`);
        throw new RpcException({
          statusCode: 404,
          message: `Officer with ID ${data.officerId} not found.`,
        });
      }

      this.logger.debug(`Officer found: ${officer.name ?? officer.id}`);

      // Step 3: Validate batch existence
      const batches = await this.dispatchRepo.findBatches(data.batchId, userId);

      if (batches.length !== data.batchId.length) {
        const foundIds = batches.map((b) => b.id);
        const missing = data.batchId.filter((id) => !foundIds.includes(id));

        this.logger.warn(
          `Some batch IDs not found for officer ${officer.id}: ${missing.join(', ')}`,
        );

        throw new NotFoundException(
          `Batch IDs not found: ${missing.join(', ')}`,
        );
      }

      this.logger.debug(
        `All batches validated for collection: ${batches.map((b) => b.id).join(', ')}`,
      );

      // Step 4: Assign collection
      this.logger.log(
        `Officer ${officer.name ?? officer.id} collecting ${batches.length} batches.`,
      );

      const result = await this.dispatchRepo.collectBatchByCargoOfficer(
        batches.map((b) => b.id),
        officer.id,
      );

      this.logger.verbose(
        `Officer ${officer.name ?? officer.id} successfully collected all assigned batches.`,
      );

      return {
        success: true,
        message: `Batches are collected by the cargo officer.`,
        result,
      };
    } catch (error) {
      // Step 5: Error logging
      this.logger.error(
        `Failed to collect batches for officer ${data.officerId}: ${error.message}`,
        error.stack,
      );
      throw handleCatch(error);
    }
  }
  async deliverBatchToAirport(
    data: BatchHandoverDto,
    userId: string,
  ): Promise<any> {
    this.logger.log(
      `Deliver batch request received from officer ${data.handedById} for ${data.batchIds.length} batches.`,
    );

    try {
      // Step 1: Fetch batches
      const batches = await this.dispatchRepo.findBatches(
        data.batchIds,
        userId,
      );
      this.logger.debug(`Fetched ${batches.length} batches from DB.`);

      // Step 2: Check missing batch IDs
      if (batches.length !== data.batchIds.length) {
        const foundIds = batches.map((b) => b.id);
        const missing = data.batchIds.filter((id) => !foundIds.includes(id));

        this.logger.warn(`Missing batch IDs: ${missing.join(', ')}`);
        throw new NotFoundException(
          `Batch IDs not found: ${missing.join(', ')}`,
        );
      }

      // Step 3: Validate batch status
      const invalidStatusBatches = batches.filter(
        (b) => b.status !== 'READY' && b.status !== 'COLLECTED',
      );

      if (invalidStatusBatches.length > 0) {
        const ids = invalidStatusBatches.map((b) => b.id);
        this.logger.warn(
          `Invalid batch status for delivery. Not eligible batches: ${ids.join(', ')}`,
        );
        throw new BadRequestException(
          `The following batches cannot be delivered to the airport due to invalid status: ${ids.join(', ')}`,
        );
      }

      this.logger.debug(`All batch statuses validated for delivery.`);

      // Step 4: Validate officer
      const officer = await this.dispatchRepo.findUserById(data.handedById);
      if (!officer) {
        this.logger.warn(`Officer with ID ${data.handedById} not found.`);
        throw new RpcException({
          statusCode: 404,
          message: `Officer with ID ${data.handedById} not found.`,
        });
      }

      this.logger.debug(`Officer validated: ${officer.name ?? officer.id}`);

      // Step 5: Perform transaction
      this.logger.log(
        `Performing handover to airport by officer ${officer.id} for batches: ${data.batchIds.join(', ')}`,
      );

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

      this.logger.verbose(
        `Successfully handed over ${batches.length} batches to the airport by officer ${officer.name ?? officer.id}.`,
      );

      return {
        success: true,
        message: `Batches are successfully delivered to the airport.`,
        result,
      };
    } catch (error) {
      this.logger.error(
        `Failed to deliver batches to airport by officer ${data.handedById}: ${error.message}`,
        error.stack,
      );
      throw handleCatch(error);
    }
  }

  async assignDriverForDelivery(data: AssignDriverForPickup): Promise<any> {
    this.logger.log(
      `Assign driver for delivery request received for order ${data.orderId}`,
    );
    try {
      const result = await this.dispatchRepo.assignDriverForDelivery(data);
      this.logger.verbose(
        `Driver ${data.driverId} successfully assigned for delivery (order: ${data.orderId}).`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to assign driver ${data.driverId} for delivery (order: ${data.orderId}): ${error.message}`,
        error.stack,
      );
      throw handleCatch(error);
    }
  }

  async assignDriverToOrder(
    data: AssignDriverForPickup,
    userId: string,
  ): Promise<any> {
    const { orderId, driverId } = data;
    this.logger.log(
      `Assign driver-to-order request received. Order: ${orderId}, Driver: ${driverId}, Requested by: ${userId}`,
    );

    try {
      // 1. Find order
      const order = await this.dispatchRepo.findOrderById(orderId);
      if (!order) {
        this.logger.warn(`Order not found: ${orderId}`);
        throw new RpcException({
          statusCode: 404,
          message: `Order with ID ${orderId} not found.`,
        });
      }

      this.logger.debug(`Order found: ID ${order.id}, status ${order.status}`);

      // 2. Validate order eligibility
      if (order.status === 'ASSIGNED') {
        this.logger.warn(
          `Order ${orderId} already assigned to another driver or not eligible. Current status: ${order.status}`,
        );
        throw new RpcException({
          statusCode: 400,
          message: `Order with ID ${orderId} is not eligible for driver assignment or already assigned to another driver. Current status: ${order.status}.`,
        });
      }

      // 3. Check if already has a driver
      if (order.deliveryDriverId && order.deliveryDriverId !== driverId) {
        this.logger.warn(
          `Order ${orderId} already assigned to driver ${order.deliveryDriverId}, cannot reassign to ${driverId}`,
        );
        throw new RpcException({
          statusCode: 400,
          message: `Order with ID ${orderId} is already assigned to another driver.`,
        });
      }

      // 4. Validate driver existence
      const driver = await this.dispatchRepo.findUserById(driverId);
      if (!driver) {
        this.logger.warn(`Driver not found: ${driverId}`);
        throw new RpcException({
          statusCode: 404,
          message: `Driver with ID ${driverId} not found.`,
        });
      }

      this.logger.debug(`Driver validated: ${driver.name ?? driver.id}`);

      // 5. Assign order
      this.logger.log(`Assigning driver ${driverId} to order ${orderId}`);
      const result = await this.dispatchRepo.assignOrder(
        orderId,
        driverId,
        userId,
      );

      this.logger.verbose(
        `Driver ${driver.name ?? driverId} successfully assigned to order ${orderId}`,
      );

      return { success: true, message: 'Driver assigned for delivery', result };
    } catch (error) {
      this.logger.error(
        `Failed to assign driver ${driverId} to order ${data.orderId}: ${error.message}`,
        error.stack,
      );
      throw handleCatch(error);
    }
  }

  async lastMileDelivery(
    orderId: string,
    driverId: string,
    userId: string,
    notes?: string,
  ) {
    this.logger.log(
      `Last mile delivery request received. Order: ${orderId}, Driver: ${driverId}, Requested by: ${userId}`,
    );

    try {
      // 1. Authorization check
      if (userId !== driverId) {
        this.logger.warn(
          `Unauthorized last-mile attempt by user ${userId} for driver ${driverId}`,
        );
        throw new RpcException({
          statusCode: 403,
          message: 'You are not authorized to do this action.',
        });
      }

      // 2. Validate order existence
      const order = await this.dispatchRepo.findOrderById(orderId);
      if (!order) {
        this.logger.warn(`Order not found: ${orderId}`);
        throw new RpcException({
          statusCode: 404,
          message: `Order with ID ${orderId} not found.`,
        });
      }

      this.logger.debug(`Order found: ${order.id}, status: ${order.status}`);

      // 3. Check driver assignment
      if (order.deliveryDriverId !== driverId) {
        this.logger.warn(
          `Driver mismatch for order ${orderId}. Assigned: ${order.deliveryDriverId}, Attempted: ${driverId}`,
        );
        throw new RpcException({
          statusCode: 403,
          message: `Order with ID ${orderId} is not assigned to this driver.`,
        });
      }

      // 4. Check eligibility (status)
      if (order.status !== 'ASSIGNED') {
        this.logger.warn(
          `Order ${orderId} not eligible for last mile delivery. Current status: ${order.status}`,
        );
        throw new RpcException({
          statusCode: 400,
          message: `Order with ID ${orderId} is not eligible for last mile delivery. Current status: ${order.status}.`,
        });
      }

      // 5. Perform last mile delivery
      this.logger.log(`Processing last mile delivery for order ${orderId}`);
      const result = await this.dispatchRepo.lastMileDelivery(
        orderId,
        driverId,
        notes,
      );

      this.logger.verbose(
        `Driver ${driverId} successfully started last mile delivery for order ${orderId}`,
      );

      return {
        success: true,
        message: 'Order picked up for last mile delivery by driver',
        result,
      };
    } catch (error) {
      this.logger.error(
        `Failed last mile delivery for order ${orderId} by driver ${driverId}: ${error.message}`,
        error.stack,
      );
      throw handleCatch(error);
    }
  }

  // async completeDelivery(
  //   orderId: string,
  //   driverId: string,
  //   userId: string,
  //   notes?: string,
  //   podImages?: string[],
  // ) {
  //   this.logger.log(
  //     `Delivery completion request received. Order: ${orderId}, Driver: ${driverId}, Requested by: ${userId}`,
  //   );

  //   try {
  //     // 0. verify POD image is provided

  //       const savedPodImages = [];

  //     // 1. Authorization
  //     if (userId !== driverId) {
  //       this.logger.warn(
  //         `Unauthorized delivery completion attempt by user ${userId} for driver ${driverId}`,
  //       );
  //       throw new RpcException({
  //         statusCode: 403,
  //         message: 'You are not authorized to do this action.',
  //       });
  //     }

  //     // 2. Fetch order
  //     const order = await this.dispatchRepo.findOrderById(orderId);
  //     if (!order) {
  //       this.logger.warn(`Order not found for delivery completion: ${orderId}`);
  //       throw new RpcException({
  //         statusCode: 404,
  //         message: `Order with ID ${orderId} not found.`,
  //       });
  //     }

  //     this.logger.debug(`Order ${order.id} found with status: ${order.status}`);

  //     // 3. Verify assigned driver
  //     if (order.deliveryDriverId !== driverId) {
  //       this.logger.warn(
  //         `Driver mismatch for order ${orderId}. Assigned: ${order.deliveryDriverId}, Attempted: ${driverId}`,
  //       );
  //       throw new RpcException({
  //         statusCode: 403,
  //         message: `Order with ID ${orderId} is not assigned to this driver.`,
  //       });
  //     }

  //     // 4. Verify order status
  //     if (order.status !== 'OUT_FOR_DELIVERY') {
  //       this.logger.warn(
  //         `Order ${orderId} not eligible for completion. Current status: ${order.status}`,
  //       );
  //       throw new RpcException({
  //         statusCode: 400,
  //         message: `Order with ID ${orderId} is not eligible for delivery and it is not out for delivery. Current status: ${order.status}.`,
  //       });
  //     }

  //     // 5. Complete delivery
  //     this.logger.log(
  //       `Completing delivery for order ${orderId} by driver ${driverId}`,
  //     );
  //     const result = await this.dispatchRepo.deliverOrder(
  //       orderId,
  //       driverId,
  //       notes,
  //     );

  //     this.logger.verbose(
  //       `Driver ${driverId} successfully completed delivery for order ${orderId}`,
  //     );

  //     return {
  //       success: true,
  //       message: 'Order delivered to customer.',
  //       result,
  //     };
  //   } catch (error) {
  //     this.logger.error(
  //       `Delivery completion failed for order ${orderId} by driver ${driverId}: ${error.message}`,
  //       error.stack,
  //     );
  //     throw handleCatch(error);
  //   }
  // }


   /**
   * Complete delivery for an order
   * @param dto CompleteDeliveryDto
   * @param files Optional POD images from frontend (express file array)
   */
  // async completeDelivery(
  //   dto: CompleteDeliveryDto,
  //   userId: string,
  //    files?: string[],
  // ) {

  //     const { orderId, driverId, notes, podImages } = dto;
  //   this.logger.log(
  //     `Delivery completion request received. Order: ${dto.orderId}, Driver: ${dto.driverId}, Requested by: ${userId}`,
  //   );

  //   // 0️⃣ Authorization check
  //   if (userId !== dto.driverId) {
  //       this.logger.warn(
  //         `Unauthorized delivery completion attempt by user ${userId} for driver ${dto.driverId}`,
  //       );
  //       throw new RpcException({
  //         statusCode: 403,
  //         message: 'You are not authorized to do this action.',
  //       });
  //     }

  //   // 1️⃣ Upload images to Cloudinary if any
  //   let uploadedImages: {
  //     url: string;
  //     publicId: string;
  //     fileName: string;
  //     fileType: string;
  //   }[] = [];

  //   try {
  //     if (files && files.length > 0) {
  //       for (const file of files) {
  //         const result = await cloudinary.uploader.upload_stream({
  //           folder: 'pod_images',
  //           resource_type: 'image',
  //           format: 'png', // or leave dynamic
  //         }, (error, res) => {
  //           if (error) throw error;
  //           return res;
  //         });

  //         // Because upload_stream needs a buffer, we wrap in Promise
  //         const uploaded = await new Promise<{
  //           url: string;
  //           publicId: string;
  //           fileName: string;
  //           fileType: string;
  //         }>((resolve, reject) => {
  //           const stream = cloudinary.uploader.upload_stream(
  //             { folder: 'pod_images' },
  //             (err, res) => {
  //               if (err) return reject(err);
  //               resolve({
  //                 url: res.secure_url,
  //                 publicId: res.public_id,
  //                 fileName: file.originalname,
  //                 fileType: file.mimetype,
  //               });
  //             },
  //           );
  //           stream.end(file.buffer);
  //         });
  //         uploadedImages.push(uploaded);
  //       }
  //     }

  //           // 2. Fetch order
  //     const order = await this.dispatchRepo.findOrderById(dto.orderId);
  //     if (!order) {
  //       this.logger.warn(`Order not found for delivery completion: ${dto.orderId}`);
  //       throw new RpcException({
  //         statusCode: 404,
  //         message: `Order with ID ${dto.orderId} not found.`,
  //       });
  //     }

  //     this.logger.debug(`Order ${order.id} found with status: ${order.status}`);

  //     // 3. Verify assigned driver
  //     if (order.deliveryDriverId !== dto.driverId) {
  //       this.logger.warn(
  //         `Driver mismatch for order ${dto.orderId}. Assigned: ${order.deliveryDriverId}, Attempted: ${dto.driverId}`,
  //       );
  //       throw new RpcException({
  //         statusCode: 403,
  //         message: `Order with ID ${dto.orderId} is not assigned to this driver.`,
  //       });
  //     }

  //     // 4. Verify order status
  //     if (order.status !== 'OUT_FOR_DELIVERY') {
  //       this.logger.warn(
  //         `Order ${dto.orderId} not eligible for completion. Current status: ${order.status}`,
  //       );
  //       throw new RpcException({
  //         statusCode: 400,
  //         message: `Order with ID ${dto.orderId} is not eligible for delivery and it is not out for delivery. Current status: ${order.status}.`,
  //       });
  //     }
  //     // 2️⃣ Call repository to mark order as delivered + save POD images
  //        this.logger.log(
  //       `Completing delivery for order ${dto.orderId} by driver ${dto.driverId}`,
  //     );
  //     const result = await this.dispatchRepo.deliverOrder(
  //       dto.orderId,
  //       dto.driverId,
  //       dto.notes,
  //       uploadedImages,
  //     );

  //     this.logger.log(
  //       `Order ${dto.orderId} delivered successfully by driver ${dto.driverId}`,
  //     );

  //     return {
  //       success: true,
  //       message: 'Order delivered successfully.',
  //       data: result,
  //     };
  //   } catch (err) {
  //     // 3️⃣ Rollback uploaded images if transaction failed
  //     if (uploadedImages.length > 0) {
  //       for (const img of uploadedImages) {
  //         try {
  //           await cloudinary.uploader.destroy(img.publicId);
  //         } catch (e) {
  //           this.logger.error(`Failed to delete Cloudinary image ${img.publicId}: ${e.message}`);
  //         }
  //       }
  //     }

  //     this.logger.error(
  //       `Delivery completion failed for order ${dto.orderId}: ${err.message}`,
  //       err.stack,
  //     );
  //     throw err instanceof RpcException ? err : new RpcException({
  //       statusCode: 500,
  //       message: 'Failed to complete delivery.',
  //     });
  //   }
  // }

  async completeDelivery(dto: CompleteDeliveryDto, userId: string) {
    const { orderId, driverId, notes, podImages } = dto;
    this.logger.log(`Completing delivery for order ${orderId} by driver ${driverId}`);

    if (userId !== driverId) {
      throw new RpcException('Unauthorized action');
    }

    try {
      return await this.dispatchRepo.deliverOrderWithPodImages(
        orderId,
        driverId,
        notes,
        podImages,
      );
    } catch (err) {
      this.logger.error(`Delivery failed: ${err.message}`);
      throw err;
    }
  }

  async removeDriverFromOrder(orderId: string): Promise<any> {
    this.logger.log(`Request to remove driver from order ${orderId}`);

    try {
      // 1. Fetch order
      const order = await this.dispatchRepo.findOrderById(orderId);
      if (!order) {
        this.logger.warn(`Order not found: ${orderId}`);
        throw new RpcException({
          statusCode: 404,
          message: `Order with ID ${orderId} not found.`,
        });
      }

      // 2. Validate driver assignment
      if (!order.deliveryDriverId) {
        this.logger.warn(`Order ${orderId} is not assigned to any driver.`);
        throw new RpcException({
          statusCode: 404,
          message: `Order with ID ${orderId} is not assigned to any driver.`,
        });
      }

      // 3. Optional: validate order status
      // Prevent removal if the order is already delivered or out for delivery
      if (['OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status)) {
        this.logger.warn(
          `Cannot remove driver from order ${orderId} because its status is ${order.status}`,
        );
        throw new RpcException({
          statusCode: 400,
          message: `Cannot remove driver. Order is already ${order.status}.`,
        });
      }

      // 4. Proceed with removal
      const result = await this.dispatchRepo.removeDriverFromOrder(orderId);
      this.logger.verbose(`Driver removed successfully from order ${orderId}`);

      return {
        success: true,
        message: `Driver removed successfully from order ${orderId}.`,
        result,
      };
    } catch (error) {
      this.logger.error(
        `Failed to remove driver from order ${orderId}: ${error.message}`,
        error.stack,
      );
      throw handleCatch(error);
    }
  }
  async changeDriverForOrder(data: AssignDriverForPickup): Promise<any> {
    const { orderId, driverId } = data;
    this.logger.log(
      `Request received to change driver for order ${orderId} to driver ${driverId}`,
    );

    try {
      // 1. Find the order
      const order = await this.dispatchRepo.findOrderById(orderId);
      if (!order) {
        this.logger.warn(`Order not found: ${orderId}`);
        throw new RpcException({
          statusCode: 404,
          message: `Order with ID ${orderId} not found.`,
        });
      }

      // 2. Check if order has a driver assigned
      if (!order.deliveryDriverId) {
        this.logger.warn(`Order ${orderId} currently has no assigned driver.`);
        throw new RpcException({
          statusCode: 404,
          message: `Order with ID ${orderId} has no assigned driver.`,
        });
      }

      // 3. Prevent reassignment if order is already delivered or out for delivery
      if (['OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status)) {
        this.logger.warn(
          `Cannot change driver for order ${orderId} because status is ${order.status}`,
        );
        throw new RpcException({
          statusCode: 400,
          message: `Cannot change driver. Order ${orderId} is already ${order.status}.`,
        });
      }

      // 4. Check new driver existence
      const driver = await this.dispatchRepo.findUserById(driverId);
      if (!driver) {
        this.logger.warn(`Driver not found: ${driverId}`);
        throw new RpcException({
          statusCode: 404,
          message: `Driver with ID ${driverId} not found.`,
        });
      }

      // 5. Proceed to change driver
      const result = await this.dispatchRepo.changeDriverForOrder(
        orderId,
        driverId,
      );
      this.logger.verbose(
        `Driver for order ${orderId} changed successfully to driver ${driverId}`,
      );

      return {
        success: true,
        message: `Driver for order ${orderId} changed successfully to driver ${driver.name} (ID: ${driver.id}).`,
        result,
      };
    } catch (error) {
      this.logger.error(
        `Failed to change driver for order ${data.orderId}: ${error.message}`,
        error.stack,
      );
      throw handleCatch(error);
    }
  }

  async createBatchDispatch(dto: BatchDispatchDto, userId: string) {
    this.logger.log(
      `Received request to create batch dispatch by user ${userId}`,
    );
    this.logger.debug(`Payload received: ${JSON.stringify(dto)}`);

    try {
      // 1. Fetch all orders from DB
      this.logger.verbose(`Fetching orders by IDs: ${dto.orders.join(', ')}`);
      const orders = await this.dispatchRepo.findOrdersByIds(dto.orders);

      // 2. Check which IDs were not found
      const foundIds = orders.map((o) => o.id);
      const notFoundIds = dto.orders.filter((id) => !foundIds.includes(id));

      if (notFoundIds.length > 0) {
        this.logger.warn(`Missing order IDs: ${notFoundIds.join(', ')}`);
        throw new RpcException({
          statusCode: 404,
          message: `The following order IDs were not found: ${notFoundIds.join(', ')}`,
        });
      }

      // 3. Validate order statuses
      const invalidOrders = orders.filter(
        (o) => o.status !== 'APPROVED' && o.status !== 'DISPATCHED',
      );
      const alreadyDispatchedOrders = orders.filter(
        (o) => o.status === 'DISPATCHED',
      );

      if (invalidOrders.length > 0) {
        const invalidIds = invalidOrders.map((o) => o.id);
        this.logger.warn(
          `Invalid order statuses found for: ${invalidIds.join(', ')}`,
        );
        throw new RpcException({
          statusCode: 400,
          message: `The following orders are not approved and cannot be dispatched: ${invalidIds.join(', ')}`,
        });
      }

      if (alreadyDispatchedOrders.length > 0) {
        const dispatchedIds = alreadyDispatchedOrders.map((o) => o.id);
        this.logger.warn(
          `Orders already dispatched: ${dispatchedIds.join(', ')}`,
        );
        throw new RpcException({
          statusCode: 400,
          message: `The following orders are already dispatched: ${dispatchedIds.join(', ')}`,
        });
      }

      // 4. Validate uniform scope
      const uniqueScopes = [...new Set(orders.map((o) => o.shippingScope))];
      if (uniqueScopes.length > 1) {
        this.logger.warn(
          `Orders have mixed scopes: ${uniqueScopes.join(', ')}`,
        );
        throw new RpcException({
          statusCode: 400,
          message:
            'Orders must belong to the same shipping scope for batch dispatch.',
        });
      }

      // 5. Validate requested scope matches
      if (uniqueScopes[0] !== dto.scope) {
        this.logger.warn(
          `Scope mismatch: expected ${dto.scope}, found ${uniqueScopes[0]}`,
        );
        throw new RpcException({
          statusCode: 400,
          message: `Orders scope mismatch. Expected: ${dto.scope}, Found: ${uniqueScopes[0]}`,
        });
      }

      // 6. Generate Batch Code
      const batchCode = `BATCH-${new Date()
        .toISOString()
        .split('T')[0]
        .replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
      this.logger.log(`Generated new batch code: ${batchCode}`);

      // 7. Create batch dispatch record
      const batch = await this.dispatchRepo.createBatchDispatch(
        dto,
        batchCode,
        userId,
      );
      this.logger.verbose(`Batch created successfully with Code: ${batchCode}`);

      return {
        success: true,
        message: `Batch created successfully with code ${batchCode}`,
        data: batch,
      };
    } catch (error) {
      this.logger.error(
        `Failed to create batch dispatch for user ${userId}: ${error.message}`,
        error.stack,
      );
      throw handleCatch(error);
    }
  }
  async addOrdersToBatch(
    batchId: string,
    newOrderIds: string[],
    userId: string,
    updateData?: Partial<BatchDispatchDto>,
  ) {
    this.logger.log(
      `Request to add orders to batch ${batchId} by user ${userId}`,
    );
    this.logger.debug(`Orders to add: ${newOrderIds.join(', ')}`);

    try {
      // 1. Fetch batch
      const batch = await this.dispatchRepo.findBatchById(batchId);
      if (!batch) {
        this.logger.warn(`Batch not found: ${batchId}`);
        throw new RpcException({
          statusCode: 404,
          message: `Batch ${batchId} not found.`,
        });
      }

      this.logger.debug(
        `Batch found: ID ${batch.id}, status ${batch.status}, shipmentDate ${batch.shipmentDate}`,
      );

      // 2. Shipment date check
      const toDateOnly = (date: Date) =>
        new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const today = toDateOnly(new Date());
      const shipmentDate = toDateOnly(batch.shipmentDate);

      if (shipmentDate < today) {
        this.logger.warn(
          `Batch ${batchId} shipment date passed: ${shipmentDate.toDateString()}`,
        );
        throw new RpcException({
          statusCode: 400,
          message: `Batch ${batchId} has missed its shipment day (${shipmentDate.toDateString()}).`,
        });
      }

      // 3. Batch status validation
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
        this.logger.warn(
          `Cannot add orders. Batch ${batchId} status: ${batch.status}`,
        );
        throw new RpcException({
          statusCode: 400,
          message: `Batch ${batchId} is already in status '${batch.status}' and cannot be modified.`,
        });
      }

      // 4. Fetch and validate orders
      const orders = await this.dispatchRepo.findOrdersByIds(newOrderIds);
      const foundIds = orders.map((o) => o.id);
      const notFoundIds = newOrderIds.filter((id) => !foundIds.includes(id));
      if (notFoundIds.length) {
        this.logger.warn(`Orders not found: ${notFoundIds.join(', ')}`);
        throw new RpcException(`Orders not found: ${notFoundIds.join(', ')}`);
      }

      const invalidOrders = orders.filter((o) => o.status !== 'APPROVED');
      const dispatchedOrders = orders.filter((o) => o.status === 'DISPATCHED');
      if (invalidOrders.length) {
        this.logger.warn(
          `Orders not approved: ${invalidOrders.map((o) => o.id).join(', ')}`,
        );
        throw new RpcException(
          `Orders not approved: ${invalidOrders.map((o) => o.id).join(', ')}`,
        );
      }
      if (dispatchedOrders.length) {
        this.logger.warn(
          `Orders already dispatched: ${dispatchedOrders.map((o) => o.id).join(', ')}`,
        );
        throw new RpcException(
          `Orders already dispatched: ${dispatchedOrders.map((o) => o.id).join(', ')}`,
        );
      }

      // 5. Validate scope & serviceType
      const scopeMismatch = orders.filter(
        (o) => o.shippingScope !== batch.scope,
      );
      if (scopeMismatch.length) {
        this.logger.warn(
          `Scope mismatch for orders: ${scopeMismatch.map((o) => o.id).join(', ')}`,
        );
        throw new RpcException(
          `Scope mismatch: ${scopeMismatch.map((o) => o.id).join(', ')}`,
        );
      }

      // Optional: serviceType validation
      // const serviceMismatch = orders.filter((o) => o.serviceType !== batch.serviceType);
      // if (serviceMismatch.length) throw new RpcException(...);

      // 6. Branch validation when batch is at branch
      if (batch.status === 'AT_BRANCH') {
        const branchMismatch = orders.filter(
          (o) => o.branchId !== batch.originId,
        );
        if (branchMismatch.length) {
          this.logger.warn(
            `Branch mismatch for orders: ${branchMismatch.map((o) => o.id).join(', ')}`,
          );
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

      // 7. Add orders to batch
      const updatedBatch = await this.dispatchRepo.addOrdersToBatch(
        batchId,
        newOrderIds,
        updateData,
      );
      this.logger.verbose(`Orders added successfully to batch ${batchId}`);

      return IResponse.success(
        'Orders added to batch successfully',
        updatedBatch,
      );
    } catch (error) {
      this.logger.error(
        `Failed to add orders to batch ${batchId}: ${error.message}`,
        error.stack,
      );
      throw error instanceof RpcException
        ? error
        : new RpcException(error.message);
    }
  }

  async getBatches(query: ListQueryDto) {
    this.logger.log(`Fetching batches with query: ${JSON.stringify(query)}`);
    try {
      return await this.dispatchRepo.getBatches(query);
    } catch (error) {
      this.logger.error(
        `Failed to fetch batches: ${error.message}`,
        error.stack,
      );
      throw new RpcException(error.message);
    }
  }

  async prepareQRCodes(input: {
    orderIds?: string[];
    batchId?: string;
    branchId?: string;
    serviceType?: ServiceType;
    shippingScope?: ShippingScope;
  }) {
    this.logger.log(`Preparing QR codes with input: ${JSON.stringify(input)}`);

    try {
      // Step 1: Fetch orders
      let orders: any;
      if (input.orderIds && input.orderIds.length > 0) {
        this.logger.verbose(
          `Fetching orders by IDs: ${input.orderIds.join(', ')}`,
        );
        orders = await this.dispatchRepo.findOrdersByIds(input.orderIds);
      } else if (input.batchId) {
        this.logger.verbose(`Fetching orders by batch ID: ${input.batchId}`);
        orders = await this.dispatchRepo.findBatchById(input.batchId);
      } else {
        this.logger.warn('No orderIds, batchId, or branchId provided.');
        throw new RpcException(
          'Must provide at least orderIds, batchId, or branchId',
        );
      }

      if (!orders || orders.length === 0) {
        this.logger.warn('No orders found for the given criteria.');
        throw new RpcException('No orders found for the given criteria.');
      }

      // Step 2: Optional filtering
      if (input.serviceType) {
        orders = orders.filter((o) => o.serviceType === input.serviceType);
        this.logger.verbose(
          `Filtered orders by serviceType: ${input.serviceType}`,
        );
      }
      if (input.shippingScope) {
        orders = orders.filter((o) => o.shippingScope === input.shippingScope);
        this.logger.verbose(
          `Filtered orders by shippingScope: ${input.shippingScope}`,
        );
      }

      if (orders.length === 0) {
        this.logger.warn('No orders match the given filters.');
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
          this.logger.debug(`Generating QR for order ${order.id}`);
          const qrCode = await generateOrderQRCode(qrPayload);

          const qrDownloadUrl = `data:image/png;base64,${qrCode.split(',')[1]}`;

          qrResults.push({
            orderId: order.id,
            batchId: order.batchId,
            trackingCode: order.trackingCode,
            qrCode,
            qrDownloadUrl,
          });

          this.logger.verbose(
            `QR generated successfully for order ${order.id}`,
          );
        } catch (err) {
          this.logger.error(
            `Failed to generate QR for order ${order.id}: ${err}`,
            err.stack,
          );
          throw new RpcException(
            `Failed to generate QR for order ${order.id}: ${err}`,
          );
        }
      }

      this.logger.log(
        `QR code generation completed for ${qrResults.length} orders.`,
      );
      return qrResults;
    } catch (error) {
      this.logger.error(
        `QR code preparation failed: ${error.message}`,
        error.stack,
      );
      throw error instanceof RpcException
        ? error
        : new RpcException(error.message);
    }
  }
  async scanOrder(officerId: string, scannedToken: string, userId: string) {
    this.logger.log(`Scan request received by officer ${officerId}`);

    if (userId !== officerId) {
      this.logger.warn(
        `Unauthorized scan attempt by user ${userId} for officer ${officerId}`,
      );
      throw new RpcException({
        statusCode: 403,
        message: 'You are not authorized to do this action.',
      });
    }

    let payload: OrderQRCodeData;
    try {
      const jsonString = Buffer.from(
        scannedToken.split(',')[1],
        'base64',
      ).toString();
      payload = JSON.parse(jsonString);
      this.logger.verbose(
        `QR token decoded successfully for trackingCode: ${payload.trackingCode}`,
      );
    } catch (err) {
      this.logger.error(`Failed to decode QR token: ${err.message}`, err.stack);
      throw new RpcException('Invalid QR token format');
    }

    // Find order by tracking code
    const order = await this.dispatchRepo.findByTrackingCode(
      payload.trackingCode,
    );
    if (!order) {
      this.logger.warn(
        `Order not found for trackingCode: ${payload.trackingCode}`,
      );
      throw new RpcException('Order not found');
    }
    this.logger.verbose(
      `Order found: ${order.id} for trackingCode: ${order.trackingCode}`,
    );

    // Decode and validate QR
    let result: any;
    try {
      result = decodeAndValidateQRCode(scannedToken, order);
      this.logger.log(
        `QR validation result for order ${order.id}: valid=${result.valid}`,
      );
    } catch (err) {
      this.logger.error(
        `QR validation failed for order ${order.id}: ${err.message}`,
        err.stack,
      );
      throw new RpcException(`QR validation failed: ${err.message}`);
    }

    // Save scan log
    const location = 'At airport';
    try {
      await this.dispatchRepo.createScan(
        {
          orderId: order.id,
          scannedBy: officerId ?? userId,
          valid: result.valid,
          notes: result.notes,
          batchId: order.batchId ?? undefined,
        },
        location,
      );
      this.logger.verbose(
        `Scan log created for order ${order.id} at ${location}`,
      );
    } catch (err) {
      this.logger.error(
        `Failed to create scan log for order ${order.id}: ${err.message}`,
        err.stack,
      );
      throw new RpcException(`Failed to create scan log: ${err.message}`);
    }

    return result;
  }
  async compareOrders(officerId: string, userId: string) {
    this.logger.log(`Compare orders request by officer ${officerId}`);

    if (userId !== officerId) {
      this.logger.warn(
        `Unauthorized access attempt by user ${userId} for officer ${officerId}`,
      );
      throw new RpcException({
        statusCode: 403,
        message: 'You are not authorized to do this action.',
      });
    }

    try {
      // 1️⃣ Validate officer
      const officer = await this.dispatchRepo.findUserById(officerId);
      if (!officer) {
        this.logger.warn(`Officer not found: ${officerId}`);
        throw new NotFoundException(`Officer with ID ${officerId} not found.`);
      }
      this.logger.verbose(`Officer validated: ${officer.id}`);

      // 2️⃣ Validate branch
      if (!officer.branchId) {
        this.logger.warn(`Officer ${officer.id} is not assigned to any branch`);
        throw new BadRequestException(
          `Officer ${officer.id} is not assigned to any branch.`,
        );
      }

      const branch = await this.dispatchRepo.findBranchById(officer.branchId);
      if (!branch) {
        this.logger.warn(`Branch not found: ${officer.branchId}`);
        throw new NotFoundException(
          `Branch with ID ${officer.branchId} not found.`,
        );
      }
      this.logger.verbose(`Branch validated: ${branch.id}`);

      // 3️⃣ Find relevant batches
      const batches = await this.dispatchRepo.findBatchesByBranchId(branch.id, [
        'IN_TRANSIT',
        'ARRIVED_AT_DESTINATION',
      ]);
      this.logger.debug(
        `Found ${batches.length} batches for branch ${branch.id}`,
      );

      if (batches.length === 0) {
        this.logger.log(`No pending batches for branch ${branch.id}`);
        return {
          message: 'No batches pending for this branch.',
          missingOrders: [],
          scannedOrders: [],
        };
      }

      // 4️⃣ Collect all orders from batches
      const batchIds = batches.map((b) => b.id);
      const expectedOrders =
        await this.dispatchRepo.findOrdersByBatchIds(batchIds);
      this.logger.debug(`Total expected orders: ${expectedOrders.length}`);

      // 5️⃣ Collect scanned orders
      const scannedOrders = await this.dispatchRepo.findScannedOrdersByOfficer(
        officer.id,
        batchIds,
      );
      this.logger.debug(
        `Total scanned orders by officer ${officer.id}: ${scannedOrders.length}`,
      );

      // 6️⃣ Compare expected vs scanned
      const expectedTrackingCodes = expectedOrders.map((o) => o.trackingCode);
      const scannedTrackingCodes = scannedOrders.map(
        (s) => s.order.trackingCode,
      );

      const missingOrders = expectedOrders.filter(
        (o) => !scannedTrackingCodes.includes(o.trackingCode),
      );
      const mismatchedOrders = scannedOrders.filter(
        (s) => !expectedTrackingCodes.includes(s.order.trackingCode),
      );

      this.logger.log(
        `Comparison completed for officer ${officer.id} at branch ${branch.id}`,
      );
      if (missingOrders.length > 0) {
        this.logger.warn(
          `Missing orders: ${missingOrders.map((o) => o.trackingCode).join(', ')}`,
        );
      }
      if (mismatchedOrders.length > 0) {
        this.logger.warn(
          `Mismatched scanned orders: ${mismatchedOrders.map((s) => s.order.trackingCode).join(', ')}`,
        );
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
    } catch (error) {
      this.logger.error(
        `Failed to compare orders: ${error.message}`,
        error.stack,
      );
      throw error instanceof RpcException
        ? error
        : new RpcException(error.message);
    }
  }

  async confirmHandover(dto: ConfirmBatchHandoverDto) {
    this.logger.log(`Confirm handover request by officer ${dto.handedById}`);

    try {
      const officer = await this.dispatchRepo.findUserById(dto.handedById);
      if (!officer) {
        this.logger.warn(`Officer not found: ${dto.handedById}`);
        throw new RpcException('Officer not found');
      }
      this.logger.verbose(`Officer validated: ${officer.id}`);

      const result = await this.dispatchRepo.confirmBatchHandoverAutomatic(
        dto.handedById,
        dto.method,
        dto.reference,
        dto.notes,
      );

      this.logger.log(`Handover confirmed by officer ${dto.handedById}`);
      return {
        success: true,
        message: 'All scanned valid orders have been confirmed.',
        ...result,
      };
    } catch (error) {
      this.logger.error(
        `Confirm handover failed: ${error.message}`,
        error.stack,
      );
      throw error instanceof RpcException
        ? error
        : new RpcException(error.message);
    }
  }

  // Create Driver
  async createDriver(data: CreateDriver) {
    this.logger.log(
      `Creating driver for user ${data.userId} with vehicle ${data.vehicleId}`,
    );

    try {
      const user = await this.dispatchRepo.findUserById(data.userId);
      if (!user) {
        this.logger.warn(`User not found: ${data.userId}`);
        throw new RpcException({
          statusCode: 404,
          message: `User with ID ${data.userId} not found and cannot create driver.`,
        });
      }
      this.logger.verbose(`User validated: ${user.id}`);

      const vehicle = await this.dispatchRepo.findVehicleById(data.vehicleId);
      if (!vehicle) {
        this.logger.warn(`Vehicle not found: ${data.vehicleId}`);
        throw new RpcException({
          statusCode: 404,
          message: `Vehicle with ID ${data.vehicleId} not found and cannot create driver.`,
        });
      }
      this.logger.verbose(`Vehicle validated: ${vehicle.id}`);

      const driver = await this.dispatchRepo.createDriver(data);
      this.logger.log(`Driver created successfully for user ${data.userId}`);
      return driver;
    } catch (error) {
      this.logger.error(
        `Failed to create driver: ${error.message}`,
        error.stack,
      );
      throw error instanceof RpcException
        ? error
        : new RpcException(error.message);
    }
  }

  // Find Driver
  async findDriver(query: ListQueryDto) {
    this.logger.log(`Finding drivers with query: ${JSON.stringify(query)}`);

    try {
      const drivers = await this.dispatchRepo.findDriver(query);
      this.logger.verbose(`Found ${drivers.pagination.total} drivers`);
      return drivers;
    } catch (error) {
      this.logger.error(`Find driver failed: ${error.message}`, error.stack);
      throw new RpcException(error.message);
    }
  }
}
