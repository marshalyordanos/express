import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { MapLocationGateway } from '../gateways/map-location.gateway';

@Injectable()
export class WebSocketEventService {
  constructor(
    @Inject(forwardRef(() => MapLocationGateway))
    private readonly mapLocationGateway: MapLocationGateway,
  ) {}

  emitDriverStatus(
    server: Server,
    driverId: string,
    status: 'ONLINE' | 'OFFLINE',
  ) {
    server.emit('driver:status', { driverId, status });
  }

  emitLocationUpdate(server: Server, payload: any) {
    server.emit('driver:location:updated', payload);
  }

  emitDriverLocationToSubscribers(payload: {
    driverId: string;
    lat: number;
    lon: number;
    speed?: number;
    heading?: number;
  }) {
    const gateway = this.mapLocationGateway;
    if (!gateway?.server) return;

    for (const [clientId, driverId] of gateway[
      'socketDriverWatchMap'
    ].entries()) {
      if (driverId === payload.driverId) {
        gateway.server.to(clientId).emit('driver:location:tracking', payload);
      }
    }
  }

  emitDriverNavigationToDriver(driverId: string, route: any) {
    const gateway = this.mapLocationGateway;
    if (!gateway?.server) return;
    gateway.server.to(driverId).emit('navigation:update', route);
  }

  // emitNavigationEtaToCustomer(customerId: string, customerNav: any) {
  //   const gateway = this.mapLocationGateway;
  //   if (!gateway?.server) return;
  //   gateway.server.to(customerId).emit('navigation:eta:update', customerNav);
  // }

  emitNavigationEtaToAllSubscribedCustomers(driverId: string, nextStop: any, driverInfo: any) {
  const gateway = this.mapLocationGateway;
  if (!gateway?.server) return;

  // Loop through all subscribed clients
  for (const [clientId, subscription] of gateway['socketOrderWatchMap'].entries()) {
    if (
      subscription.driverId === driverId && 
      subscription.orderId === nextStop.orderId
    ) {
      gateway.server.to(clientId).emit('navigation:eta:update', {
        driverId,
        orderId: nextStop.orderId,
        ...driverInfo,
        remainingDistanceKm: nextStop.distanceKm,
        etaMinutes: nextStop.eta,
      });
    }
  }
}

  emitOrderDistance(server: Server, payload: any) {
    server.emit('order:distance:updated', payload);
  }

  emitOrderPrice(server: Server, payload: any) {
    server.emit('order:price:calculated', payload);
  }

  emitOrderDistanceCalculation(
    orderId: string,
    origin: { lat: number; lon: number },
    destination: { lat: number; lon: number },
  ) {
    console.log('Inside event');

    this.mapLocationGateway.server.emit('order:distance:calculate', {
      orderId,
      origin,
      destination,
    });
  }

  emitDriverLocationUpdate(
    driverId: string,
    lat: number,
    lon: number,
    speed?: number,
    heading?: number,
  ) {
    this.mapLocationGateway.server.emit('driver:location:updated', {
      driverId,
      lat,
      lon,
      speed,
      heading,
    });
  }
}
