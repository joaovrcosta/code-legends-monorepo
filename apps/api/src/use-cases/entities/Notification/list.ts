import { Notification, NotificationType } from "@prisma/client";
import { INotificationRepository } from "../../../repositories/notification-repository";

interface ListNotificationsRequest {
    userId: string;
    read?: boolean;
    type?: NotificationType;
    limit?: number;
    cursor?: string;
}

interface ListNotificationsResponse {
    notifications: Notification[];
}

export class ListNotificationsUseCase {
    constructor(private notificationRepository: INotificationRepository) { }

    async execute(
        data: ListNotificationsRequest
    ): Promise<ListNotificationsResponse> {
        const notifications = await this.notificationRepository.findByUserId(
            data.userId,
            {
                read: data.read,
                type: data.type,
                limit: data.limit ?? 50,
                cursor: data.cursor,
            }
        );

        return {
            notifications,
        };
    }
}
