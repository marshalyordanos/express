import { ListQueryDto } from "../../common/query/query.dto";
import { AddException, CancelOrderDto, CreateOrderDto, UpdateOrderDto, ValidateOrderDto } from "./order.entity";
import { OrderStatus,ServiceType } from '@prisma/client'; // assuming you use Prisma enums



export interface OrderUseCases {
    createOrder(data: CreateOrderDto): Promise<any>;
    acceptDropOff(trackingCode: string): Promise<any>;
    getAllOrders(query: ListQueryDto): Promise<any>;
    getOrderById(id: string): Promise<any>;
    updateOrder(id: string, data: any): Promise<any>;
    deleteOrder(id: string): Promise<any>;
    updateOrderStatus(id: string, data: any): Promise<any>;
    updateOrderType(id: string, data: any): Promise<any>;
    updateOrderDriver(id: string, data: any): Promise<any>;
    confirmPickupOrder(orderId: string, driverId: string): Promise<any>;
    validateOrder(orderId: string, data: ValidateOrderDto,): Promise<any>;
    trackOrder(code: string): Promise<any>;
    markUnusualOrder(orderId: string, data: any): Promise<any>;
    approveOrder(orderId: string,reason: string): Promise<any>;
    getOrdersGroupedByScope(data: any): Promise<any>;
    getOrderStatusLog(query: ListQueryDto): Promise<any>;
    cancelOrder(data: CancelOrderDto): Promise<any>;
    addException(data: AddException): Promise<any>;
    getPendingApproval(query: ListQueryDto): Promise<any>;
    updateOrder(orderId: string, data: UpdateOrderDto): Promise<any>;
    getException(query: ListQueryDto ): Promise<any>
}