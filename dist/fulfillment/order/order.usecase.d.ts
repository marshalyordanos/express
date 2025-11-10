import { ListQueryDto } from '../../common/query/query.dto';
import { AddException, CancelOrderDto, CreateOrderDto, UpdateOrderDto, ValidateOrderDto } from './order.entity';
export interface OrderUseCases {
    createOrder(data: CreateOrderDto, user: string): Promise<any>;
    acceptDropOff(trackingCode: string): Promise<any>;
    getAllOrders(query: ListQueryDto): Promise<any>;
    getOrderById(id: string): Promise<any>;
    updateOrder(id: string, data: any, userId: string): Promise<any>;
    deleteOrder(id: string): Promise<any>;
    confirmPickupOrder(orderId: string, driverId: string, userId: string): Promise<any>;
    validateOrder(orderId: string, data: ValidateOrderDto, userId: string): Promise<any>;
    trackOrder(code: string, userId: string): Promise<any>;
    markUnusualOrder(orderId: string, data: any): Promise<any>;
    approveOrder(orderId: string, reason: string, userId: string): Promise<any>;
    getOrdersGroupedByScope(data: any): Promise<any>;
    getOrderStatusLog(query: ListQueryDto): Promise<any>;
    cancelOrder(data: CancelOrderDto, userId: string): Promise<any>;
    addException(data: AddException, userId: string): Promise<any>;
    getPendingApproval(query: ListQueryDto): Promise<any>;
    updateOrder(orderId: string, data: UpdateOrderDto, userId: string): Promise<any>;
    getException(query: ListQueryDto): Promise<any>;
    trackUserOrder(code: string, userId: string): Promise<any>;
}
