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
  ) { }

  async execute({
    userId,
    courseId,
  }: EnrollCourseRequest): Promise<EnrollCourseResponse> {
    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw new CourseNotFoundError();
    }

    const existingEnrollment =
      await this.userCourseRepository.findByUserAndCourse(userId, courseId);

    if (existingEnrollment) {
      return {
        userCourse: existingEnrollment,
      };
    }

    const userCourse = await this.userCourseRepository.enroll(userId, courseId);

    return {
      userCourse,
    };
  }
}
