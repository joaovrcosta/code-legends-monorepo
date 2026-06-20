import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeAddCourseLikeUseCase } from "../../../utils/factories/make-add-course-like-use-case";
import { LikeAlreadyExistsError } from "../../../use-cases/errors/like-already-exists";
import { CourseNotFoundError } from "../../../use-cases/errors/course-not-found";

export async function addCourseLike(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({
    id: z.string(),
  });

  const { id: courseId } = paramsSchema.parse(request.params);

  try {
    const useCase = makeAddCourseLikeUseCase();
    const result = await useCase.execute({
      userId: request.user.id,
      courseId,
    });

    return reply.status(201).send(result);
  } catch (error) {
    if (error instanceof LikeAlreadyExistsError) {
      return reply.status(409).send({ message: error.message });
    }

    if (error instanceof CourseNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }

    return reply.status(500).send({ message: "Internal server error" });
  }
}
