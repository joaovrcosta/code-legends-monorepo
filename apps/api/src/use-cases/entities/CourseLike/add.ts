import type { ICourseDislikeRepository } from "../../../repositories/course-dislike-repository";
import type { ICourseLikeRepository } from "../../../repositories/course-like-repository";
import type { ICourseRepository } from "../../../repositories/course-repository";
import { CourseNotFoundError } from "../../errors/course-not-found";
import { LikeAlreadyExistsError } from "../../errors/like-already-exists";

interface AddCourseLikeRequest {
  userId: string;
  courseId: string;
}

export class AddCourseLikeUseCase {
  constructor(
    private courseLikeRepository: ICourseLikeRepository,
    private courseDislikeRepository: ICourseDislikeRepository,
    private courseRepository: ICourseRepository,
  ) {}

  async execute({ userId, courseId }: AddCourseLikeRequest) {
    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw new CourseNotFoundError();
    }

    const existing = await this.courseLikeRepository.findByUserAndCourse(
      userId,
      courseId,
    );
    if (existing) {
      throw new LikeAlreadyExistsError();
    }

    await this.courseDislikeRepository.remove(userId, courseId);
    await this.courseLikeRepository.add(userId, courseId);

    return { liked: true, disliked: false };
  }
}
