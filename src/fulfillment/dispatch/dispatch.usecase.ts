import { Injectable } from '@nestjs/common';
import { AssignDriverForPickup, BatchDispatchDto } from './dispatch.entity';
import { DispatchStatus, ShippingScope, ServiceType } from '@prisma/client';

export interface DispatchUseCases {
  assignDriverForPickup(data: AssignDriverForPickup): Promise<any>;
  assignDriverForDelivery(data: AssignDriverForPickup): Promise<any>;
  removeDriverFromOrder(orderId: string): Promise<any>;
  changeDriverForOrder(data: AssignDriverForPickup): Promise<any>;
  createBatchDispatch(dto: BatchDispatchDto): Promise<any>;
  getBatches(filters: {
    status?: DispatchStatus;
    scope?: ShippingScope;
    serviceType?: ServiceType;
    fragile?: boolean;
    unusual?: boolean;
    search?: string;
    page?: number;
    pageSize?: number;
  }): Promise<any>;
}
