import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeDeleteCourseUseCase } from "../../../utils/factories/make-delete-course-use-case";
import { CourseNotFoundError } from "../../../use-cases/errors/course-not-found";

export async function remove(request: FastifyRequest, reply: FastifyReply) {
  const deleteCourseParamsSchema = z.object({
    id: z.string(),
  });

  const { id } = deleteCourseParamsSchema.parse(request.params);

  try {
    const deleteCourseUseCase = makeDeleteCourseUseCase();

    await deleteCourseUseCase.execute({ id });

    return reply.status(204).send();
  } catch (error) {
    if (error instanceof CourseNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }

    return reply.status(500).send({ message: "Internal server error" });
  }
}
