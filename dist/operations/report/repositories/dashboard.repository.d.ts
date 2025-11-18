import { DispatchStatus, ServiceType, ShippingScope, VehicleStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
export declare class DashboardReportRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getOverview(): Promise<{
        totalOrders: number;
        pendingOrders: number;
        canceledOrders: number;
        deliveredOrders: number;
        failedOrders: number;
        totalRevenue: number;
        totalDrivers: number;
        totalVehicles: number;
        totalBranches: number;
        avgDeliveryTimeHours: number;
    }>;
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
    getRevenueTrends(period: 'daily' | 'weekly' | 'monthly' | 'yearly'): Promise<{
        period: string;
        totalRevenue: number;
    }[]>;
    getBranchPerformance(): Promise<{
        data: {
            branchName: string;
            activeOrders: number;
            completedOrders: number;
            delayedOrders: number;
            revenue: number;
            efficiency: number;
            trend: string;
        }[];
    }>;
    getVehicles(filter?: {
        status?: VehicleStatus;
        type?: string;
        driverId?: string;
    }): Promise<({
        driver: {
            id: string;
            updatedAt: Date | null;
            createdBy: string | null;
            userId: string;
            type: import(".prisma/client").$Enums.DriverType;
            status: import(".prisma/client").$Enums.DriverStatus;
            vehicleId: string | null;
            currentLat: number | null;
            availablityStatus: import(".prisma/client").$Enums.DriverAvailabilityStatus;
            licenseNumber: string | null;
            licenseExpiry: Date | null;
            licenseIssue: Date | null;
            frontImageUrl: string | null;
            backImageUrl: string | null;
            verifiedByOCR: boolean;
            currentLon: number | null;
        };
        fleetLogs: {
            id: string;
            createdBy: string | null;
            cost: number | null;
            vehicleId: string;
            maintenance: string;
            date: Date;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        type: string;
        driverId: string | null;
        status: import(".prisma/client").$Enums.VehicleStatus;
        plateNumber: string;
        model: string | null;
        maxLoad: number | null;
    })[]>;
    getActiveDrivers(): Promise<number>;
    getActiveDriversYesterday(): Promise<number>;
    getDeliveriesToday(): Promise<number>;
    getDeliveriesYesterday(): Promise<number>;
    getDispatches(filters?: {
        status?: DispatchStatus;
        scope?: ShippingScope;
        serviceType?: ServiceType;
        driverId?: string;
        vehicleId?: string;
        from?: Date;
        to?: Date;
    }): Promise<({
        vehicle: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            type: string;
            driverId: string | null;
            status: import(".prisma/client").$Enums.VehicleStatus;
            plateNumber: string;
            model: string | null;
            maxLoad: number | null;
        };
        driver: {
            name: string;
            email: string;
            password: string;
            branchId: string | null;
            customerType: import(".prisma/client").$Enums.CustomerType | null;
            phone: string | null;
            id: string;
            customId: string | null;
            createdAt: Date;
            updatedAt: Date;
            emailVerified: boolean;
            roleId: string | null;
            isStaff: boolean;
            isSuperAdmin: boolean;
            emergencyContactName: string | null;
            emergencyContactPhone: string | null;
            isActive: boolean;
            customerCategoryId: string | null;
            createdBy: string | null;
        };
        orders: {
            branchId: string | null;
            notes: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            length: number | null;
            width: number | null;
            customerId: string;
            receiverId: string | null;
            serviceType: import(".prisma/client").$Enums.ServiceType;
            fulfillmentType: import(".prisma/client").$Enums.FulfillmentType;
            trackingCode: string;
            weight: number;
            category: string[];
            isFragile: boolean;
            shipmentType: import(".prisma/client").$Enums.ShipmentType | null;
            shippingScope: import(".prisma/client").$Enums.ShippingScope | null;
            quantity: number | null;
            height: number | null;
            pickupDate: Date | null;
            deliveryDate: Date | null;
            cost: number | null;
            isUnusual: boolean;
            unusualReason: string | null;
            status: import(".prisma/client").$Enums.OrderStatus;
            validatedBy: string | null;
            validatedNotes: string | null;
            pickupDriverId: string | null;
            deliveryDriverId: string | null;
            pickupAddressId: string | null;
            deliveryAddressId: string | null;
            pickupConfirmed: boolean;
            dropoffConfirmed: boolean;
            actualPickupDate: Date | null;
            actualDropoffDate: Date | null;
            distance: number | null;
            validatedAt: Date | null;
            pickupAssignedBy: string | null;
            pickupAssignedAt: Date | null;
            deliveryAssignedBy: string | null;
            deliveryAssignedAt: Date | null;
            estimatedDeliveryAt: Date | null;
            actualDeliveryAt: Date | null;
            batchId: string | null;
            tariffId: string | null;
            finalPrice: number | null;
            currency: string | null;
            optimizationJobId: string | null;
        }[];
        origin: {
            branchId: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            userId: string | null;
            label: string;
            addressLine: string;
            city: string;
            state: string | null;
            country: string;
            postalCode: string | null;
            lat: string | null;
            long: string | null;
            purpose: import(".prisma/client").$Enums.AddressPurpose;
        };
        destination: {
            branchId: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            userId: string | null;
            label: string;
            addressLine: string;
            city: string;
            state: string | null;
            country: string;
            postalCode: string | null;
            lat: string | null;
            long: string | null;
            purpose: import(".prisma/client").$Enums.AddressPurpose;
        };
    } & {
        notes: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        scope: import(".prisma/client").$Enums.ShippingScope;
        driverId: string | null;
        serviceType: import(".prisma/client").$Enums.ServiceType;
        weight: number | null;
        category: string[];
        isFragile: boolean;
        status: import(".prisma/client").$Enums.DispatchStatus;
        originId: string | null;
        destinationId: string | null;
        batchCode: string;
        createdById: string | null;
        shipmentDate: Date | null;
        createdUser: string | null;
        vehicleId: string | null;
        awbNumber: string | null;
        officerId: string | null;
    })[]>;
    getTodayDispatches(): Promise<number>;
    getWeekDispatches(): Promise<number>;
    getOrderStats(): Promise<(import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.OrderGroupByOutputType, "status"[]> & {
        _count: number;
    })[]>;
    getOnTimeOrders(): Promise<number>;
    getTotalDelivered(): Promise<number>;
    getRouteEfficiency(): Promise<number>;
    getUtilizationStats(): Promise<{
        id: string;
        fleetLogs: {
            cost: number;
        }[];
    }[]>;
    findBranchName(): Promise<{
        name: string;
        id: string;
    }[]>;
    getDriverPerformance(branchId?: string): Promise<{
        driverId: string;
        driverName: string;
        branch: string;
        handledOrders: number;
        pickupHandled: number;
        deliveryHandled: number;
        completedOrders: number;
        failedOrders: number;
        avgTimePerKm: number;
        onTimePercent: number;
        performanceStatus: string;
    }[]>;
    getDriverSuccessRate(driverUserId: string): Promise<{
        driverUserId: string;
        totalOrders: number;
        deliveredOrders: number;
        successRate: number;
    }>;
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
    getTotalOrders(): Promise<number>;
    getOrderCountBetween(start: Date, end: Date): Promise<number>;
    getDeliveredOrders(start: Date, end: Date): Promise<{
        serviceType: import(".prisma/client").$Enums.ServiceType;
        shippingScope: import(".prisma/client").$Enums.ShippingScope;
        actualPickupDate: Date;
        actualDeliveryAt: Date;
    }[]>;
    getOrderCounts(start: Date, end: Date): Promise<{
        totalOrders: number;
        returnOrders: number;
        fulfilledOrders: number;
    }>;
    getOrderCountsByPeriod(): Promise<{
        totalOrders: number;
        thisWeek: number;
        lastWeek: number;
        thisMonth: number;
        lastMonth: number;
    }>;
    getTotalCustomers(): Promise<number>;
    getNewCustomers(start: Date, end: Date): Promise<number>;
    getActiveCustomers(since: Date): Promise<number>;
    getCorporateClients(): Promise<number>;
    getNewCorporateClients(start: Date, end: Date): Promise<number>;
    getLoyaltyMembers(minOrders?: number): Promise<number>;
    getLogsBetween(start: Date, end: Date): Promise<({
        order: {
            branchId: string | null;
            notes: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            length: number | null;
            width: number | null;
            customerId: string;
            receiverId: string | null;
            serviceType: import(".prisma/client").$Enums.ServiceType;
            fulfillmentType: import(".prisma/client").$Enums.FulfillmentType;
            trackingCode: string;
            weight: number;
            category: string[];
            isFragile: boolean;
            shipmentType: import(".prisma/client").$Enums.ShipmentType | null;
            shippingScope: import(".prisma/client").$Enums.ShippingScope | null;
            quantity: number | null;
            height: number | null;
            pickupDate: Date | null;
            deliveryDate: Date | null;
            cost: number | null;
            isUnusual: boolean;
            unusualReason: string | null;
            status: import(".prisma/client").$Enums.OrderStatus;
            validatedBy: string | null;
            validatedNotes: string | null;
            pickupDriverId: string | null;
            deliveryDriverId: string | null;
            pickupAddressId: string | null;
            deliveryAddressId: string | null;
            pickupConfirmed: boolean;
            dropoffConfirmed: boolean;
            actualPickupDate: Date | null;
            actualDropoffDate: Date | null;
            distance: number | null;
            validatedAt: Date | null;
            pickupAssignedBy: string | null;
            pickupAssignedAt: Date | null;
            deliveryAssignedBy: string | null;
            deliveryAssignedAt: Date | null;
            estimatedDeliveryAt: Date | null;
            actualDeliveryAt: Date | null;
            batchId: string | null;
            tariffId: string | null;
            finalPrice: number | null;
            currency: string | null;
            optimizationJobId: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        createdBy: string | null;
        airportFee: import("@prisma/client/runtime/library").JsonValue | null;
        weight: number;
        orderId: string;
        distance: number | null;
        finalPrice: number;
        currency: string;
        surcharges: import("@prisma/client/runtime/library").JsonValue;
        discounts: import("@prisma/client/runtime/library").JsonValue;
        miscFees: import("@prisma/client/runtime/library").JsonValue;
        baseRate: number;
        appliedRate: number;
        profit: import("@prisma/client/runtime/library").JsonValue;
    })[]>;
}
