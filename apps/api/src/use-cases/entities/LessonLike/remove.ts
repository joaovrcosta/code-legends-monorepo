import type { ILessonDislikeRepository } from "../../../repositories/lesson-dislike-repository";
import type { ILessonLikeRepository } from "../../../repositories/lesson-like-repository";
import { LikeNotFoundError } from "../../errors/like-not-found";

interface RemoveLessonLikeRequest {
  userId: string;
  lessonId: number;
}

export class RemoveLessonLikeUseCase {
  constructor(
    private lessonLikeRepository: ILessonLikeRepository,
    private lessonDislikeRepository: ILessonDislikeRepository,
  ) {}

  async execute({ userId, lessonId }: RemoveLessonLikeRequest) {
    const existing = await this.lessonLikeRepository.findByUserAndLesson(
      userId,
      lessonId,
    );
    if (!existing) {
      throw new LikeNotFoundError();
    }

    await this.lessonLikeRepository.remove(userId, lessonId);

    const dislike = await this.lessonDislikeRepository.findByUserAndLesson(
      userId,
      lessonId,
    );

    return { liked: false, disliked: !!dislike };
  }
}
