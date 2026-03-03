import { Article } from "@prisma/client";

export interface IArticleRepository {
  create(data: { lessonId: number; body: string }): Promise<Article>;
  findByLessonId(lessonId: number): Promise<Article | null>;
  upsert(lessonId: number, data: { body: string }): Promise<Article>;
}
