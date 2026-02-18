import { Notification, NotificationType } from "@prisma/client";
import { INotificationRepository } from "../../../repositories/notification-repository";
import { UserNotFoundError } from "../../errors/user-not-found";
import { IUsersRepository } from "../../../repositories/users-repository";
import { sseManager } from "../../../utils/sse-manager";
import { makeGetUnreadCountUseCase } from "../../../utils/factories/make-get-unread-count-use-case";

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

        // Enviar atualização via SSE se o cliente estiver conectado
        try {
            console.log(`[CreateNotification] Criando notificação para userId: ${data.userId}`);
            const getUnreadCountUseCase = makeGetUnreadCountUseCase();
            const { count } = await getUnreadCountUseCase.execute({
                userId: data.userId,
            });
            
            console.log(`[CreateNotification] Contagem de não lidas: ${count}`);
            const sent = sseManager.sendToUser(data.userId, "notification", {
                count,
                type: "new_notification",
            });
            console.log(`[CreateNotification] SSE enviado: ${sent}`);
        } catch (sseError) {
            // Falha no SSE não deve quebrar o fluxo
            // Cliente pode não estar conectado, o que é normal
            console.error(`[CreateNotification] Erro ao enviar SSE:`, sseError);
        }

        return {
            notification,
        };
    }
}
