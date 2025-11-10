import { ServiceType, FulfillmentType, ShipmentType, ShippingScope, OrderStatus } from '@prisma/client';
export declare class AddressDto {
    label?: string;
    addressLine?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    lat: string;
    long: string;
}
export declare class CreateOrderDto {
    name?: string;
    email?: string;
    phone?: string;
    customerId?: string;
    receiverName?: string;
    receiverEmail?: string;
    receiverPhone?: string;
    receiverId?: string;
    branchId?: string;
    driverId?: string;
    serviceType: ServiceType;
    fulfillmentType: FulfillmentType;
    trackingCode: string;
    weight: number;
    category: string[];
    isFragile?: boolean;
    shipmentType?: ShipmentType;
    shippingScope?: ShippingScope;
    length?: number;
    width?: number;
    quantity: number;
    height?: number;
    pickupDate?: string;
    pickupAddress?: AddressDto;
    deliveryAddress: AddressDto;
    deliveryDate?: string;
    cost?: number;
    paymentId?: string;
    isUnusual?: boolean;
    unusualReason?: string;
}
declare const UpdateOrderDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateOrderDto>>;
export declare class UpdateOrderDto extends UpdateOrderDto_base {
    status: OrderStatus;
}
export declare class AcceptDropOffDto {
    trackingCode: string;
}
export declare class ConfirmPickUpOrderDto {
    orderId: string;
    driverId: string;
}
export declare class ApproveOrderDto {
    orderId: string;
    reason: string;
}
export declare class MarkUnusualOrderDto {
    isFragile: string;
    unusualReason: string;
}
declare const ValidateOrderDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateOrderDto>>;
export declare class ValidateOrderDto extends ValidateOrderDto_base {
    validatedBy?: string;
    validatedNotes?: string;
}
export declare class AddException {
    orderId: string;
    reason: string;
    type: string;
}
export declare class CancelOrderDto {
    orderId: string;
    reason: string;
}
export {};
