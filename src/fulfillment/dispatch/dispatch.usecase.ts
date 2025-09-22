import { Injectable } from '@nestjs/common';
import { AssignDriverForPickup } from './dispatch.entity';

export interface DispatchUseCases {
  assignDriverForPickup(data: AssignDriverForPickup): Promise<any>;
  assignDriverForDelivery(data: AssignDriverForPickup): Promise<any>;
  removeDriverFromOrder(orderId: string): Promise<any>;
  changeDriverForOrder(data: AssignDriverForPickup): Promise<any>;
}
