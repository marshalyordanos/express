import { ClientProxy } from '@nestjs/microservices';
import { ServiceType } from '@prisma/client';
export declare class ReportGatewayController {
    private readonly reportClient;
    constructor(reportClient: ClientProxy);
    getOverview(req: any): Promise<import("rxjs").Observable<any>>;
    getShipmentPerformance(req: any): Promise<import("rxjs").Observable<any>>;
    getRevenueTrends(period: string, req: any): Promise<import("rxjs").Observable<any>>;
    getBranchPerformance(metric: string, req: any): Promise<import("rxjs").Observable<any>>;
    getDriverPerformance(regionId: string, req: any): Promise<import("rxjs").Observable<any>>;
    getBranchDashboardSummary(regionId: string, req: any): Promise<import("rxjs").Observable<any>>;
    getStaffDashboardSummary(regionId: string, req: any): Promise<import("rxjs").Observable<any>>;
    getOrderDashboardSummary(req: any): Promise<import("rxjs").Observable<any>>;
    getCustomerDashboardSummary(req: any): Promise<import("rxjs").Observable<any>>;
    getRevenueDashboardSummary(req: any): Promise<import("rxjs").Observable<any>>;
    getFleetDashboardSummary(req: any): Promise<import("rxjs").Observable<any>>;
    getDispatchDashboardSummary(req: any): Promise<import("rxjs").Observable<any>>;
    getShipmentSummary(req: any): Promise<import("rxjs").Observable<any>>;
    getShipmentStatusBreakdown(req: any): Promise<import("rxjs").Observable<any>>;
    getShipmentByType(serviceType: ServiceType, req: any): Promise<import("rxjs").Observable<any>>;
    getShipmentByCustomer(customerId: string, req: any): Promise<import("rxjs").Observable<any>>;
    getDelayedShipments(req: any): Promise<import("rxjs").Observable<any>>;
    getBranchOverview(req: any): Promise<import("rxjs").Observable<any>>;
    getBranchDetails(branchId: string, req: any): Promise<import("rxjs").Observable<any>>;
    getDriverOverview(req: any): Promise<import("rxjs").Observable<any>>;
    getDriverDetails(driverId: string, req: any): Promise<import("rxjs").Observable<any>>;
    getTopBranches(metric: string, req: any): Promise<import("rxjs").Observable<any>>;
    getTopDrivers(metric: string, req: any): Promise<import("rxjs").Observable<any>>;
}
