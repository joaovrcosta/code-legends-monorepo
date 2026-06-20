import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeAddLessonDislikeUseCase } from "../../../utils/factories/make-add-lesson-dislike-use-case";
import { DislikeAlreadyExistsError } from "../../../use-cases/errors/dislike-already-exists";
import { LessonNotFoundError } from "../../../use-cases/errors/lesson-not-found";

export async function addLessonDislike(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({
    id: z.coerce.number().int().positive(),
  });

  const { id: lessonId } = paramsSchema.parse(request.params);

  try {
    const useCase = makeAddLessonDislikeUseCase();
    const result = await useCase.execute({
      userId: request.user.id,
      lessonId,
    });

    return reply.status(201).send(result);
  } catch (error) {
    if (error instanceof DislikeAlreadyExistsError) {
      return reply.status(409).send({ message: error.message });
    }

    if (error instanceof LessonNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }

    return reply.status(500).send({ message: "Internal server error" });
  }
}
