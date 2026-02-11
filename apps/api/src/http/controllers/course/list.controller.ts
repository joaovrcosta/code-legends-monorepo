import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeListCoursesUseCase } from "../../../utils/factories/make-list-courses-use-case";
import { sanitizeCourses } from "../../utils/sanitize";

export async function list(request: FastifyRequest, reply: FastifyReply) {
  const listCoursesQuerySchema = z.object({
    category: z.string().optional(),
    categorySlug: z.string().optional(),
    instructor: z.string().optional(),
    search: z.string().optional(),
  });

  const { category, categorySlug, instructor, search } =
    listCoursesQuerySchema.parse(request.query);

  try {
    const listCoursesUseCase = makeListCoursesUseCase();

    // Incluir userId se o usuário estiver autenticado
    const userId = request.user?.id;

    const { courses } = await listCoursesUseCase.execute({
      categoryId: category,
      categorySlug,
      instructorId: instructor,
      search,
      userId, // Passar userId opcional
    });

    // Sanitizar cursos para garantir que dados de instrutor sejam públicos apenas
    const sanitized = sanitizeCourses(courses);

    return reply.status(200).send({ courses: sanitized });
  } catch (error) {
    return reply.status(500).send({ message: "Internal server error" });
  }
}
