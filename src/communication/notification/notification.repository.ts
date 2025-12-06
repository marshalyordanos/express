import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ListQueryDto } from '../../common/query/query.dto';
import { PrismaQueryFeature } from '../../common/query/prisma-query-feature';

@Injectable()
export class NotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async markAsRead(notificationId: string) {
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });
  }

  async getUserNotifications(
    userId: string,
    unreadOnly = false,
    payload: ListQueryDto = {},
  ) {
    const feature = new PrismaQueryFeature({
      search: payload?.search,
      filter: payload?.filter,
      sort: payload?.sort,
      page: payload?.page,
      pageSize: payload?.pageSize,
      searchableFields: ['type', 'message'],
    });

    const query = feature.getQuery();

    const whereCondition = unreadOnly
      ? { userId, read: false, ...query.where }
      : { userId, ...query.where };

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        ...query,
        where: whereCondition,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where: whereCondition }),
    ]);

    return {
      notifications,
      pagination: feature.getPagination(total),
    };
  }
}
