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
        message: string;
        id: string;
        createdAt: Date;
        createdBy: string | null;
        userId: string;
        type: string;
        read: boolean;
        payload: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    markAsRead(notificationId: string): Promise<{
        message: string;
        id: string;
        createdAt: Date;
        createdBy: string | null;
        userId: string;
        type: string;
        read: boolean;
        payload: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    getUserNotifications(userId: string, unreadOnly?: boolean): Promise<{
        message: string;
        id: string;
        createdAt: Date;
        createdBy: string | null;
        userId: string;
        type: string;
        read: boolean;
        payload: import("@prisma/client/runtime/library").JsonValue | null;
    }[]>;
    getUserPrefs(userId: any): Promise<{
        email: boolean;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        inApp: boolean;
        push: boolean;
        userId: string;
    }>;
    findUser(userId: string): Promise<{
        name: string;
        email: string;
        password: string;
        branchId: string | null;
        customerType: import(".prisma/client").$Enums.CustomerType | null;
        phone: string | null;
        id: string;
        customId: string | null;
        createdAt: Date;
        updatedAt: Date;
        emailVerified: boolean;
        roleId: string | null;
        isStaff: boolean;
        isSuperAdmin: boolean;
        emergencyContactName: string | null;
        emergencyContactPhone: string | null;
        isActive: boolean;
        customerCategoryId: string | null;
        createdBy: string | null;
    }>;
    findUsersByEmail(emails: string[]): Promise<{
        email: string;
        id: string;
    }[]>;
    findUsersByRole(roleId: string): Promise<{
        name: string;
        email: string;
        password: string;
        branchId: string | null;
        customerType: import(".prisma/client").$Enums.CustomerType | null;
        phone: string | null;
        id: string;
        customId: string | null;
        createdAt: Date;
        updatedAt: Date;
        emailVerified: boolean;
        roleId: string | null;
        isStaff: boolean;
        isSuperAdmin: boolean;
        emergencyContactName: string | null;
        emergencyContactPhone: string | null;
        isActive: boolean;
        customerCategoryId: string | null;
        createdBy: string | null;
    }[]>;
    findAllNotifications(payload: ListQueryDto, userId: string): Promise<{
        notifications: {
            message: string;
            id: string;
            createdAt: Date;
            createdBy: string | null;
            userId: string;
            type: string;
            read: boolean;
            payload: import("@prisma/client/runtime/library").JsonValue | null;
        }[];
        pagination: {
            total: number;
            page: number;
            pageSize: number;
            totalPages: number;
        };
    }>;
    findNotification(userId: string, id: string): Promise<{
        message: string;
        id: string;
        createdAt: Date;
        createdBy: string | null;
        userId: string;
        type: string;
        read: boolean;
        payload: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
}
