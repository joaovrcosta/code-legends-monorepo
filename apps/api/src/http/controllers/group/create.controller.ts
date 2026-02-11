import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeCreateGroupUseCase } from "../../../utils/factories/make-create-group-use-case";
import { GroupAlreadyExistsError } from "../../../use-cases/errors/group-already-exists";
import { ModuleNotFoundError } from "../../../use-cases/errors/module-not-found";

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const createGroupParamsSchema = z.object({
    moduleId: z.string(),
  });

  const createGroupBodySchema = z.object({
    title: z.string(),
  });

  const { moduleId } = createGroupParamsSchema.parse(request.params);
  const { title } = createGroupBodySchema.parse(request.body);

  try {
    const createGroupUseCase = makeCreateGroupUseCase();

    const { group } = await createGroupUseCase.execute({
      title,
      moduleId,
    });

    return reply.status(201).send({ group });
  } catch (error) {
    if (error instanceof GroupAlreadyExistsError) {
      return reply.status(409).send({ message: error.message });
    }

    if (error instanceof ModuleNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }

    return reply.status(500).send({ message: "Internal server error" });
  }
}
