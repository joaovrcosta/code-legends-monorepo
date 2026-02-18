import { PrismaNotificationRepository } from "../../repositories/prisma/prisma-notification-repository";
import { ListNotificationsUseCase } from "../../use-cases/entities/Notification/list";

export function makeListNotificationsUseCase() {
  const notificationRepository = new PrismaNotificationRepository();

  return new ListNotificationsUseCase(notificationRepository);
}
