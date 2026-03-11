import { PrismaNotificationRepository } from "../../repositories/prisma/prisma-notification-repository";
import { PrismaUsersRepository } from "../../repositories/prisma/prisma-users-reposity";
import { SendBroadcastUseCase } from "../system/notifications/send-broadcast";

export function makeSendBroadcastUseCase() {
  const notificationRepository = new PrismaNotificationRepository();
  const usersRepository = new PrismaUsersRepository();
  const useCase = new SendBroadcastUseCase(notificationRepository, usersRepository);

  return useCase;
}
