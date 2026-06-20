import type { ICourseDislikeRepository } from "../../../repositories/course-dislike-repository";
import type { ICourseLikeRepository } from "../../../repositories/course-like-repository";
import type { ICourseRepository } from "../../../repositories/course-repository";
import { CourseNotFoundError } from "../../errors/course-not-found";
import { DislikeAlreadyExistsError } from "../../errors/dislike-already-exists";

interface AddCourseDislikeRequest {
  userId: string;
  courseId: string;
}

export class AddCourseDislikeUseCase {
  constructor(
    private courseDislikeRepository: ICourseDislikeRepository,
    private courseLikeRepository: ICourseLikeRepository,
    private courseRepository: ICourseRepository,
  ) {}

  async execute({ userId, courseId }: AddCourseDislikeRequest) {
    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw new CourseNotFoundError();
    }

    const existing = await this.courseDislikeRepository.findByUserAndCourse(
      userId,
      courseId,
    );
    if (existing) {
      throw new DislikeAlreadyExistsError();
    }

    await this.courseLikeRepository.remove(userId, courseId);
    await this.courseDislikeRepository.add(userId, courseId);

    return { liked: false, disliked: true };
  }
}
