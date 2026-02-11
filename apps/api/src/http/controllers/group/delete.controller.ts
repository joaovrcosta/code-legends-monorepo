import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeDeleteGroupUseCase } from "../../../utils/factories/make-delete-group-use-case";
import { GroupNotFoundError } from "../../../use-cases/errors/group-not-found";

export async function remove(request: FastifyRequest, reply: FastifyReply) {
  const deleteGroupParamsSchema = z.object({
    id: z.coerce.number(),
  });

  const { id } = deleteGroupParamsSchema.parse(request.params);

  try {
    const deleteGroupUseCase = makeDeleteGroupUseCase();

    await deleteGroupUseCase.execute({ id });

    return reply.status(204).send();
  } catch (error) {
    if (error instanceof GroupNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }

    return reply.status(500).send({ message: "Internal server error" });
  }
}
