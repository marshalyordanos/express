import { Injectable } from '@nestjs/common';
import { NotificationUseCase } from './notification.usecase';
import { NotificationRepository } from './notification.repository';
import { ListQueryDto } from '../../common/query/query.dto';
import { handleCatch } from '../../common/handleCatch';

@Injectable()
export class NotificationUseCasesImpl implements NotificationUseCase {
  constructor(
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async getNotification(userId: string, query: ListQueryDto) {
    try {
      return await this.notificationRepository.getUserNotifications(
        userId,
        // true,
        query,
      );
    } catch (error) {
      handleCatch(error);
    }
  }
  async markNotificationAsRead(userId: string, notificationId: string) {
    try {
      await this.notificationRepository.markAsRead(notificationId);
      return { message: 'Notification marked as read' };
    } catch (error) {
      handleCatch(error);
    }
  }

  async storePushToken(userId: string, data: string) {
   try {
    return this.notificationRepository.storePushToken(userId, data);
   } catch (error) {
    handleCatch(error);
   }
  }
}
