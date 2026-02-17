import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeGetRequestsByUserIdUseCase } from "../../../utils/factories/make-get-requests-by-user-id-use-case";

export async function getByUserId(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const getRequestsByUserIdParamsSchema = z.object({
    userId: z.string(),
  });

  const getRequestsByUserIdQuerySchema = z.object({
    status: z.string().optional(),
  });

  const { userId } = getRequestsByUserIdParamsSchema.parse(request.params);
  const { status } = getRequestsByUserIdQuerySchema.parse(request.query);

  try {
    const getRequestsByUserIdUseCase = makeGetRequestsByUserIdUseCase();

    const { requests } = await getRequestsByUserIdUseCase.execute(
      userId,
      status
    );

    return reply.status(200).send({ requests });
  } catch (error) {
    return reply.status(500).send({ message: "Internal server error" });
  }
}
