import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeGetCourseLikeStatusUseCase } from "../../../utils/factories/make-get-course-like-status-use-case";

export async function getCourseLikes(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({
    id: z.string(),
  });

  const { id: courseId } = paramsSchema.parse(request.params);
  const userId = request.user?.id;

  const useCase = makeGetCourseLikeStatusUseCase();
  const status = await useCase.execute({ userId, courseId });

  return reply.status(200).send(status);
}
