import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeAddCourseDislikeUseCase } from "../../../utils/factories/make-add-course-dislike-use-case";
import { DislikeAlreadyExistsError } from "../../../use-cases/errors/dislike-already-exists";
import { CourseNotFoundError } from "../../../use-cases/errors/course-not-found";

export async function addCourseDislike(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({
    id: z.string(),
  });

  const { id: courseId } = paramsSchema.parse(request.params);

  try {
    const useCase = makeAddCourseDislikeUseCase();
    const result = await useCase.execute({
      userId: request.user.id,
      courseId,
    });

    return reply.status(201).send(result);
  } catch (error) {
    if (error instanceof DislikeAlreadyExistsError) {
      return reply.status(409).send({ message: error.message });
    }

    if (error instanceof CourseNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }

    return reply.status(500).send({ message: "Internal server error" });
  }
}
