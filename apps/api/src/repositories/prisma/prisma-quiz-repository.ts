import { Quiz } from "@prisma/client";
import { IQuizRepository } from "../quiz-repository";
import { prisma } from "../../lib/prisma";

export class PrismaQuizRepository implements IQuizRepository {
  async upsert(lessonId: number, content: unknown): Promise<Quiz> {
    return prisma.quiz.upsert({
      where: { lessonId },
      create: {
        lessonId,
        content: content as any,
      },
      update: {
        content: content as any,
      },
    });
  }

  async findByLessonId(lessonId: number): Promise<Quiz | null> {
    return prisma.quiz.findUnique({
      where: { lessonId },
    });
  }
}
