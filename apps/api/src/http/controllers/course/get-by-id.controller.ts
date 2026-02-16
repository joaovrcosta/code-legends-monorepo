import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeGetCourseByIdUseCase } from "../../../utils/factories/make-get-course-by-id-use-case";
import { CourseNotFoundError } from "../../../use-cases/errors/course-not-found";
import { sanitizeCourse } from "../../utils/sanitize";

export async function getById(request: FastifyRequest, reply: FastifyReply) {
  const getCourseByIdParamsSchema = z.object({
    id: z.string(),
  });

  const { id } = getCourseByIdParamsSchema.parse(request.params);

  try {
    const getCourseByIdUseCase = makeGetCourseByIdUseCase();

    const { course } = await getCourseByIdUseCase.execute({ id });

    // Sanitizar curso para garantir que dados de instrutor sejam públicos apenas
    const sanitized = sanitizeCourse(course);

    return reply.status(200).send({ course: sanitized });
  } catch (error) {
    if (error instanceof CourseNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }

    return reply.status(500).send({ message: "Internal server error" });
  }
}
