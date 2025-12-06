import { Controller, UseGuards, Req } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CheckPermission } from '../../common/decorator/check-permission.decorator';
import { PermissionGuard } from '../../common/permission.guard';
import { RateLimitGuard } from '../../common/rate-limit.guard';
import { IResponse } from '../../common/types';
import { PATTERNS } from '../../contracts';
import { PermissionActions } from '../../contracts/permission-actions.enum';
import { NotificationUseCasesImpl } from './notification.usecase.impl';
import { ListQueryDto } from '../../common/query/query.dto';

@Controller('notification')
export class NotificationMessageController {
  constructor(private readonly notificationService: NotificationUseCasesImpl) {}

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Notification', PermissionActions.READ)
  @MessagePattern(PATTERNS.NOTIFICATION_GET_USER_NOTIFICATIONS)
  async getNotification(@Payload() payload: { user: any, query: ListQueryDto }) {
    const userId = payload.user.sub;
    const result = await this.notificationService.getNotification(userId, payload.query);
    return IResponse.success('Notification Fetched successfully', result);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Notification', PermissionActions.UPDATE)
  @MessagePattern(PATTERNS.NOTIFICATION_MARK_AS_READ)
  async markNotificationAsRead(@Payload() payload: { user: any; id: string }) {
    const userId = payload.user.sub;
    const result = await this.notificationService.markNotificationAsRead(
      userId,
      payload.id,
    );
    return IResponse.success('Notification Marked successfully as read.', result);
  }
}
