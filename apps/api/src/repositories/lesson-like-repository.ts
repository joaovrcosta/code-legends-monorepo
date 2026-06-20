import type { LessonLike } from "@prisma/client";

export interface ILessonLikeRepository {
  add(userId: string, lessonId: number): Promise<LessonLike>;
  remove(userId: string, lessonId: number): Promise<void>;
  findByUserAndLesson(
    userId: string,
    lessonId: number,
  ): Promise<LessonLike | null>;
  countByLessonId(lessonId: number): Promise<number>;
}
