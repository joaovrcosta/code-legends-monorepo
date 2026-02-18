import { Course } from "@prisma/client";
import { ICourseRepository } from "../../../repositories/course-repository";
import { IUserCourseRepository } from "../../../repositories/user-course-repository";
import { ICategoryRepository } from "../../../repositories/category-repository";

interface ListCoursesRequest {
  categoryId?: string;
  categorySlug?: string;
  instructorId?: string;
  search?: string;
  userId?: string; // Opcional: para verificar se está inscrito
  includeDrafts?: boolean; // Opcional: para admin ver todos os cursos
}

interface CourseWithEnrollment extends Course {
  isEnrolled: boolean;
}

interface ListCoursesResponse {
  courses: CourseWithEnrollment[];
}

export class ListCoursesUseCase {
  constructor(
    private courseRepository: ICourseRepository,
    private userCourseRepository: IUserCourseRepository,
    private categoryRepository: ICategoryRepository
  ) {}

  async execute(filters?: ListCoursesRequest): Promise<ListCoursesResponse> {
    let categoryId = filters?.categoryId;

    // Se categorySlug foi fornecido, buscar a categoria pelo slug
    if (filters?.categorySlug && !categoryId) {
      const category = await this.categoryRepository.findBySlug(
        filters.categorySlug
      );
      if (category) {
        categoryId = category.id;
      }
    }

    // Buscar cursos (1 query)
    const courses = await this.courseRepository.findAll({
      categoryId,
      instructorId: filters?.instructorId,
      search: filters?.search,
      includeDrafts: filters?.includeDrafts,
    });

    // Se houver userId, verificar inscrições de uma vez (1 query adicional)
    let enrolledCourseIds = new Set<string>();
    if (filters?.userId) {
      const userCourses = await this.userCourseRepository.findByUserId(
        filters.userId
      );
      enrolledCourseIds = new Set(userCourses.map((uc) => uc.courseId));
    }

    // Mapear isEnrolled (operação em memória - O(1) por curso)
    const coursesWithEnrollment: CourseWithEnrollment[] = courses.map(
      (course) => ({
        ...course,
        isEnrolled: enrolledCourseIds.has(course.id),
      })
    );

    return {
      courses: coursesWithEnrollment,
    };
  }
}
