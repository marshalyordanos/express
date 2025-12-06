import { Injectable } from "@nestjs/common";
import { NotificationUseCase } from "./notification.usecase";
import { NotificationRepository } from "./notification.repository";
import { ListQueryDto } from "../../common/query/query.dto";



@Injectable()
export class NotificationUseCasesImpl implements NotificationUseCase {

    constructor(
        private readonly notificationRepository: NotificationRepository,
      ) {}
    
   async getNotification(userId: string, query: ListQueryDto){
        return await this.notificationRepository.getUserNotifications(userId, true, query)
    }
   async markNotificationAsRead(userId: string, notificationId: string){
     await this.notificationRepository.markAsRead(notificationId)
     return {"message": "Notification marked as read"}
    }

}