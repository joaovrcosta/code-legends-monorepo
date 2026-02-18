import { FastifyReply, FastifyRequest } from "fastify";
import { makeGetUnreadCountUseCase } from "../../../utils/factories/make-get-unread-count-use-case";

export async function getUnreadCount(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const getUnreadCountUseCase = makeGetUnreadCountUseCase();

    const { count } = await getUnreadCountUseCase.execute({
      userId: request.user.id,
    });

    return reply.status(200).send({ count });
  } catch (error) {
    return reply.status(500).send({ message: "Internal server error" });
  }
}
