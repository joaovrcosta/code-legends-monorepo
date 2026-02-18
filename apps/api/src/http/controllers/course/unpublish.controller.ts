import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeUnpublishCourseUseCase } from "../../../utils/factories/make-unpublish-course-use-case";
import { CourseNotFoundError } from "../../../use-cases/errors/course-not-found";

export async function unpublish(request: FastifyRequest, reply: FastifyReply) {
  const unpublishCourseParamsSchema = z.object({
    id: z.string(),
  });

  const { id } = unpublishCourseParamsSchema.parse(request.params);

  try {
    const unpublishCourseUseCase = makeUnpublishCourseUseCase();

    const { course } = await unpublishCourseUseCase.execute({
      courseId: id,
    });

    return reply.status(200).send({ course });
  } catch (error) {
    if (error instanceof CourseNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }

    return reply.status(500).send({ message: "Internal server error" });
  }
}
