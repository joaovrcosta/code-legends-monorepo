import { Notification, NotificationType, Prisma } from "@prisma/client";
import { INotificationRepository, CreateNotificationData } from "../notification-repository";
import { prisma } from "../../lib/prisma";
import { NotificationNotFoundError } from "../../use-cases/errors/notification-not-found";

interface FindByUserIdFilters {
  read?: boolean;
  type?: NotificationType;
  limit?: number;
  cursor?: string;
}

export class PrismaNotificationRepository implements INotificationRepository {
  async create(data: CreateNotificationData): Promise<Notification> {
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        data: data.data ?? null,
      },
    });

    return notification;
  }

  async findById(id: string): Promise<Notification | null> {
    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    return notification;
  }

  async findByUserId(
    userId: string,
    filters?: FindByUserIdFilters
  ): Promise<Notification[]> {
    const where: Prisma.NotificationWhereInput = {
      userId,
    };

    if (filters?.read !== undefined) {
      where.read = filters.read;
    }

    if (filters?.type) {
      where.type = filters.type;
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      take: filters?.limit ?? 50,
      ...(filters?.cursor && {
        cursor: { id: filters.cursor },
        skip: 1,
      }),
    });

    return notifications;
  }

  async findUnreadByUserId(userId: string): Promise<Notification[]> {
    const notifications = await prisma.notification.findMany({
      where: {
        userId,
        read: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return notifications;
  }

  async countUnreadByUserId(userId: string): Promise<number> {
    const count = await prisma.notification.count({
      where: {
        userId,
        read: false,
      },
    });

    return count;
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    // Verificar se a notificação existe e pertence ao usuário
    const notification = await this.findById(id);

    if (!notification) {
      throw new NotificationNotFoundError();
    }

    if (notification.userId !== userId) {
      throw new NotificationNotFoundError();
    }

    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: {
        read: true,
        readAt: new Date(),
      },
    });

    return updatedNotification;
  }

  async markAllAsRead(userId: string): Promise<void> {
    await prisma.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });
  }

  async delete(id: string, userId: string): Promise<void> {
    // Verificar se a notificação existe e pertence ao usuário
    const notification = await this.findById(id);

    if (!notification) {
      throw new NotificationNotFoundError();
    }

    if (notification.userId !== userId) {
      throw new NotificationNotFoundError();
    }

    await prisma.notification.delete({
      where: { id },
    });
  }

  async deleteAllRead(userId: string): Promise<void> {
    await prisma.notification.deleteMany({
      where: {
        userId,
        read: true,
      },
    });
  }
}
