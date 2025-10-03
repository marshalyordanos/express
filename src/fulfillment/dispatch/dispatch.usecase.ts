import { Injectable } from '@nestjs/common';
import { AssignDriverForPickup, AssignOfficerForBatch, BatchDispatchDto, BatchHandoverDto, ConfirmBatchHandoverDto } from './dispatch.entity';
import { DispatchStatus, ShippingScope, ServiceType } from '@prisma/client';
import { ListQueryDto } from '../../common/query/query.dto';

export interface DispatchUseCases {
  assignDriverForPickup(data: AssignDriverForPickup): Promise<any>;///
  assignDriverForDelivery(data: AssignDriverForPickup): Promise<any>;///
  assignDriverToOrder(data: AssignDriverForPickup): Promise<any>;///
  lastMileDelivery(orderId: string, driverId: string, notes?: string): Promise<any>;///
  completeDelivery(orderId: string, driverId: string, notes?: string): Promise<any>;///
  removeDriverFromOrder(orderId: string): Promise<any>;///
  changeDriverForOrder(data: AssignDriverForPickup): Promise<any>;///
  createBatchDispatch(dto: BatchDispatchDto): Promise<any>;///
  getBatches(query: ListQueryDto): Promise<any>;////

  confirmDispatch(data: AssignOfficerForBatch): Promise<any>;///
  collectBatchByCargoOfficer(data: AssignOfficerForBatch): Promise<any>;///
  deliverBatchToAirport(data: BatchHandoverDto): Promise<any>;///
  // collectFromAirport(data: BatchHandoverDto): Promise<any>;///
  addOrdersToBatch(batchId: string, newOrderIds: string[],updateData?: Partial<BatchDispatchDto>): Promise<any>;///
  prepareQRCodes(input: {
    batchId: string;
    orderIds: string[];
    updateData?: Partial<BatchDispatchDto>;
  }): Promise<any>;
  scanOrder(officerId: string, scannedToken: string): Promise<any>;
  compareOrders(officerId: string): Promise<any>;
  confirmHandover(dto: ConfirmBatchHandoverDto): Promise<any>;
  // cancelDispatch(batchIds: string[]): Promise<any>;
  // confirmPickupByCargoOfficer(batchIds: string[]): Promise<any>;
  // handoverBatchToAirport(
  //   batchIds: string[],
  //   handedById: string,
  //   options?: { method?: string; reference?: string; notes?: string },
  // ): Promise<any>;
  // receiveFromAirport(batchIds: string[]): Promise<any>;

}
