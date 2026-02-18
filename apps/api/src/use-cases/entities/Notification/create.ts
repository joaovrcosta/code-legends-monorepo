import { Notification, NotificationType } from "@prisma/client";
import { INotificationRepository } from "../../../repositories/notification-repository";
import { UserNotFoundError } from "../../errors/user-not-found";
import { IUsersRepository } from "../../../repositories/users-repository";

interface CreateNotificationRequest {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: Record<string, unknown> | null;
}

interface CreateNotificationResponse {
    notification: Notification;
}

export class CreateNotificationUseCase {
    constructor(
        private notificationRepository: INotificationRepository,
        private usersRepository: IUsersRepository
    ) { }

    async execute(
        data: CreateNotificationRequest
    ): Promise<CreateNotificationResponse> {
        // Verificar se o usuário existe
        const user = await this.usersRepository.findById(data.userId);

        if (!user) {
            throw new UserNotFoundError();
        }

        const notification = await this.notificationRepository.create({
            userId: data.userId,
            type: data.type,
            title: data.title,
            message: data.message,
            data: data.data ?? null,
        });

        return {
            notification,
        };
    }
}
