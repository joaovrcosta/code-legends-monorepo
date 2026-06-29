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
    forCareerId: z.string().optional(),
    kind: z.enum(["CATALOG", "PATH_UNIT"]).optional(),
  });

  const { category, categorySlug, instructor, search, forCareerId, kind } =
    listCoursesQuerySchema.parse(request.query);

  try {
    const listCoursesUseCase = makeListCoursesUseCase();

    // Incluir userId se o usuário estiver autenticado
    const userId = request.user?.id;
    // Incluir drafts se o usuário for admin
    const includeDrafts = request.user?.role === "ADMIN";

    if (forCareerId && request.user?.role !== "ADMIN") {
      return reply.status(403).send({ message: "Forbidden" });
    }

    const { courses } = await listCoursesUseCase.execute({
      categoryId: category,
      categorySlug,
      instructorId: instructor,
      search,
      userId, // Passar userId opcional
      includeDrafts, // Passar includeDrafts se for admin
      forCareerId,
      kind,
    });

    // Sanitizar cursos para garantir que dados de instrutor sejam públicos apenas
    const sanitized = sanitizeCourses(courses);

    return reply.status(200).send({ courses: sanitized });
  } catch (error) {
    return reply.status(500).send({ message: "Internal server error" });
  }
}
