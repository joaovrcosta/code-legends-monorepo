import { FastifyReply, FastifyRequest } from "fastify";
import { makeMarkAllAsReadUseCase } from "../../../utils/factories/make-mark-all-as-read-use-case";
import { sseManager } from "../../../utils/sse-manager";
import { makeGetUnreadCountUseCase } from "../../../utils/factories/make-get-unread-count-use-case";

export async function markAllAsRead(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const markAllAsReadUseCase = makeMarkAllAsReadUseCase();

    const { success } = await markAllAsReadUseCase.execute({
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
        type: "all_notifications_read",
      });
    } catch (sseError) {
      // Falha no SSE não deve quebrar o fluxo
    }

    return reply.status(200).send({ success });
  } catch (error) {
    return reply.status(500).send({ message: "Internal server error" });
  }
}
