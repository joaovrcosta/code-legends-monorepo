import { FastifyReply, FastifyRequest } from "fastify";
import { makeMarkAllAsReadUseCase } from "../../../utils/factories/make-mark-all-as-read-use-case";

export async function markAllAsRead(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const markAllAsReadUseCase = makeMarkAllAsReadUseCase();

    const { success } = await markAllAsReadUseCase.execute({
      userId: request.user.id,
    });

    return reply.status(200).send({ success });
  } catch (error) {
    return reply.status(500).send({ message: "Internal server error" });
  }
}
