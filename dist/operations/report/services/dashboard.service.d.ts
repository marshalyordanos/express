import { DashboardReportRepository } from '../repositories/dashboard.repository';
import { RedisService } from '../../../redis/redis.service';
export declare class DashboardReportService {
    private readonly dashboardRepo;
    private readonly redis;
    private readonly logger;
    constructor(dashboardRepo: DashboardReportRepository, redis: RedisService);
    getOverview(token: string): Promise<any>;
    getShipmentPerformance(): Promise<{
        totalShipments: number;
        deliveredShipments: number;
        failedShipments: number;
        canceledShipments: number;
        exceptionShipments: number;
        deliveryRate: number;
        failureRate: number;
        cancellationRate: number;
        exceptionRate: number;
        avgDeliveryTimeHours: number;
    }>;
    getRevenueTrends(period: 'daily' | 'weekly' | 'monthly' | 'yearly'): Promise<any>;
    getBranchPerformance(metric: string): Promise<any>;
    getDriverPerformance(branchId: string): Promise<any>;
    getBranchDashboardSummary(): Promise<{
        totalBranches: {
            value: number;
            newThisMonth: number;
        };
        activeOrders: {
            value: number;
            percentChange: number;
        };
        totalStaff: {
            value: number;
            newThisMonth: number;
        };
        managerVacancies: {
            value: number;
            note: string;
        };
    }>;
    getStaffDashboardSummary(): Promise<{
        totalStaff: {
            value: number;
            newThisMonth: number;
        };
        activeStaff: {
            value: number;
            activeRate: number;
        };
        onLeave: {
            value: number;
            changeFromLastWeek: number;
        };
        branchesCovered: {
            value: number;
            note: string;
        };
    }>;
    getOrderDashboardSummary(): Promise<{
        totalOrders: {
            value: number;
            change: number;
        };
        thisWeekOrders: {
            value: number;
            change: number;
        };
        thisMonthOrders: {
            value: number;
            change: number;
        };
        returnOrders: {
            value: number;
            change: number;
        };
        fulfilledOrders: {
            value: number;
            change: number;
        };
        onTimeDeliveryRate: number;
        avgPickupToDeliveryTime: number;
        avgBranchProcessingTime: number;
    }>;
    getOrderAnalytics(): Promise<{
        totalOrders: {
            value: number;
            change: number;
        };
        thisWeekOrders: {
            value: number;
            change: number;
        };
        thisMonthOrders: {
            value: number;
            change: number;
        };
        returnOrders: {
            value: number;
            change: number;
        };
        fulfilledOrders: {
            value: number;
            change: number;
        };
        onTimeDeliveryRate: number;
        avgPickupToDeliveryTime: number;
        avgBranchProcessingTime: number;
    }>;
    getCustomerAnalytics(): Promise<{
        totalCustomers: {
            value: number;
            newThisMonth: number;
            change: number;
        };
        activeCustomers: {
            value: number;
            rate: number;
        };
        corporateClients: {
            value: number;
            newThisMonth: number;
        };
        loyaltyMembers: {
            value: number;
            note: string;
        };
    }>;
    private parseJsonArray;
    private sumMetrics;
    getReportOverview(): Promise<any>;
    getFleetSummary(): Promise<{
        totalVehicles: number;
        inHouse: number;
        external: number;
        activeVehicles: number;
        activePercentage: number;
        underMaintenance: number;
        maintenanceVehicles: string[];
        avgUtilization: number;
        utilizationChange: number;
    }>;
    getDispatchSummary(): Promise<{
        totalDispatches: number;
        byStatus: {};
        byScope: {};
        byServiceType: {};
        assignedToDrivers: number;
        unassigned: number;
        avgWeightPerDispatch: number;
        totalWeight: number;
        dispatchedOrders: number;
        completedOrders: number;
        failedOrders: number;
        vehiclesUsed: number;
        driversUsed: number;
        originBranches: number;
        destinationBranches: number;
        dispatchesToday: number;
        dispatchesThisWeek: number;
        activeDrivers: number;
        activeDriverChange: number;
        deliveriesToday: number;
        deliveryChange: number;
        onTimeRate: number;
        onTimeImprovement: number;
        routeEfficiency: number;
        routeEfficiencyChange: number;
        utilizationChange: number;
    }>;
    private cacheWrap;
}
