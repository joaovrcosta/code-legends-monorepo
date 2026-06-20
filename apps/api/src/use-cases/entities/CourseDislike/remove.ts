import type { ICourseDislikeRepository } from "../../../repositories/course-dislike-repository";
import type { ICourseLikeRepository } from "../../../repositories/course-like-repository";
import { DislikeNotFoundError } from "../../errors/dislike-not-found";

interface RemoveCourseDislikeRequest {
  userId: string;
  courseId: string;
}

export class RemoveCourseDislikeUseCase {
  constructor(
    private courseDislikeRepository: ICourseDislikeRepository,
    private courseLikeRepository: ICourseLikeRepository,
  ) {}

  async execute({ userId, courseId }: RemoveCourseDislikeRequest) {
    const existing = await this.courseDislikeRepository.findByUserAndCourse(
      userId,
      courseId,
    );
    if (!existing) {
      throw new DislikeNotFoundError();
    }

    await this.courseDislikeRepository.remove(userId, courseId);

    const like = await this.courseLikeRepository.findByUserAndCourse(
      userId,
      courseId,
    );

    return { liked: !!like, disliked: false };
  }
}
