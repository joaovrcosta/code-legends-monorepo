import { FastifyReply, FastifyRequest } from "fastify";
import { makeMarkAsReadUseCase } from "../../../utils/factories/make-mark-as-read-use-case";
import { NotificationNotFoundError } from "../../../use-cases/errors/notification-not-found";
import { sseManager } from "../../../utils/sse-manager";
import { makeGetUnreadCountUseCase } from "../../../utils/factories/make-get-unread-count-use-case";

export async function markAsRead(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = request.params as { id: string };

  try {
    const markAsReadUseCase = makeMarkAsReadUseCase();

    const { notification } = await markAsReadUseCase.execute({
      id,
      userId: request.user.id,
    });

    // Atualizar contagem via SSE
    try {
      const getUnreadCountUseCase = makeGetUnreadCountUseCase();
      const { count } = await getUnreadCountUseCase.execute({
        userId: request.user.id,
      });
      
      sseManager.sendToUser(request.user.id, "notification", {
        count,
        type: "notification_read",
      });
    } catch (sseError) {
      // Falha no SSE não deve quebrar o fluxo
    }

    return reply.status(200).send({ notification });
  } catch (error) {
    if (error instanceof NotificationNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }

    return reply.status(500).send({ message: "Internal server error" });
  }
}
