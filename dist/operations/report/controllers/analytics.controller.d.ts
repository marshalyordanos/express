import { ServiceType } from '@prisma/client';
export declare class AnalyticsController {
    getShipmentSummary(payload: {
        headers: {
            authorization: string;
        };
    }): Promise<void>;
    getShipmentStatusBreakdown(payload: {
        headers: {
            authorization: string;
        };
    }): Promise<void>;
    getShipmentByType(payload: {
        headers: {
            authorization: string;
        };
        serviceType: ServiceType;
    }): Promise<void>;
    getShipmentByCustomer(payload: {
        customerId: string;
        headers: {
            authorization: string;
        };
    }): Promise<void>;
    getDelayedShipments(payload: {
        headers: {
            authorization: string;
        };
    }): Promise<void>;
    getBranchOverview(payload: {
        headers: {
            authorization: string;
        };
    }): Promise<void>;
}
