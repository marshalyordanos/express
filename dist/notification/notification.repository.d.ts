import { PrismaService } from '../prisma/prisma.service';
import { ListQueryDto } from '../common/query/query.dto';
export declare class NotificationRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createNotification(data: {
        userId: string;
        type: string;
        message: string;
        payload?: any;
    }): Promise<{
        type: string;
        message: string;
        id: string;
        payload: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        createdBy: string | null;
        userId: string;
        read: boolean;
    }>;
    markAsRead(notificationId: string): Promise<{
        type: string;
        message: string;
        id: string;
        payload: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        createdBy: string | null;
        userId: string;
        read: boolean;
    }>;
    getUserNotifications(userId: string, unreadOnly?: boolean): Promise<{
        type: string;
        message: string;
        id: string;
        payload: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        createdBy: string | null;
        userId: string;
        read: boolean;
    }[]>;
    getUserPrefs(userId: any): Promise<{
        push: boolean;
        id: string;
        email: boolean;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        inApp: boolean;
    }>;
    findUser(userId: string): Promise<{
        password: string;
        name: string;
        id: string;
        email: string;
        phone: string | null;
        branchId: string | null;
        createdAt: Date;
        updatedAt: Date;
        emailVerified: boolean;
        roleId: string | null;
        isStaff: boolean;
        isSuperAdmin: boolean;
        customerType: import(".prisma/client").$Enums.CustomerType | null;
        customerCategoryId: string | null;
        createdBy: string | null;
    }>;
    findUsersByEmail(emails: string[]): Promise<{
        id: string;
        email: string;
    }[]>;
    findUsersByRole(roleId: string): Promise<{
        password: string;
        name: string;
        id: string;
        email: string;
        phone: string | null;
        branchId: string | null;
        createdAt: Date;
        updatedAt: Date;
        emailVerified: boolean;
        roleId: string | null;
        isStaff: boolean;
        isSuperAdmin: boolean;
        customerType: import(".prisma/client").$Enums.CustomerType | null;
        customerCategoryId: string | null;
        createdBy: string | null;
    }[]>;
    findAllNotifications(payload: ListQueryDto, userId: string): Promise<{
        notifications: {
            type: string;
            message: string;
            id: string;
            payload: import("@prisma/client/runtime/library").JsonValue | null;
            createdAt: Date;
            createdBy: string | null;
            userId: string;
            read: boolean;
        }[];
        pagination: {
            total: number;
            page: number;
            pageSize: number;
            totalPages: number;
        };
    }>;
    findNotification(userId: string, id: string): Promise<{
        type: string;
        message: string;
        id: string;
        payload: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        createdBy: string | null;
        userId: string;
        read: boolean;
    }>;
}
