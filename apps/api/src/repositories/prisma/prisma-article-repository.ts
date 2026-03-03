import { Article } from "@prisma/client";
import { IArticleRepository } from "../article-repository";
import { prisma } from "../../lib/prisma";

export class PrismaArticleRepository implements IArticleRepository {
  async create(data: { lessonId: number; body: string }): Promise<Article> {
    return prisma.article.create({
      data: {
        lessonId: data.lessonId,
        body: data.body,
      },
    });
  }

  async findByLessonId(lessonId: number): Promise<Article | null> {
    return prisma.article.findUnique({
      where: { lessonId },
    });
  }

  async upsert(lessonId: number, data: { body: string }): Promise<Article> {
    return prisma.article.upsert({
      where: { lessonId },
      create: {
        lessonId,
        body: data.body,
      },
      update: {
        body: data.body,
      },
    });
  }
}
