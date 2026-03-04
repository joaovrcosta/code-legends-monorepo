import { Quiz } from "@prisma/client";

export interface IQuizRepository {
  upsert(lessonId: number, content: unknown): Promise<Quiz>;
  findByLessonId(lessonId: number): Promise<Quiz | null>;
}
