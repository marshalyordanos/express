"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const prisma_query_feature_1 = require("../common/query/prisma-query-feature");
let NotificationRepository = class NotificationRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createNotification(data) {
        return this.prisma.notification.create({
            data: { ...data, read: false },
        });
    }
    async markAsRead(notificationId) {
        return this.prisma.notification.update({
            where: { id: notificationId },
            data: { read: true },
        });
    }
    async getUserNotifications(userId, unreadOnly = false) {
        return this.prisma.notification.findMany({
            where: unreadOnly ? { userId, read: false } : { userId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getUserPrefs(userId) {
        return this.prisma.userNotificationPreferences.findUnique({
            where: { userId },
        });
    }
    async findUser(userId) {
        return this.prisma.user.findUnique({
            where: { id: userId },
        });
    }
    async findUsersByEmail(emails) {
        if (!emails || emails.length === 0)
            return [];
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
    async findUsersByRole(roleId) {
        return this.prisma.user.findMany({
            where: { roleId },
        });
    }
    async findAllNotifications(payload, userId) {
        const feature = new prisma_query_feature_1.PrismaQueryFeature({
            search: payload.search,
            filter: payload.filter,
            sort: payload.sort,
            page: payload.page,
            pageSize: payload.pageSize,
            searchableFields: ['type', 'read'],
        });
        const query = feature.getQuery();
        const where = {
            userId,
            ...(query.where || {}),
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
    async findNotification(userId, id) {
        return this.prisma.notification.findUnique({
            where: { id, userId },
        });
    }
};
exports.NotificationRepository = NotificationRepository;
exports.NotificationRepository = NotificationRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationRepository);
//# sourceMappingURL=notification.repository.js.map