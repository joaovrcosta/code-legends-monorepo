import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeGetModuleBySlugUseCase } from "../../../utils/factories/make-get-module-by-slug-use-case";
import { ModuleNotFoundError } from "../../../use-cases/errors/module-not-found";

export async function getBySlug(request: FastifyRequest, reply: FastifyReply) {
  const getModuleBySlugParamsSchema = z.object({
    slug: z.string(),
  });

  const { slug } = getModuleBySlugParamsSchema.parse(request.params);

  try {
    const getModuleBySlugUseCase = makeGetModuleBySlugUseCase();

    const { module } = await getModuleBySlugUseCase.execute({ slug });

    return reply.status(200).send({ module });
  } catch (error) {
    if (error instanceof ModuleNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }

    return reply.status(500).send({ message: "Internal server error" });
  }
}
