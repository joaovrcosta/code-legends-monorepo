import type { LessonDislike } from "@prisma/client";

export interface ILessonDislikeRepository {
  add(userId: string, lessonId: number): Promise<LessonDislike>;
  remove(userId: string, lessonId: number): Promise<void>;
  findByUserAndLesson(
    userId: string,
    lessonId: number,
  ): Promise<LessonDislike | null>;
}
