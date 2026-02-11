import { UserCourse } from "@prisma/client";
import { IUserCourseRepository } from "../user-course-repository";
import { prisma } from "../../lib/prisma";

export class PrismaUserCourseRepository implements IUserCourseRepository {
  async enroll(userId: string, courseId: string): Promise<UserCourse> {
    // Verificar se já existe inscrição
    const existing = await this.findByUserAndCourse(userId, courseId);
    if (existing) {
      return existing;
    }

    // Buscar o primeiro módulo e primeira aula do curso para definir o ponto de partida
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          orderBy: {
            id: "asc",
          },
          include: {
            groups: {
              orderBy: {
                id: "asc",
              },
              include: {
                lessons: {
                  orderBy: {
                    order: "asc",
                  },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    if (!course) {
      throw new Error("Course not found");
    }

    const firstModule = course.modules[0];
    const firstGroup = firstModule?.groups[0];
    const firstLesson = firstGroup?.lessons[0];

    // Criar inscrição SEM definir currentModule/Task (não ativa automaticamente)
    const userCourse = await prisma.userCourse.create({
      data: {
        userId,
        courseId,
        currentModuleId: null, // Não ativa automaticamente
        currentTaskId: null,    // Não ativa automaticamente
        progress: 0.0,
        isCompleted: false,
        enrolledAt: new Date(),
        lastAccessedAt: new Date(),
      },
    });

    return userCourse;
  }

  async findByUserAndCourse(
    userId: string,
    courseId: string
  ): Promise<UserCourse | null> {
    const userCourse = await prisma.userCourse.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    return userCourse;
  }

  async findById(id: string): Promise<UserCourse | null> {
    const userCourse = await prisma.userCourse.findUnique({
      where: { id },
      include: {
        course: true,
        currentModule: true,
        currentTask: true,
      },
    });

    return userCourse;
  }

  async update(id: string, data: Partial<UserCourse>): Promise<UserCourse> {
    // Remover propriedades undefined do objeto
    const updateData: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        updateData[key] = value;
      }
    }

    const userCourse = await prisma.userCourse.update({
      where: { id },
      data: {
        ...updateData,
        lastAccessedAt: new Date(),
      },
    });

    return userCourse;
  }

  async findByUserId(userId: string): Promise<UserCourse[]> {
    const userCourses = await prisma.userCourse.findMany({
      where: { userId },
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
        enrolledAt: "desc",
      },
    });

    return userCourses;
  }
}
