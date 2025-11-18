import { DispatchUseCasesImpl } from './dispatch.usecase.impl';
import { AssignDriverForPickup, AssignOfficerForBatch, BatchDispatchDto, BatchHandoverDto, CompleteDeliveryDto, ConfirmBatchHandoverDto, CreateAssignmentRequestsDto, CreateDriver, GenerateQrDto, LastMileDeliveryDto, OrderScanTokenDto } from './dispatch.entity';
import { IResponse } from '../../common/types';
import { ListQueryDto } from '../../common/query/query.dto';
export declare class DispatchMessageController {
    private readonly usecases;
    constructor(usecases: DispatchUseCasesImpl);
    assignDriverForPickup(payoad: {
        data: AssignDriverForPickup;
        user: any;
    }): Promise<any>;
    createBatchDispatch(payload: {
        data: BatchDispatchDto;
        user: any;
    }): Promise<any>;
    findDispatches(payload: {
        query: ListQueryDto;
    }): Promise<any>;
    addOrdersToBatch(payload: {
        data: any;
        batchId: string;
        newOrderIds: string[];
        user: any;
    }): Promise<any>;
    assignOfficerToBatch(payload: {
        data: AssignOfficerForBatch;
        user: any;
    }): Promise<any>;
    collectBatchByCargoOfficer(payload: {
        data: AssignOfficerForBatch;
        user: any;
    }): Promise<any>;
    handoverBatchesToAirport(payload: {
        data: BatchHandoverDto;
        user: any;
    }): Promise<any>;
    collectFromAirport(payload: {
        data: OrderScanTokenDto;
        user: any;
    }): Promise<any>;
    comapreOrders(payload: {
        officerId: string;
        user: any;
    }): Promise<any>;
    arriveAndInbound(payload: {
        data: ConfirmBatchHandoverDto;
    }): Promise<any>;
    getDeliveredAndOnGoingDispatches(payload: {
        user: any;
    }): Promise<any>;
    assignDriverForDelivery(payload: {
        data: AssignDriverForPickup;
        user: any;
    }): Promise<any>;
    lastMileDelivery(payload: {
        data: LastMileDeliveryDto;
        user: any;
    }): Promise<any>;
    completeDelivery(payload: {
        data: CompleteDeliveryDto;
        user: any;
    }): Promise<any>;
    removeDriverFromOrder(payload: {
        orderId: string;
    }): Promise<any>;
    changeDriverForOrder(payload: {
        data: AssignDriverForPickup;
    }): Promise<any>;
    generateQrCode(payload: {
        data: GenerateQrDto;
    }): Promise<IResponse<any[]>>;
    createDriver(payload: {
        data: CreateDriver;
    }): Promise<IResponse<{
        id: string;
        updatedAt: Date | null;
        createdBy: string | null;
        userId: string;
        type: import(".prisma/client").$Enums.DriverType;
        status: import(".prisma/client").$Enums.DriverStatus;
        vehicleId: string | null;
        availablityStatus: import(".prisma/client").$Enums.DriverAvailabilityStatus;
        licenseNumber: string | null;
        licenseExpiry: Date | null;
        licenseIssue: Date | null;
        frontImageUrl: string | null;
        backImageUrl: string | null;
        verifiedByOCR: boolean;
        currentLat: number | null;
        currentLon: number | null;
    }>>;
    findDriver(payload: {
        query: ListQueryDto;
    }): Promise<IResponse<{
        drivers: ({
            user: {
                name: string;
                email: string;
                phone: string;
                id: string;
            };
            vehicles: {
                id: string;
                status: import(".prisma/client").$Enums.VehicleStatus;
                plateNumber: string;
                model: string;
            }[];
        } & {
            id: string;
            updatedAt: Date | null;
            createdBy: string | null;
            userId: string;
            type: import(".prisma/client").$Enums.DriverType;
            status: import(".prisma/client").$Enums.DriverStatus;
            vehicleId: string | null;
            availablityStatus: import(".prisma/client").$Enums.DriverAvailabilityStatus;
            licenseNumber: string | null;
            licenseExpiry: Date | null;
            licenseIssue: Date | null;
            frontImageUrl: string | null;
            backImageUrl: string | null;
            verifiedByOCR: boolean;
            currentLat: number | null;
            currentLon: number | null;
        })[];
        pagination: {
            total: number;
            page: number;
            pageSize: number;
            totalPages: number;
        };
    }>>;
    createDriverAssignmentRequests(payload: {
        data: CreateAssignmentRequestsDto;
        user: any;
    }): Promise<IResponse<unknown>>;
    driverAccept(payload: {
        orderId: string;
        user: any;
    }): Promise<IResponse<{
        assigned: boolean;
        reason: string;
    } | {
        assigned: boolean;
        reason?: undefined;
    }>>;
}
