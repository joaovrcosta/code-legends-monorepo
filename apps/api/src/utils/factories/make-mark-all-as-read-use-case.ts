import { PrismaNotificationRepository } from "../../repositories/prisma/prisma-notification-repository";
import { MarkAllAsReadUseCase } from "../../use-cases/entities/Notification/mark-all-as-read";

export function makeMarkAllAsReadUseCase() {
  const notificationRepository = new PrismaNotificationRepository();

  return new MarkAllAsReadUseCase(notificationRepository);
}
