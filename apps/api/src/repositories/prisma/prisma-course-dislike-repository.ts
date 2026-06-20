import { prisma } from "../../lib/prisma";
import type { ICourseDislikeRepository } from "../course-dislike-repository";

export class PrismaCourseDislikeRepository implements ICourseDislikeRepository {
  async add(userId: string, courseId: string) {
    return prisma.courseDislike.create({
      data: { userId, courseId },
    });
  }

  async remove(userId: string, courseId: string) {
    await prisma.courseDislike.deleteMany({
      where: { userId, courseId },
    });
  }

  async findByUserAndCourse(userId: string, courseId: string) {
    return prisma.courseDislike.findUnique({
      where: {
        userId_courseId: { userId, courseId },
      },
    });
  }
}
