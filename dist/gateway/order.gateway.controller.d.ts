import { ClientProxy } from '@nestjs/microservices';
import { AcceptDropOffDto, AddException, ApproveOrderDto, CancelOrderDto, ConfirmPickUpOrderDto, CreateOrderDto, MarkUnusualOrderDto, UpdateOrderDto, ValidateOrderDto } from '../fulfillment/order/order.entity';
import { ListQueryDto } from '../common/query/query.dto';
export declare class OrderGatewayController {
    private readonly orderClient;
    constructor(orderClient: ClientProxy);
    createOrder(data: CreateOrderDto, req: any): Promise<import("rxjs").Observable<any>>;
    orderCreateValidate(data: CreateOrderDto, req: any): Promise<import("rxjs").Observable<any>>;
    acceptDropOffOrder(data: AcceptDropOffDto, req: any): Promise<import("rxjs").Observable<any>>;
    confirmPickup(data: ConfirmPickUpOrderDto, req: any): Promise<import("rxjs").Observable<any>>;
    validateOrder(data: ValidateOrderDto, id: string, req: any): Promise<import("rxjs").Observable<any>>;
    unusualOrder(data: MarkUnusualOrderDto, orderId: string, req: any): Promise<import("rxjs").Observable<any>>;
    approveOrder(data: ApproveOrderDto, req: any): Promise<import("rxjs").Observable<any>>;
    cancelOrder(data: CancelOrderDto, req: any): Promise<import("rxjs").Observable<any>>;
    exceptionOrder(data: AddException, req: any): Promise<import("rxjs").Observable<any>>;
    getException(req: any, query: ListQueryDto): Promise<import("rxjs").Observable<any>>;
    updateException(data: UpdateOrderDto, orderId: string, req: any): Promise<import("rxjs").Observable<any>>;
    getAllOrders(req: any, query: ListQueryDto): Promise<import("rxjs").Observable<any>>;
    getPendingApprovalOrders(req: any, query: ListQueryDto): Promise<import("rxjs").Observable<any>>;
    getOrderStatusLog(req: any, query: ListQueryDto): Promise<import("rxjs").Observable<any>>;
    getCategoricalOrders(req: any, query: ListQueryDto): Promise<import("rxjs").Observable<any>>;
    trackOrder(code: string, req: any): Promise<import("rxjs").Observable<any>>;
    trackUserOrder(code: string, req: any): Promise<import("rxjs").Observable<any>>;
    updateOrder(id: string, data: UpdateOrderDto, req: any): Promise<import("rxjs").Observable<any>>;
    getMyOrders(req: any, query: ListQueryDto): Promise<import("rxjs").Observable<any>>;
    getOrder(id: string, req: any): Promise<import("rxjs").Observable<any>>;
}
