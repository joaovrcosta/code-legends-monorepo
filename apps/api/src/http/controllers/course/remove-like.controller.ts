import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeRemoveCourseLikeUseCase } from "../../../utils/factories/make-remove-course-like-use-case";
import { LikeNotFoundError } from "../../../use-cases/errors/like-not-found";

export async function removeCourseLike(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({
    id: z.string(),
  });

  const { id: courseId } = paramsSchema.parse(request.params);

  try {
    const useCase = makeRemoveCourseLikeUseCase();
    const result = await useCase.execute({
      userId: request.user.id,
      courseId,
    });

    return reply.status(200).send(result);
  } catch (error) {
    if (error instanceof LikeNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }

    return reply.status(500).send({ message: "Internal server error" });
  }
}
