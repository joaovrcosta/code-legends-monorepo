import type { ILessonDislikeRepository } from "../../../repositories/lesson-dislike-repository";
import type { ILessonLikeRepository } from "../../../repositories/lesson-like-repository";
import type { ILessonRepository } from "../../../repositories/lesson-repository";
import { DislikeAlreadyExistsError } from "../../errors/dislike-already-exists";
import { LessonNotFoundError } from "../../errors/lesson-not-found";

interface AddLessonDislikeRequest {
  userId: string;
  lessonId: number;
}

export class AddLessonDislikeUseCase {
  constructor(
    private lessonDislikeRepository: ILessonDislikeRepository,
    private lessonLikeRepository: ILessonLikeRepository,
    private lessonRepository: ILessonRepository,
  ) {}

  async execute({ userId, lessonId }: AddLessonDislikeRequest) {
    const lesson = await this.lessonRepository.findById(lessonId);
    if (!lesson) {
      throw new LessonNotFoundError();
    }

    const existing = await this.lessonDislikeRepository.findByUserAndLesson(
      userId,
      lessonId,
    );
    if (existing) {
      throw new DislikeAlreadyExistsError();
    }

    await this.lessonLikeRepository.remove(userId, lessonId);
    await this.lessonDislikeRepository.add(userId, lessonId);

    return { liked: false, disliked: true };
  }
}
