import type { ILessonDislikeRepository } from "../../../repositories/lesson-dislike-repository";
import type { ILessonLikeRepository } from "../../../repositories/lesson-like-repository";
import { DislikeNotFoundError } from "../../errors/dislike-not-found";

interface RemoveLessonDislikeRequest {
  userId: string;
  lessonId: number;
}

export class RemoveLessonDislikeUseCase {
  constructor(
    private lessonDislikeRepository: ILessonDislikeRepository,
    private lessonLikeRepository: ILessonLikeRepository,
  ) {}

  async execute({ userId, lessonId }: RemoveLessonDislikeRequest) {
    const existing = await this.lessonDislikeRepository.findByUserAndLesson(
      userId,
      lessonId,
    );
    if (!existing) {
      throw new DislikeNotFoundError();
    }

    await this.lessonDislikeRepository.remove(userId, lessonId);

    const like = await this.lessonLikeRepository.findByUserAndLesson(
      userId,
      lessonId,
    );

    return { liked: !!like, disliked: false };
  }
}
