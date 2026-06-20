import type { ILessonDislikeRepository } from "../../../repositories/lesson-dislike-repository";
import type { ILessonLikeRepository } from "../../../repositories/lesson-like-repository";
import type { ILessonRepository } from "../../../repositories/lesson-repository";
import { LessonNotFoundError } from "../../errors/lesson-not-found";
import { LikeAlreadyExistsError } from "../../errors/like-already-exists";

interface AddLessonLikeRequest {
  userId: string;
  lessonId: number;
}

export class AddLessonLikeUseCase {
  constructor(
    private lessonLikeRepository: ILessonLikeRepository,
    private lessonDislikeRepository: ILessonDislikeRepository,
    private lessonRepository: ILessonRepository,
  ) {}

  async execute({ userId, lessonId }: AddLessonLikeRequest) {
    const lesson = await this.lessonRepository.findById(lessonId);
    if (!lesson) {
      throw new LessonNotFoundError();
    }

    const existing = await this.lessonLikeRepository.findByUserAndLesson(
      userId,
      lessonId,
    );
    if (existing) {
      throw new LikeAlreadyExistsError();
    }

    await this.lessonDislikeRepository.remove(userId, lessonId);
    await this.lessonLikeRepository.add(userId, lessonId);

    return { liked: true, disliked: false };
  }
}
