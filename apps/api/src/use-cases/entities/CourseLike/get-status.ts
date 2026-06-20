import type { ICourseDislikeRepository } from "../../../repositories/course-dislike-repository";
import type { ICourseLikeRepository } from "../../../repositories/course-like-repository";

interface GetCourseLikeStatusRequest {
  userId?: string;
  courseId: string;
}

export class GetCourseLikeStatusUseCase {
  constructor(
    private courseLikeRepository: ICourseLikeRepository,
    private courseDislikeRepository: ICourseDislikeRepository,
  ) {}

  async execute({ userId, courseId }: GetCourseLikeStatusRequest) {
    if (!userId) {
      return { liked: false, disliked: false };
    }

    const [like, dislike] = await Promise.all([
      this.courseLikeRepository.findByUserAndCourse(userId, courseId),
      this.courseDislikeRepository.findByUserAndCourse(userId, courseId),
    ]);

    return { liked: !!like, disliked: !!dislike };
  }
}
