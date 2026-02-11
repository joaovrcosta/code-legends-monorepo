import { FavoriteCourse } from "@prisma/client";
import { IFavoriteCourseRepository } from "../favorite-course-repository";
import { prisma } from "../../lib/prisma";

export class PrismaFavoriteCourseRepository
  implements IFavoriteCourseRepository
{
  async add(userId: string, courseId: string): Promise<FavoriteCourse> {
    const favoriteCourse = await prisma.favoriteCourse.create({
      data: {
        userId,
        courseId,
      },
      include: {
        course: {
          include: {
            instructor: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
            category: true,
          },
        },
      },
    });

    return favoriteCourse;
  }

  async remove(userId: string, courseId: string): Promise<void> {
    await prisma.favoriteCourse.deleteMany({
      where: {
        userId,
        courseId,
      },
    });
  }

  async findByUserAndCourse(
    userId: string,
    courseId: string
  ): Promise<FavoriteCourse | null> {
    const favoriteCourse = await prisma.favoriteCourse.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    return favoriteCourse;
  }

  async listByUserId(userId: string): Promise<FavoriteCourse[]> {
    const favoriteCourses = await prisma.favoriteCourse.findMany({
      where: {
        userId,
      },
      include: {
        course: {
          include: {
            instructor: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
            category: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return favoriteCourses;
  }
}


