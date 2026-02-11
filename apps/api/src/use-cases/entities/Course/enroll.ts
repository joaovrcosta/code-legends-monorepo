import { UserCourse } from "@prisma/client";
import { IUserCourseRepository } from "../../../repositories/user-course-repository";
import { ICourseRepository } from "../../../repositories/course-repository";
import { CourseNotFoundError } from "../../errors/course-not-found";

interface EnrollCourseRequest {
  userId: string;
  courseId: string;
}

interface EnrollCourseResponse {
  userCourse: UserCourse;
}

export class EnrollCourseUseCase {
  constructor(
    private userCourseRepository: IUserCourseRepository,
    private courseRepository: ICourseRepository
  ) {}

  async execute({
    userId,
    courseId,
  }: EnrollCourseRequest): Promise<EnrollCourseResponse> {
    // Verificar se o curso existe
    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw new CourseNotFoundError();
    }

    // Verificar se o usuário já está inscrito
    const existingEnrollment =
      await this.userCourseRepository.findByUserAndCourse(userId, courseId);

    if (existingEnrollment) {
      return {
        userCourse: existingEnrollment,
      };
    }

    // Inscrever o usuário no curso
    const userCourse = await this.userCourseRepository.enroll(userId, courseId);

    return {
      userCourse,
    };
  }
}
