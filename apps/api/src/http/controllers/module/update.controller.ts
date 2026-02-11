import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeUpdateModuleUseCase } from "../../../utils/factories/make-update-module-use-case";
import { ModuleNotFoundError } from "../../../use-cases/errors/module-not-found";
import { ModuleAlreadyExistsError } from "../../../use-cases/errors/module-already-exists";

export async function update(request: FastifyRequest, reply: FastifyReply) {
  const updateModuleParamsSchema = z.object({
    id: z.string(),
  });

  const updateModuleBodySchema = z.object({
    title: z.string().optional(),
    slug: z.string().optional(),
  });

  const { id } = updateModuleParamsSchema.parse(request.params);
  const { title, slug } = updateModuleBodySchema.parse(request.body);

  try {
    const updateModuleUseCase = makeUpdateModuleUseCase();

    const { module } = await updateModuleUseCase.execute({
      id,
      title,
      slug,
    });

    return reply.status(200).send({ module });
  } catch (error) {
    if (error instanceof ModuleNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }

    if (error instanceof ModuleAlreadyExistsError) {
      return reply.status(409).send({ message: error.message });
    }

    return reply.status(500).send({ message: "Internal server error" });
  }
}
