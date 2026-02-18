import { PrismaNotificationRepository } from "../../repositories/prisma/prisma-notification-repository";
import { GetUnreadCountUseCase } from "../../use-cases/entities/Notification/get-unread-count";

export function makeGetUnreadCountUseCase() {
  const notificationRepository = new PrismaNotificationRepository();

  return new GetUnreadCountUseCase(notificationRepository);
}
