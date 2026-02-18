import { PrismaNotificationRepository } from "../../repositories/prisma/prisma-notification-repository";
import { DeleteNotificationUseCase } from "../../use-cases/entities/Notification/delete";

export function makeDeleteNotificationUseCase() {
  const notificationRepository = new PrismaNotificationRepository();

  return new DeleteNotificationUseCase(notificationRepository);
}
