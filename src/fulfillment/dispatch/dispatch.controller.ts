import { Controller } from "@nestjs/common";
import { MessagePattern } from "@nestjs/microservices";
import { Public } from "src/common/decorator/public.decorator";
import { PATTERNS } from "src/contracts";
import { DispatchUseCasesImpl } from "./dispatch.usecase.impl";
import { AssignDriverForPickup } from "./dispatch.entity";
import { IResponse } from "src/common/types";


@Controller()
export class DispatchMessageController {
    constructor(private readonly usecases: DispatchUseCasesImpl) {}

    @Public()
    @MessagePattern(PATTERNS.DISPATCH_ASSIGN_DRIVER_FOR_PICKUP)
    async assignDriverForPickup(data: AssignDriverForPickup): Promise<any> {
        return this.usecases.assignDriverForPickup(data);
    }

    @Public()
    @MessagePattern(PATTERNS.DISPATCH_ASSIGN_DRIVER_FOR_DELIVERY)
    async assignDriverForDelivery(data: AssignDriverForPickup): Promise<any> {
        return this.usecases.assignDriverForDelivery(data);
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