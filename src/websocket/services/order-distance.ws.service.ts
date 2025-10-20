import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { MapsService } from '../../fulfillment/maps/maps.service';
import { OrderUseCasesImpl } from '../../fulfillment/order/order.usecase.impl';
import { PricingUseCasesImpl } from '../../fulfillment/pricing/pricing.usecase.impl';

@Injectable()
export class OrderDistanceWsService {
  constructor(
    private readonly mapService: MapsService,
    @Inject(forwardRef(() => OrderUseCasesImpl))
    private readonly orderUseCases: OrderUseCasesImpl,
    @Inject(forwardRef(() => PricingUseCasesImpl))
    private readonly pricingUseCases: PricingUseCasesImpl,
  ) {}

  async calculateDistanceAndPrice(payload: {
    orderId: string;
    origin: { lat: number; lon: number };
    destination: { lat: number; lon: number };
  }) {
    const distance = await this.mapService.calculateDistance(
      payload.origin,
      payload.destination,
    );

    await this.orderUseCases.updateOrderDistance(payload.orderId, distance);

    const priceData = await this.pricingUseCases.calculatePrice(
      payload.orderId,
    );

    return { distance, priceData };
  }

  async calculatePrice(payload: {
    orderId: string;
    origin: { lat: number; lon: number };
    destination: { lat: number; lon: number };
  }) {
    const priceData = await this.pricingUseCases.calculatePrice(
      payload.orderId,
    );

    return priceData;
  }
}
