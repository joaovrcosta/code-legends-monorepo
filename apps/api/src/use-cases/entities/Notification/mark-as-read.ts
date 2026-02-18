import { Notification } from "@prisma/client";
import { INotificationRepository } from "../../../repositories/notification-repository";
import { NotificationNotFoundError } from "../../errors/notification-not-found";

interface MarkAsReadRequest {
    id: string;
    userId: string;
}

interface MarkAsReadResponse {
    notification: Notification;
}

export class MarkAsReadUseCase {
    constructor(private notificationRepository: INotificationRepository) { }

    async execute(data: MarkAsReadRequest): Promise<MarkAsReadResponse> {
        try {
            const notification = await this.notificationRepository.markAsRead(
                data.id,
                data.userId
            );

            return {
                notification,
            };
        } catch (error) {
            if (error instanceof NotificationNotFoundError) {
                throw error;
            }
            throw new NotificationNotFoundError();
        }
    }
}
