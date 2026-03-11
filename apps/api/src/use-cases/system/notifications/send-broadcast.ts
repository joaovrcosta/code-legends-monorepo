import { INotificationRepository } from "../../../repositories/notification-repository";
import { IUsersRepository } from "../../../repositories/users-repository";
import { NotificationType, UserPlan } from "@prisma/client";

interface SendBroadcastUseCaseRequest {
  title: string;
  message: string;
  type: NotificationType;
  targetPlan?: UserPlan | "ALL";
  data?: any;
}

interface SendBroadcastUseCaseResponse {
  notificationsSent: number;
}

export class SendBroadcastUseCase {
  constructor(
    private notificationRepository: INotificationRepository,
    private usersRepository: IUsersRepository
  ) {}

  async execute({
    title,
    message,
    type,
    targetPlan,
    data,
  }: SendBroadcastUseCaseRequest): Promise<SendBroadcastUseCaseResponse> {
    const users = await this.usersRepository.findByPlan(targetPlan || "ALL");

    if (users.length === 0) {
      return { notificationsSent: 0 };
    }

    const notificationsToCreate = users.map((u) => ({
      userId: u.id,
      title,
      message,
      type,
      data,
    }));

    // createMany in batches of 500 to avoid query size limits
    let totalSent = 0;
    const BATCH_SIZE = 500;
    for (let i = 0; i < notificationsToCreate.length; i += BATCH_SIZE) {
      const batch = notificationsToCreate.slice(i, i + BATCH_SIZE);
      const result = await this.notificationRepository.createMany(batch);
      totalSent += result.count;
    }

    return { notificationsSent: totalSent };
  }
}
