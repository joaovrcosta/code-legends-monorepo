import { Notification, NotificationType } from "@prisma/client";

export interface CreateNotificationData {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: Record<string, unknown> | null;
}

interface FindByUserIdFilters {
    read?: boolean;
    type?: NotificationType;
    limit?: number;
    cursor?: string;
}

export interface INotificationRepository {
    create(data: CreateNotificationData): Promise<Notification>;
    findById(id: string): Promise<Notification | null>;
    findByUserId(userId: string, filters?: FindByUserIdFilters): Promise<Notification[]>;
    findUnreadByUserId(userId: string): Promise<Notification[]>;
    countUnreadByUserId(userId: string): Promise<number>;
    markAsRead(id: string, userId: string): Promise<Notification>;
    markAllAsRead(userId: string): Promise<void>;
    delete(id: string, userId: string): Promise<void>;
    deleteAllRead(userId: string): Promise<void>;
}
