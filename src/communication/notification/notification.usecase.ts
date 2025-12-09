import { ListQueryDto } from "../../common/query/query.dto";


export interface NotificationUseCase{
    getNotification(userId: string, query: ListQueryDto): Promise<any>;
    markNotificationAsRead(userId: string, notificationId: string): Promise<any>;
}