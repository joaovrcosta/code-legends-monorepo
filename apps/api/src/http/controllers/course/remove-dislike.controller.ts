import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeRemoveCourseDislikeUseCase } from "../../../utils/factories/make-remove-course-dislike-use-case";
import { DislikeNotFoundError } from "../../../use-cases/errors/dislike-not-found";

export async function removeCourseDislike(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({
    id: z.string(),
  });

  const { id: courseId } = paramsSchema.parse(request.params);

  try {
    const useCase = makeRemoveCourseDislikeUseCase();
    const result = await useCase.execute({
      userId: request.user.id,
      courseId,
    });

    return reply.status(200).send(result);
  } catch (error) {
    if (error instanceof DislikeNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }

    return reply.status(500).send({ message: "Internal server error" });
  }
}
