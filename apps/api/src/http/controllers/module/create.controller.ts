import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeCreateModuleUseCase } from "../../../utils/factories/make-create-module-use-case";
import { ModuleAlreadyExistsError } from "../../../use-cases/errors/module-already-exists";
import { CourseNotFoundError } from "../../../use-cases/errors/course-not-found";

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const createModuleParamsSchema = z.object({
    courseId: z.string(),
  });

  const createModuleBodySchema = z.object({
    title: z.string(),
    slug: z.string(),
  });

  const { courseId } = createModuleParamsSchema.parse(request.params);
  const { title, slug } = createModuleBodySchema.parse(request.body);

  try {
    const createModuleUseCase = makeCreateModuleUseCase();

    const { module } = await createModuleUseCase.execute({
      title,
      slug,
      courseId,
    });

    return reply.status(201).send({ module });
  } catch (error) {
    if (error instanceof ModuleAlreadyExistsError) {
      return reply.status(409).send({ message: error.message });
    }

    if (error instanceof CourseNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }

    return reply.status(500).send({ message: "Internal server error" });
  }
}
