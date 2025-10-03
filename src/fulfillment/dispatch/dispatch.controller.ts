import { Body, Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { Public } from "../../common/decorator/public.decorator";
import { PATTERNS } from "../../contracts";
import { DispatchUseCasesImpl } from "./dispatch.usecase.impl";
import { AssignDriverForPickup, AssignOfficerForBatch, BatchDispatchDto, BatchHandoverDto, CompleteDeliveryDto, ConfirmBatchHandoverDto, LastMileDeliveryDto } from "./dispatch.entity";
import { IResponse } from "../../common/types";
import { ListQueryDto } from "../../common/query/query.dto";


@Controller()
export class DispatchMessageController {
    constructor(private readonly usecases: DispatchUseCasesImpl) {}

    @Public()
    @MessagePattern(PATTERNS.DISPATCH_ASSIGN_DRIVER_FOR_PICKUP)
    async assignDriverForPickup(data: AssignDriverForPickup): Promise<any> {
        return this.usecases.assignDriverForPickup(data);
    }

    @Public()
    @MessagePattern(PATTERNS.DISPATCH_APPROVE_CATEGORIZATION)
    async createBatchDispatch(data: BatchDispatchDto): Promise<any> {
        const result = await this.usecases.createBatchDispatch(data);

        return IResponse.success('Batch Dispatch created successfully', result);
    }

    @Public()
    @MessagePattern(PATTERNS.DISPATCH_FIND_ALL)
    async findDispatches(@Payload() payload: { query: ListQueryDto } ): Promise<any> {
        console.log('body: ', payload.query);
        return this.usecases.getBatches(payload.query);
    }

    @Public()
    @MessagePattern(PATTERNS.DISPATCH_ADD_ORDERS_TO_BATCH)
    async addOrdersToBatch(data: any): Promise<any> {
        const { batchId, newOrderIds, body } = data;
        console.log('data: ', data);
        return this.usecases.addOrdersToBatch(batchId, newOrderIds, body);
    }

    @Public()
    @MessagePattern(PATTERNS.DISPATCH_ASSIGN_OFFICER_TO_BATCH)
    async assignOfficerToBatch(data: AssignOfficerForBatch): Promise<any> {
        return this.usecases.confirmDispatch(data);
    }

    @Public()
    @MessagePattern(PATTERNS.DISPATCH_COLLECT_BATCH_BY_CARGO_OFFICER)
    async collectBatchByCargoOfficer(data: any): Promise<any> {
        return this.usecases.collectBatchByCargoOfficer(data);
    }

    @Public()
    @MessagePattern(PATTERNS.DISPATCH_HAND_OVER_BATCHES_TO_AIRPORT)
    async handoverBatchesToAirport(data: BatchHandoverDto): Promise<any> {
        return this.usecases.deliverBatchToAirport(data);
    }

    @Public()
    @MessagePattern(PATTERNS.DISPATCH_COLLECT_FROM_AIRPORT)
    async collectFromAirport(data: any): Promise<any> {
        return this.usecases.scanOrder(data.officerId, data.scannedToken);
    }

    @Public()
    @MessagePattern(PATTERNS.DISPATCH_COMPARE_SCANNED_ORDERS)
    async comapreOrders(officerId: string): Promise<any> {
        return this.usecases.compareOrders(officerId);
    }

    @Public()
    @MessagePattern(PATTERNS.DISPATCH_CONFIRM_ARRIVAL_AND_HANDOVER)
    async arriveAndInbound(data: ConfirmBatchHandoverDto): Promise<any> {
        return this.usecases.confirmHandover(data);
    }

    @Public()
    @MessagePattern(PATTERNS.DISPATCH_ASSIGN_DRIVER_FOR_DELIVERY)
    async assignDriverForDelivery(data: AssignDriverForPickup): Promise<any> {
        return this.usecases.assignDriverToOrder(data);
    }

    @Public()
    @MessagePattern(PATTERNS.DISPATCH_ACCEPT_LAST_MILE_DELIVERY)
    async lastMileDelivery(data: LastMileDeliveryDto): Promise<any> {
        return this.usecases.lastMileDelivery(data.orderId, data.driverId, data.notes);
    }

    @Public()
    @MessagePattern(PATTERNS.DISPATCH_COMPLETE_DELIVERY)
    async completeDelivery(data: CompleteDeliveryDto): Promise<any> {
        return this.usecases.completeDelivery(data.orderId, data.driverId, data.notes);
    }

    @Public()
    @MessagePattern(PATTERNS.DISPATCH_REMOVE_DRIVER_FROM_ORDER)
    async removeDriverFromOrder(orderId: string): Promise<any> {
        const result= await this.usecases.removeDriverFromOrder(orderId);
        return IResponse.success('Driver removed successfully', result);
    }

    @Public()
    @MessagePattern(PATTERNS.DISPATCH_CHANGE_DRIVER_FOR_ORDER)
    async changeDriverForOrder(data: AssignDriverForPickup): Promise<any> {

        const result = await this.usecases.changeDriverForOrder(data);

        return IResponse.success('Driver changed successfully', result);
    }


}