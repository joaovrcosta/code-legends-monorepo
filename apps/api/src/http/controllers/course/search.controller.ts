import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeSearchCoursesByNameUseCase } from "../../../utils/factories/make-search-courses-by-name-use-case";
import { sanitizeCourses } from "../../utils/sanitize";

export async function search(request: FastifyRequest, reply: FastifyReply) {
  const searchCoursesQuerySchema = z.object({
    q: z.string().min(1, "O termo de busca é obrigatório"),
  });

  const { q } = searchCoursesQuerySchema.parse(request.query);

  try {
    const searchCoursesByNameUseCase = makeSearchCoursesByNameUseCase();

    // Incluir userId se o usuário estiver autenticado
    const userId = request.user?.id;

    const { courses } = await searchCoursesByNameUseCase.execute({
      name: q,
      userId,
    });

    // Sanitizar cursos para garantir que dados de instrutor sejam públicos apenas
    const sanitized = sanitizeCourses(courses);

    return reply.status(200).send({ courses: sanitized });
  } catch (error) {
    return reply.status(500).send({ message: "Internal server error" });
  }
}

