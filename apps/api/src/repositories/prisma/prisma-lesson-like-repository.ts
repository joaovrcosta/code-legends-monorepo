import { prisma } from "../../lib/prisma";
import type { ILessonLikeRepository } from "../lesson-like-repository";

export class PrismaLessonLikeRepository implements ILessonLikeRepository {
  async add(userId: string, lessonId: number) {
    return prisma.lessonLike.create({
      data: { userId, lessonId },
    });
  }

  async remove(userId: string, lessonId: number) {
    await prisma.lessonLike.deleteMany({
      where: { userId, lessonId },
    });
  }

  async findByUserAndLesson(userId: string, lessonId: number) {
    return prisma.lessonLike.findUnique({
      where: {
        userId_lessonId: { userId, lessonId },
      },
    });
  }

  async countByLessonId(lessonId: number) {
    return prisma.lessonLike.count({
      where: { lessonId },
    });
  }
}
