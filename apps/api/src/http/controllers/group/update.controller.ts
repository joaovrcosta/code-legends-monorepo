import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeUpdateGroupUseCase } from "../../../utils/factories/make-update-group-use-case";
import { GroupNotFoundError } from "../../../use-cases/errors/group-not-found";
import { GroupAlreadyExistsError } from "../../../use-cases/errors/group-already-exists";

export async function update(request: FastifyRequest, reply: FastifyReply) {
  const updateGroupParamsSchema = z.object({
    id: z.coerce.number(),
  });

  const updateGroupBodySchema = z.object({
    title: z.string().optional(),
  });

  const { id } = updateGroupParamsSchema.parse(request.params);
  const { title } = updateGroupBodySchema.parse(request.body);

  try {
    const updateGroupUseCase = makeUpdateGroupUseCase();

    const { group } = await updateGroupUseCase.execute({
      id,
      title,
    });

    return reply.status(200).send({ group });
  } catch (error) {
    if (error instanceof GroupNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }

    if (error instanceof GroupAlreadyExistsError) {
      return reply.status(409).send({ message: error.message });
    }

    return reply.status(500).send({ message: "Internal server error" });
  }
}
