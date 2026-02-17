import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeDeleteRequestUseCase } from "../../../utils/factories/make-delete-request-use-case";
import { RequestNotFoundError } from "../../../use-cases/errors/request-not-found";

export async function remove(request: FastifyRequest, reply: FastifyReply) {
  const deleteRequestParamsSchema = z.object({
    id: z.string(),
  });

  const { id } = deleteRequestParamsSchema.parse(request.params);

  try {
    const deleteRequestUseCase = makeDeleteRequestUseCase();

    await deleteRequestUseCase.execute(id);

    return reply.status(204).send();
  } catch (error) {
    if (error instanceof RequestNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }

    return reply.status(500).send({ message: "Internal server error" });
  }
}
