import { CreateOrderDto, ValidateOrderDto } from "./order.entity";
import { OrderStatus,ServiceType } from '@prisma/client'; // assuming you use Prisma enums



export interface OrderUseCases {
    createOrder(data: CreateOrderDto): Promise<any>;
    acceptDropOff(trackingCode: string): Promise<any>;
    getAllOrders(data: any): Promise<any>;
    getOrderById(id: string): Promise<any>;
    updateOrder(id: string, data: any): Promise<any>;
    deleteOrder(id: string): Promise<any>;
    updateOrderStatus(id: string, data: any): Promise<any>;
    updateOrderType(id: string, data: any): Promise<any>;
    updateOrderDriver(id: string, data: any): Promise<any>;
    confirmPickupOrder(orderId: string, driverId: string): Promise<any>;
    validateOrder(orderId: string, data: ValidateOrderDto,): Promise<any>;
    trackOrder(code: string): Promise<any>;
    getOrderByBranch(id: string, data: any): Promise<any>;
    getOrderByCustomer(id: string, data: any): Promise<any>;
    getOrderByStatus(status: OrderStatus, data: any): Promise<any>;
    getOrderByDriver(id: string, data: any): Promise<any>;
    getOrderByType(type: ServiceType, data: any): Promise<any>;
    getOrderByPayment(payment: string): Promise<any>;
    getOrderByFullfillmentType(type: string, data: any): Promise<any>;
    approveOrder(orderId: string,reason: string): Promise<any>;
    getFragileOrders(data: any): Promise<any>;
    getUnusualOrders(data: any): Promise<any>;
    getPendingOrders(data: any): Promise<any>;
    getPendingApprovalOrders(data: any): Promise<any>;
    getPendingPickupOrders(data: any): Promise<any>;
}