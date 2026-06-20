import type { ILessonDislikeRepository } from "../../../repositories/lesson-dislike-repository";
import type { ILessonLikeRepository } from "../../../repositories/lesson-like-repository";

interface GetLessonLikeStatusRequest {
  userId?: string;
  lessonId: number;
}

export class GetLessonLikeStatusUseCase {
  constructor(
    private lessonLikeRepository: ILessonLikeRepository,
    private lessonDislikeRepository: ILessonDislikeRepository,
  ) {}

  async execute({ userId, lessonId }: GetLessonLikeStatusRequest) {
    if (!userId) {
      return { liked: false, disliked: false };
    }

    const [like, dislike] = await Promise.all([
      this.lessonLikeRepository.findByUserAndLesson(userId, lessonId),
      this.lessonDislikeRepository.findByUserAndLesson(userId, lessonId),
    ]);

    return { liked: !!like, disliked: !!dislike };
  }
}
