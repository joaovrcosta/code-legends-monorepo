import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeDeleteModuleUseCase } from "../../../utils/factories/make-delete-module-use-case";
import { ModuleNotFoundError } from "../../../use-cases/errors/module-not-found";

export async function remove(request: FastifyRequest, reply: FastifyReply) {
  const deleteModuleParamsSchema = z.object({
    id: z.string(),
  });

  const { id } = deleteModuleParamsSchema.parse(request.params);

  try {
    const deleteModuleUseCase = makeDeleteModuleUseCase();

    await deleteModuleUseCase.execute({ id });

    return reply.status(204).send();
  } catch (error) {
    if (error instanceof ModuleNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }

    return reply.status(500).send({ message: "Internal server error" });
  }
}
