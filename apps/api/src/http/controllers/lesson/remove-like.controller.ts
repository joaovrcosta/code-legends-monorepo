import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeRemoveLessonLikeUseCase } from "../../../utils/factories/make-remove-lesson-like-use-case";
import { LikeNotFoundError } from "../../../use-cases/errors/like-not-found";

export async function removeLessonLike(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({
    id: z.coerce.number().int().positive(),
  });

  const { id: lessonId } = paramsSchema.parse(request.params);

  try {
    const useCase = makeRemoveLessonLikeUseCase();
    const result = await useCase.execute({
      userId: request.user.id,
      lessonId,
    });

    return reply.status(200).send(result);
  } catch (error) {
    if (error instanceof LikeNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }

    return reply.status(500).send({ message: "Internal server error" });
  }
}
