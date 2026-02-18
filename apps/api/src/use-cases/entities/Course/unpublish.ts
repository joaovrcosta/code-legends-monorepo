import { Course } from "@prisma/client";
import { ICourseRepository } from "../../../repositories/course-repository";
import { CourseNotFoundError } from "../../errors/course-not-found";

interface UnpublishCourseRequest {
  courseId: string;
}

interface UnpublishCourseResponse {
  course: Course;
}

export class UnpublishCourseUseCase {
  constructor(private courseRepository: ICourseRepository) {}

  async execute({
    courseId,
  }: UnpublishCourseRequest): Promise<UnpublishCourseResponse> {
    // Verificar se o curso existe
    const course = await this.courseRepository.findById(courseId);

    if (!course) {
      throw new CourseNotFoundError();
    }

    // Despublicar o curso
    const unpublishedCourse = await this.courseRepository.unpublish(courseId);

    return {
      course: unpublishedCourse,
    };
  }
}
