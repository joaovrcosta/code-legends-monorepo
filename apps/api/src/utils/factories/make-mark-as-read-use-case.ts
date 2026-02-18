import { PrismaNotificationRepository } from "../../repositories/prisma/prisma-notification-repository";
import { MarkAsReadUseCase } from "../../use-cases/entities/Notification/mark-as-read";

export function makeMarkAsReadUseCase() {
  const notificationRepository = new PrismaNotificationRepository();

  return new MarkAsReadUseCase(notificationRepository);
}
