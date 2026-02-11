import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeListRecentCoursesUseCase } from "../../../utils/factories/make-list-recent-courses-use-case";
import { sanitizeCourses } from "../../utils/sanitize";

export async function listRecent(request: FastifyRequest, reply: FastifyReply) {
  const listRecentCoursesQuerySchema = z.object({
    limit: z.coerce.number().optional().default(10),
  });

  const { limit } = listRecentCoursesQuerySchema.parse(request.query);

  try {
    const listRecentCoursesUseCase = makeListRecentCoursesUseCase();

    const { courses } = await listRecentCoursesUseCase.execute({ limit });

    // Sanitizar cursos para garantir que dados de instrutor sejam públicos apenas
    const sanitized = sanitizeCourses(courses);

    return reply.status(200).send({ courses: sanitized });
  } catch (error) {
    return reply.status(500).send({ message: "Internal server error" });
  }
}
