import { Course } from "@prisma/client";
import { ICourseRepository } from "../../../repositories/course-repository";
import { IUserCourseRepository } from "../../../repositories/user-course-repository";

interface SearchCoursesByNameRequest {
  name: string;
  userId?: string; // Opcional: para verificar se está inscrito
}

interface CourseWithEnrollment extends Course {
  isEnrolled: boolean;
}

interface SearchCoursesByNameResponse {
  courses: CourseWithEnrollment[];
}

export class SearchCoursesByNameUseCase {
  constructor(
    private courseRepository: ICourseRepository,
    private userCourseRepository: IUserCourseRepository
  ) {}

  async execute(
    request: SearchCoursesByNameRequest
  ): Promise<SearchCoursesByNameResponse> {
    // Buscar cursos por nome (1 query)
    const courses = await this.courseRepository.searchByName(request.name);

    // Se houver userId, verificar inscrições de uma vez (1 query adicional)
    let enrolledCourseIds = new Set<string>();
    if (request.userId) {
      const userCourses = await this.userCourseRepository.findByUserId(
        request.userId
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

