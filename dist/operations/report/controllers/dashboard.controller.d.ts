import { DashboardReportService } from '../services/dashboard.service';
export declare class DashboardReportMessageController {
    private readonly reportsService;
    constructor(reportsService: DashboardReportService);
    getOverview(payload: {
        headers: {
            authorization: string;
        };
    }): Promise<any>;
    getShipmentPerformance(payload: {
        headers: {
            authorization: string;
        };
    }): Promise<{
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
    getRevenueTrends(payload: {
        headers: {
            authorization: string;
        };
        period: string;
    }): Promise<any>;
    getBranchPerformance(payload: {
        headers: {
            authorization: string;
        };
        metric: string;
    }): Promise<any>;
    getDriverPerformance(payload: {
        headers: {
            authorization: string;
        };
        regionId: string;
    }): Promise<any>;
    getBranchDashboardSummary(payload: {
        headers: {
            authorization: string;
        };
    }): Promise<{
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
    getStaffDashboardSummary(payload: {
        headers: {
            authorization: string;
        };
    }): Promise<{
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
    getOrderDashboardSummary(payload: {
        headers: {
            authorization: string;
        };
    }): Promise<{
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
    getCustomerDashboardSummary(payload: {
        headers: {
            authorization: string;
        };
    }): Promise<{
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
    getReportOverview(payload: {
        headers: {
            authorization: string;
        };
    }): Promise<any>;
    getFleetSummary(payload: {
        headers: {
            authorization: string;
        };
    }): Promise<{
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
    getDispatchSummary(payload: {
        headers: {
            authorization: string;
        };
    }): Promise<{
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
}
