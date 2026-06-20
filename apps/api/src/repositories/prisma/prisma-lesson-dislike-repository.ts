import { prisma } from "../../lib/prisma";
import type { ILessonDislikeRepository } from "../lesson-dislike-repository";

export class PrismaLessonDislikeRepository implements ILessonDislikeRepository {
  async add(userId: string, lessonId: number) {
    return prisma.lessonDislike.create({
      data: { userId, lessonId },
    });
  }

  async remove(userId: string, lessonId: number) {
    await prisma.lessonDislike.deleteMany({
      where: { userId, lessonId },
    });
  }

  async findByUserAndLesson(userId: string, lessonId: number) {
    return prisma.lessonDislike.findUnique({
      where: {
        userId_lessonId: { userId, lessonId },
      },
    });
  }
}
