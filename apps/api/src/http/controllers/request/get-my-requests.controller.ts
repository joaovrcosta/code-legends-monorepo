import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeGetRequestsByUserIdUseCase } from "../../../utils/factories/make-get-requests-by-user-id-use-case";

export async function getMyRequests(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const getMyRequestsQuerySchema = z.object({
    status: z.string().optional(),
  });

  const { status } = getMyRequestsQuerySchema.parse(request.query);

  try {
    const getRequestsByUserIdUseCase = makeGetRequestsByUserIdUseCase();

    const { requests } = await getRequestsByUserIdUseCase.execute(
      request.user.id,
      status
    );

    return reply.status(200).send({ requests });
  } catch (error) {
    return reply.status(500).send({ message: "Internal server error" });
  }
}
