import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeListPopularCoursesUseCase } from "../../../utils/factories/make-list-popular-courses-use-case";
import { sanitizeCourses } from "../../utils/sanitize";

export async function listPopular(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const listPopularCoursesQuerySchema = z.object({
    limit: z.coerce.number().optional().default(10),
  });

  const { limit } = listPopularCoursesQuerySchema.parse(request.query);

  try {
    const listPopularCoursesUseCase = makeListPopularCoursesUseCase();

    const { courses } = await listPopularCoursesUseCase.execute({ limit });

    // Sanitizar cursos para garantir que dados de instrutor sejam públicos apenas
    const sanitized = sanitizeCourses(courses);

    return reply.status(200).send({ courses: sanitized });
  } catch (error) {
    return reply.status(500).send({ message: "Internal server error" });
  }
}
