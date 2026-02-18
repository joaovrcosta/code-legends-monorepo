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

    // Se não for admin e o curso estiver em draft, retornar erro
    if (!includeDrafts && course.status === "DRAFT") {
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
