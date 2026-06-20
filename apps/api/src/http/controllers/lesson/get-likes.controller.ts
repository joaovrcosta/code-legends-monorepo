import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeGetLessonLikeStatusUseCase } from "../../../utils/factories/make-get-lesson-like-status-use-case";

export async function getLessonLikes(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({
    id: z.coerce.number().int().positive(),
  });

  const { id: lessonId } = paramsSchema.parse(request.params);
  const userId = request.user?.id;

  const useCase = makeGetLessonLikeStatusUseCase();
  const status = await useCase.execute({ userId, lessonId });

  return reply.status(200).send(status);
}
