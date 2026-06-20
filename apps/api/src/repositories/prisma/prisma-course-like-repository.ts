import { prisma } from "../../lib/prisma";
import type { ICourseLikeRepository } from "../course-like-repository";

export class PrismaCourseLikeRepository implements ICourseLikeRepository {
  async add(userId: string, courseId: string) {
    return prisma.courseLike.create({
      data: { userId, courseId },
    });
  }

  async remove(userId: string, courseId: string) {
    await prisma.courseLike.deleteMany({
      where: { userId, courseId },
    });
  }

  async findByUserAndCourse(userId: string, courseId: string) {
    return prisma.courseLike.findUnique({
      where: {
        userId_courseId: { userId, courseId },
      },
    });
  }

  async countByCourseId(courseId: string) {
    return prisma.courseLike.count({
      where: { courseId },
    });
  }
}
