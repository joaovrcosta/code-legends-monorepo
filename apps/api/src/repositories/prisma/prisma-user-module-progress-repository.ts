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
    /** Se false e isCompleted, seta completedAt; se já era complete, preserva via omit no caller. */
    wasAlreadyCompleted?: boolean;
  }): Promise<UserModuleProgress> {
    const newlyCompleted =
      data.isCompleted && !(data.wasAlreadyCompleted ?? false);

    return prisma.userModuleProgress.upsert({
      where: {
        userId_moduleId: {
          userId: data.userId,
          moduleId: data.moduleId,
        },
      },
      create: {
        userId: data.userId,
        moduleId: data.moduleId,
        userCourseId: data.userCourseId,
        totalTasks: data.totalTasks,
        tasksCompleted: data.tasksCompleted,
        progress: data.progress,
        isCompleted: data.isCompleted,
        completedAt: data.isCompleted ? new Date() : null,
      },
      update: {
        totalTasks: data.totalTasks,
        tasksCompleted: data.tasksCompleted,
        progress: data.progress,
        isCompleted: data.isCompleted,
        ...(newlyCompleted ? { completedAt: new Date() } : {}),
      },
    });
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
