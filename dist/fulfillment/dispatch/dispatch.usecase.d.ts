import { AssignDriverForPickup, AssignOfficerForBatch, BatchDispatchDto, BatchHandoverDto, CompleteDeliveryDto, ConfirmBatchHandoverDto } from './dispatch.entity';
import { ListQueryDto } from '../../common/query/query.dto';
export interface DispatchUseCases {
    assignDriverForPickup(data: AssignDriverForPickup, userId: string): Promise<any>;
    assignDriverForDelivery(data: AssignDriverForPickup): Promise<any>;
    assignDriverToOrder(data: AssignDriverForPickup, userId: string): Promise<any>;
    lastMileDelivery(orderId: string, driverId: string, userId: string, notes?: string): Promise<any>;
    completeDelivery(dto: CompleteDeliveryDto, userId: string): Promise<any>;
    removeDriverFromOrder(orderId: string): Promise<any>;
    changeDriverForOrder(data: AssignDriverForPickup): Promise<any>;
    createBatchDispatch(dto: BatchDispatchDto, userId: string): Promise<any>;
    getBatches(query: ListQueryDto): Promise<any>;
    getDeliveredAndOnGoingDispatches(userId: any): Promise<any>;
    confirmDispatch(data: AssignOfficerForBatch, userId: string): Promise<any>;
    collectBatchByCargoOfficer(data: AssignOfficerForBatch, userId: string): Promise<any>;
    deliverBatchToAirport(data: BatchHandoverDto, userId: string): Promise<any>;
    addOrdersToBatch(batchId: string, newOrderIds: string[], userId: string, updateData?: Partial<BatchDispatchDto>): Promise<any>;
    prepareQRCodes(input: {
        batchId: string;
        orderIds: string[];
        updateData?: Partial<BatchDispatchDto>;
    }): Promise<any>;
    scanOrder(officerId: string, scannedToken: string, userId: string): Promise<any>;
    compareOrders(officerId: string, userId: string): Promise<any>;
    confirmHandover(dto: ConfirmBatchHandoverDto): Promise<any>;
    findDriver(query: ListQueryDto): Promise<any>;
    confirmHandover(dto: ConfirmBatchHandoverDto): Promise<any>;
}
