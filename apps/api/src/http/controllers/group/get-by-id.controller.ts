import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeGetGroupByIdUseCase } from "../../../utils/factories/make-get-group-by-id-use-case";
import { GroupNotFoundError } from "../../../use-cases/errors/group-not-found";

export async function getById(request: FastifyRequest, reply: FastifyReply) {
  const getGroupByIdParamsSchema = z.object({
    id: z.coerce.number(),
  });

  const { id } = getGroupByIdParamsSchema.parse(request.params);

  try {
    const getGroupByIdUseCase = makeGetGroupByIdUseCase();

    const { group } = await getGroupByIdUseCase.execute({ id });

    return reply.status(200).send({ group });
  } catch (error) {
    if (error instanceof GroupNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }

    return reply.status(500).send({ message: "Internal server error" });
  }
}
