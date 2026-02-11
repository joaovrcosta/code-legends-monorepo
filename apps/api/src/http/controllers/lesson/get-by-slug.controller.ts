import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeGetLessonBySlugUseCase } from "../../../utils/factories/make-get-lesson-by-slug-use-case";
import { LessonNotFoundError } from "../../../use-cases/errors/lesson-not-found";

export async function getBySlug(request: FastifyRequest, reply: FastifyReply) {
  const getLessonBySlugParamsSchema = z.object({
    slug: z.string(),
  });

  const { slug } = getLessonBySlugParamsSchema.parse(request.params);

  try {
    const getLessonBySlugUseCase = makeGetLessonBySlugUseCase();

    const { lesson } = await getLessonBySlugUseCase.execute({ slug });

    return reply.status(200).send({ lesson });
  } catch (error) {
    if (error instanceof LessonNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }

    return reply.status(500).send({ message: "Internal server error" });
  }
}
