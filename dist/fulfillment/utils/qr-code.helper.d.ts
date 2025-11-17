import { ServiceType, ShipmentType, ShippingScope } from '@prisma/client';
export interface DeliveryAddressDto {
    addressLine: string;
    city: string;
    country: string;
}
export interface OrderQRCodeData {
    trackingCode: string;
    branchId?: string;
    serviceType: ServiceType;
    weight: number;
    length?: number;
    width?: number;
    height?: number;
    deliveryAddress: DeliveryAddressDto;
    batchId?: string;
    shippingScope: ShippingScope;
    shipmentType: ShipmentType;
}
export interface ScanResult {
    valid: boolean;
    orderId?: string;
    batchId?: string;
    notes?: string;
    payload?: OrderQRCodeData;
}
export declare function generateOrderQRCode(data: OrderQRCodeData): Promise<string>;
export declare function decodeAndValidateQRCode(scannedToken: string, order: any): ScanResult;
