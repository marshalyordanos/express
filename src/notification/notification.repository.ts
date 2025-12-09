import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ListQueryDto } from '../common/query/query.dto';
import { PrismaQueryFeature } from '../common/query/prisma-query-feature';

@Injectable()
export class NotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

 async getExpoPushTokens(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        expoPushToken: true,
      },
    })
  }
  async findOrderById(orderId: any) {
    return this.prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        branch: {
          select: { id: true },
        },
      },
    });
  }

  async getStaff() {
    return this.prisma.user.findMany({
      where: {
        role: {
          name: 'OPERATIONAL_MANAGER',
        },
      },
      select: {
        id: true,
        branchId: true,
      },
    });
  }

  async createNotification(data: {
    userId: string;
    type: string;
    message: string;
    payload?: any;
  }) {
    return this.prisma.notification.create({
      data: { ...data, read: false },
    });
  }

  async markAsRead(notificationId: string) {
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });
  }

  async getUserNotifications(userId: string, unreadOnly = false) {
    return this.prisma.notification.findMany({
      where: unreadOnly ? { userId, read: false } : { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUserPrefs(userId: any) {
    return this.prisma.userNotificationPreferences.findUnique({
      where: { userId },
    });
  }

  async findUser(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
    });
  }

  async findUsersByEmail(emails: string[]) {
    if (!emails || emails.length === 0) return [];

    return this.prisma.user.findMany({
      where: {
        email: {
          in: emails,
        },
      },
      select: {
        id: true,
        email: true,
      },
    });
  }

  async findUsersByRole(roleId: string) {
    return this.prisma.user.findMany({
      where: { roleId },
    });
  }

  async findAllNotifications(payload: ListQueryDto, userId: string) {
    const feature = new PrismaQueryFeature({
      search: payload.search,
      filter: payload.filter,
      sort: payload.sort,
      page: payload.page,
      pageSize: payload.pageSize,
      searchableFields: ['type', 'read'],
    });

    const query = feature.getQuery();
    // ✅ Always filter by userId
    const where = {
      userId, // ✅ Force notifications of this user
      ...(query.where || {}), // ✅ Merge existing dynamic filters
    };

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        ...query,
        where,
        orderBy: { createdAt: 'desc' },
      }),

      this.prisma.notification.count({ where }),
    ]);
    return {
      notifications,
      pagination: feature.getPagination(total),
    };
  }

  async findNotification(userId: string, id: string) {
    return this.prisma.notification.findUnique({
      where: { id, userId },
    });
  }
}
