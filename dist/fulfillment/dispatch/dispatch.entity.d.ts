import { DriverStatus, DriverType, ServiceType, ShippingScope } from '@prisma/client';
export declare class AssignDriverForPickup {
    orderId: string;
    driverId: string;
}
export declare class BatchDispatchDto {
    scope: ShippingScope;
    serviceType: ServiceType;
    category: string[];
    isFragile?: boolean;
    originId: string;
    destinationId: string;
    notes?: string;
    createdById?: string;
    driverId?: string;
    vehicleId?: string;
    awbNumber?: string;
    weight?: number;
    orders: string[];
    shipmentDate: string;
}
export declare class CreateDriver {
    userId: string;
    vehicleId: string;
    status: DriverStatus;
    type: DriverType;
    currentLat: number;
    currentLong: number;
}
export declare class AssignOfficerForBatch {
    batchId: string[];
    officerId: string;
}
export declare class BatchHandoverDto {
    handedById: string;
    batchIds: string[];
    method?: string;
    reference?: string;
    notes?: string;
    currentLocation?: string;
}
export declare class OrderScanTokenDto {
    scannedBy: string;
    token: string;
}
export declare class ConfirmBatchHandoverDto {
    handedById: string;
    method?: string;
    reference?: string;
    notes?: string;
}
export declare class CompleteDeliveryDto {
    orderId: string;
    driverId: string;
    notes?: string;
    podImages?: {
        url: string;
        publicId?: string;
        fileName?: string;
        fileType?: string;
    }[];
}
export declare class LastMileDeliveryDto {
    orderId: string;
    driverId: string;
    notes?: string;
}
export declare class GenerateQrDto {
    orderIds?: string[];
    batchId?: string;
    branchId?: string;
    serviceType?: ServiceType;
    shippingScope?: ShippingScope;
}
export declare class AssignmentRequestUpsertDto {
    orderId: string;
    driverId: string;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
    sentAt?: Date;
    expiresAt?: Date | null;
    acceptedAt?: Date | null;
}
export declare class CreateAssignmentRequestsDto {
    orderId: string;
    driverIds: string[];
    expiresAt?: Date | null;
}
