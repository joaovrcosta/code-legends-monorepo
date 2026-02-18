import { FastifyReply, FastifyRequest } from "fastify";
import { makeDeleteNotificationUseCase } from "../../../utils/factories/make-delete-notification-use-case";
import { NotificationNotFoundError } from "../../../use-cases/errors/notification-not-found";

export async function remove(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };

  try {
    const deleteNotificationUseCase = makeDeleteNotificationUseCase();

    const { success } = await deleteNotificationUseCase.execute({
      id,
      userId: request.user.id,
    });

    return reply.status(200).send({ success });
  } catch (error) {
    if (error instanceof NotificationNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }

    return reply.status(500).send({ message: "Internal server error" });
  }
}
