import { INotificationRepository } from "../../../repositories/notification-repository";
import { NotificationNotFoundError } from "../../errors/notification-not-found";

interface DeleteNotificationRequest {
    id: string;
    userId: string;
}

interface DeleteNotificationResponse {
    success: boolean;
}

export class DeleteNotificationUseCase {
    constructor(private notificationRepository: INotificationRepository) { }

    async execute(
        data: DeleteNotificationRequest
    ): Promise<DeleteNotificationResponse> {
        try {
            await this.notificationRepository.delete(data.id, data.userId);

            return {
                success: true,
            };
        } catch (error) {
            if (error instanceof NotificationNotFoundError) {
                throw error;
            }
            throw new NotificationNotFoundError();
        }
    }
}
