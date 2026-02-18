import { INotificationRepository } from "../../../repositories/notification-repository";

interface MarkAllAsReadRequest {
    userId: string;
}

interface MarkAllAsReadResponse {
    success: boolean;
}

export class MarkAllAsReadUseCase {
    constructor(private notificationRepository: INotificationRepository) { }

    async execute(
        data: MarkAllAsReadRequest
    ): Promise<MarkAllAsReadResponse> {
        await this.notificationRepository.markAllAsRead(data.userId);

        return {
            success: true,
        };
    }
}
