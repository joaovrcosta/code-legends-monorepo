import { UserModuleProgress } from "@prisma/client";
import { IUserModuleProgressRepository } from "../user-module-progress-repository";
import { prisma } from "../../lib/prisma";

export class PrismaUserModuleProgressRepository
  implements IUserModuleProgressRepository
{
  async create(data: {
    userId: string;
    moduleId: string;
    userCourseId: string;
    totalTasks: number;
    tasksCompleted: number;
    progress: number;
    isCompleted: boolean;
  }): Promise<UserModuleProgress> {
    const userModuleProgress = await prisma.userModuleProgress.create({
      data: {
        userId: data.userId,
        moduleId: data.moduleId,
        userCourseId: data.userCourseId,
        totalTasks: data.totalTasks,
        tasksCompleted: data.tasksCompleted,
        progress: data.progress,
        isCompleted: data.isCompleted,
        completedAt: data.isCompleted ? new Date() : null,
      },
    });

    return userModuleProgress;
  }

  async findByUserAndModule(
    userId: string,
    moduleId: string
  ): Promise<UserModuleProgress | null> {
    const userModuleProgress = await prisma.userModuleProgress.findUnique({
      where: {
        userId_moduleId: {
          userId,
          moduleId,
        },
      },
    });

    return userModuleProgress;
  }

  async upsert(data: {
    userId: string;
    moduleId: string;
    userCourseId: string;
    totalTasks: number;
    tasksCompleted: number;
    progress: number;
    isCompleted: boolean;
  }): Promise<UserModuleProgress> {
    const existing = await this.findByUserAndModule(data.userId, data.moduleId);

    if (existing) {
      const userModuleProgress = await prisma.userModuleProgress.update({
        where: {
          userId_moduleId: {
            userId: data.userId,
            moduleId: data.moduleId,
          },
        },
        data: {
          totalTasks: data.totalTasks,
          tasksCompleted: data.tasksCompleted,
          progress: data.progress,
          isCompleted: data.isCompleted,
          completedAt:
            data.isCompleted && !existing.isCompleted
              ? new Date()
              : existing.completedAt,
        },
      });

      return userModuleProgress;
    }

    return this.create(data);
  }

  async findByUserCourse(userCourseId: string): Promise<UserModuleProgress[]> {
    const userModuleProgresses = await prisma.userModuleProgress.findMany({
      where: { userCourseId },
      include: {
        module: true,
      },
    });

    return userModuleProgresses;
  }
}
