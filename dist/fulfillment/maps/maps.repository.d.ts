import { ListQueryDto } from '../../common/query/query.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { OptimizationStatus, OptimizationType } from '@prisma/client';
export declare class MapsRepository {
    private prisma;
    constructor(prisma: PrismaService);
    createDriverLocation(body: any): Promise<any>;
    createDriver(body: any): Promise<any>;
    updateOptimizationJobStatus(jobId: string, status: OptimizationStatus): Promise<{
        id: string;
        createdAt: Date;
        createdBy: string | null;
        type: import(".prisma/client").$Enums.OptimizationType;
        driverId: string | null;
        status: import(".prisma/client").$Enums.OptimizationStatus;
        batchId: string | null;
        jobCode: string;
        totalDistance: number | null;
        totalDuration: number | null;
        completedAt: Date | null;
        optimizedOrder: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    createOptimizationJob(data: {
        driverId: string;
        jobCode: string;
        type: OptimizationType | string;
        status: OptimizationStatus | string;
        optimizedOrder: any;
        totalDistance: number;
        totalDuration: number;
    }): Promise<{
        id: string;
        createdAt: Date;
        createdBy: string | null;
        type: import(".prisma/client").$Enums.OptimizationType;
        driverId: string | null;
        status: import(".prisma/client").$Enums.OptimizationStatus;
        batchId: string | null;
        jobCode: string;
        totalDistance: number | null;
        totalDuration: number | null;
        completedAt: Date | null;
        optimizedOrder: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    upsertLocationFromCoords(data: {
        latitude: number;
        longitude: number;
        mapServiceResult?: {
            name?: string;
            address?: string;
            city?: string;
            country?: string;
        };
    }): Promise<{
        name: string | null;
        address: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        city: string | null;
        country: string | null;
        latitude: number;
        longitude: number;
    }>;
    findAddressByCoords(lat: string, long: string): Promise<{
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
    }>;
    findRouteByOriginDest(originId: string, destinationId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        distanceKm: number | null;
        originId: string;
        destinationId: string;
        durationMin: number | null;
        routePath: import("@prisma/client/runtime/library").JsonValue | null;
        optimized: boolean;
        trafficAware: boolean;
    }>;
    updateRoute(routeId: string, data: {
        distanceKm?: number;
        durationMin?: number;
        completed?: boolean;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        distanceKm: number | null;
        originId: string;
        destinationId: string;
        durationMin: number | null;
        routePath: import("@prisma/client/runtime/library").JsonValue | null;
        optimized: boolean;
        trafficAware: boolean;
    }>;
    upsertLocation(data: {
        latitude: number;
        longitude: number;
        name?: string;
    }): Promise<{
        name: string | null;
        address: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        city: string | null;
        country: string | null;
        latitude: number;
        longitude: number;
    }>;
    createRoute(data: {
        originId: string;
        destinationId: string;
        distanceKm: number;
        durationMin: number;
        routePath: any;
        optimized: boolean;
        trafficAware: boolean;
        optimizationJobId: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        distanceKm: number | null;
        originId: string;
        destinationId: string;
        durationMin: number | null;
        routePath: import("@prisma/client/runtime/library").JsonValue | null;
        optimized: boolean;
        trafficAware: boolean;
    }>;
    linkOrdersToOptimizationJob(optimizationJobId: string, orderIds: string[]): Promise<import(".prisma/client").Prisma.BatchPayload>;
    getDrivers(payload: ListQueryDto): Promise<any>;
    getDriverById(id: string): Promise<any>;
    findUserById(userId: string): Promise<{
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
    }>;
    findDriverById(driverId: string): Promise<{
        id: string;
        lat: number;
        lon: number;
    }>;
    findOrdersByDriverId(driverId: string): Promise<{
        orderId: string;
        lat: any;
        lon: any;
    }[]>;
}
