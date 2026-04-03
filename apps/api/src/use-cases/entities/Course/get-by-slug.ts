import { Course } from "@prisma/client";
import { ICourseRepository } from "../../../repositories/course-repository";
import { CourseNotFoundError } from "../../errors/course-not-found";
import { calculateCourseTotalDuration } from "../../../utils/calculate-course-duration";

interface GetCourseBySlugRequest {
  slug: string;
  includeDrafts?: boolean; // Opcional: para admin ver cursos em draft
}

interface GetCourseBySlugResponse {
  course: Course;
  totalDuration: string | null;
}

export class GetCourseBySlugUseCase {
  constructor(private courseRepository: ICourseRepository) { }

  async execute({
    slug,
    includeDrafts = false,
  }: GetCourseBySlugRequest): Promise<GetCourseBySlugResponse> {
    const course = await this.courseRepository.findBySlug(slug);

    if (!course) {
      throw new CourseNotFoundError();
    }

    // Público: apenas curso publicado (inclui ocultar DRAFT e REVIEW)
    if (!includeDrafts && course.status !== "PUBLISHED") {
      throw new CourseNotFoundError();
    }

    // Calcula a duração total do curso (não bloqueia se houver erro)
    let totalDuration: string | null = null;
    try {
      totalDuration = await calculateCourseTotalDuration(course.id);
    } catch (error) {
      // Se houver erro no cálculo, continua sem a duração
      console.error("Erro ao calcular duração do curso:", error);
    }

    return {
      course,
      totalDuration,
    };
  }
}
