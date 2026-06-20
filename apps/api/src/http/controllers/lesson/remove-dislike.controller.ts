import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeRemoveLessonDislikeUseCase } from "../../../utils/factories/make-remove-lesson-dislike-use-case";
import { DislikeNotFoundError } from "../../../use-cases/errors/dislike-not-found";

export async function removeLessonDislike(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({
    id: z.coerce.number().int().positive(),
  });

  const { id: lessonId } = paramsSchema.parse(request.params);

  try {
    const useCase = makeRemoveLessonDislikeUseCase();
    const result = await useCase.execute({
      userId: request.user.id,
      lessonId,
    });

    return reply.status(200).send(result);
  } catch (error) {
    if (error instanceof DislikeNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }

    return reply.status(500).send({ message: "Internal server error" });
  }
}
