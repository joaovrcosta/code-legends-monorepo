import type { ICourseDislikeRepository } from "../../../repositories/course-dislike-repository";
import type { ICourseLikeRepository } from "../../../repositories/course-like-repository";
import { LikeNotFoundError } from "../../errors/like-not-found";

interface RemoveCourseLikeRequest {
  userId: string;
  courseId: string;
}

export class RemoveCourseLikeUseCase {
  constructor(
    private courseLikeRepository: ICourseLikeRepository,
    private courseDislikeRepository: ICourseDislikeRepository,
  ) {}

  async execute({ userId, courseId }: RemoveCourseLikeRequest) {
    const existing = await this.courseLikeRepository.findByUserAndCourse(
      userId,
      courseId,
    );
    if (!existing) {
      throw new LikeNotFoundError();
    }

    await this.courseLikeRepository.remove(userId, courseId);

    const dislike = await this.courseDislikeRepository.findByUserAndCourse(
      userId,
      courseId,
    );

    return { liked: false, disliked: !!dislike };
  }
}
