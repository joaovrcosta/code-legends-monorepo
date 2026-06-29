import { Course } from "@prisma/client";
import { ICourseRepository } from "../../../repositories/course-repository";
import { CourseNotFoundError } from '../../errors/course-not-found'
import { ValidateCourseIntegrityUseCase } from './validate-course-integrity'
import { scheduleNewCoursePublishedNotification } from '../../../utils/notify-new-course-published'

interface PublishCourseRequest {
  courseId: string;
}

interface PublishCourseResponse {
  course: Course;
}

export class PublishCourseUseCase {
  constructor(
    private courseRepository: ICourseRepository,
    private validateCourseIntegrityUseCase: ValidateCourseIntegrityUseCase
  ) {}

  async execute({ courseId }: PublishCourseRequest): Promise<PublishCourseResponse> {
    // Verificar se o curso existe
    const course = await this.courseRepository.findById(courseId);

    if (!course) {
      throw new CourseNotFoundError();
    }

    // Validar integridade do curso
    const validation = await this.validateCourseIntegrityUseCase.execute({
      courseId,
    });

    if (!validation.isValid) {
      throw new Error(
        `Não é possível publicar o curso: ${validation.errors.join(", ")}`
      );
    }

    const wasPublished = course.status === "PUBLISHED";

    // Publicar o curso
    const publishedCourse = await this.courseRepository.publish(courseId);

    if (!wasPublished && publishedCourse.kind !== "PATH_UNIT") {
      scheduleNewCoursePublishedNotification({
        id: publishedCourse.id,
        title: publishedCourse.title,
        slug: publishedCourse.slug,
        instructorId: publishedCourse.instructorId,
      });
    }

    return {
      course: publishedCourse,
    };
  }
}
