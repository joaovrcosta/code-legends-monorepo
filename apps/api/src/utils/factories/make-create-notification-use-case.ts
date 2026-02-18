import { PrismaNotificationRepository } from "../../repositories/prisma/prisma-notification-repository";
import { PrismaUsersRepository } from "../../repositories/prisma/prisma-users-reposity";
import { CreateNotificationUseCase } from "../../use-cases/entities/Notification/create";

export function makeCreateNotificationUseCase() {
  const notificationRepository = new PrismaNotificationRepository();
  const usersRepository = new PrismaUsersRepository();

  return new CreateNotificationUseCase(notificationRepository, usersRepository);
}
