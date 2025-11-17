import { MapsService } from '../../fulfillment/maps/maps.service';
import { OrderUseCasesImpl } from '../../fulfillment/order/order.usecase.impl';
import { PricingUseCasesImpl } from '../../fulfillment/pricing/pricing.usecase.impl';
export declare class OrderDistanceWsService {
    private readonly mapService;
    private readonly orderUseCases;
    private readonly pricingUseCases;
    constructor(mapService: MapsService, orderUseCases: OrderUseCasesImpl, pricingUseCases: PricingUseCasesImpl);
    calculateDistanceAndPrice(payload: {
        orderId: string;
        origin: {
            lat: number;
            lon: number;
        };
        destination: {
            lat: number;
            lon: number;
        };
    }): Promise<{
        distance: number;
        priceData: {
            result: any;
            error: string;
        } | {
            result: {
                finalPrice: number;
                currency: string;
                breakdown: any;
            };
            error: any;
        };
    }>;
    calculatePrice(payload: {
        orderId: string;
        origin: {
            lat: number;
            lon: number;
        };
        destination: {
            lat: number;
            lon: number;
        };
    }): Promise<{
        result: any;
        error: string;
    } | {
        result: {
            finalPrice: number;
            currency: string;
            breakdown: any;
        };
        error: any;
    }>;
}
