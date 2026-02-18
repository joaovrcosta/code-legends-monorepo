import { INotificationRepository } from "../../../repositories/notification-repository";

interface GetUnreadCountRequest {
    userId: string;
}

interface GetUnreadCountResponse {
    count: number;
}

export class GetUnreadCountUseCase {
    constructor(private notificationRepository: INotificationRepository) { }

    async execute(
        data: GetUnreadCountRequest
    ): Promise<GetUnreadCountResponse> {
        const count = await this.notificationRepository.countUnreadByUserId(
            data.userId
        );

        return {
            count,
        };
    }
}
