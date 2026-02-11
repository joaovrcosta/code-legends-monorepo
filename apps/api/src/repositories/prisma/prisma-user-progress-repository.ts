import { UserProgress } from "@prisma/client";
import { IUserProgressRepository } from "../user-progress-repository";
import { prisma } from "../../lib/prisma";

export class PrismaUserProgressRepository implements IUserProgressRepository {
  async create(data: {
    userId: string;
    taskId: number;
    userCourseId: string;
    isCompleted: boolean;
    score?: number;
    timeSpent?: number;
    lastPosition?: number;
  }): Promise<UserProgress> {
    const userProgress = await prisma.userProgress.create({
      data: {
        userId: data.userId,
        taskId: data.taskId,
        userCourseId: data.userCourseId,
        isCompleted: data.isCompleted,
        completedAt: data.isCompleted ? new Date() : null,
        score: data.score ?? null,
        timeSpent: data.timeSpent ?? 0,
        lastPosition: data.lastPosition ?? null,
        attempts: 1,
      },
    });

    return userProgress;
  }

  async findById(id: string): Promise<UserProgress | null> {
    const userProgress = await prisma.userProgress.findUnique({
      where: { id },
    });

    return userProgress;
  }

  async findByUserAndTask(
    userId: string,
    taskId: number
  ): Promise<UserProgress | null> {
    const userProgress = await prisma.userProgress.findUnique({
      where: {
        userId_taskId: {
          userId,
          taskId,
        },
      },
    });

    return userProgress;
  }

  async upsert(data: {
    userId: string;
    taskId: number;
    userCourseId: string;
    isCompleted: boolean;
    score?: number;
    timeSpent?: number;
    lastPosition?: number;
  }): Promise<UserProgress> {
    const existing = await this.findByUserAndTask(data.userId, data.taskId);

    if (existing) {
      const userProgress = await prisma.userProgress.update({
        where: {
          userId_taskId: {
            userId: data.userId,
            taskId: data.taskId,
          },
        },
        data: {
          isCompleted: data.isCompleted,
          completedAt: data.isCompleted ? new Date() : existing.completedAt,
          score: data.score ?? existing.score,
          timeSpent: data.timeSpent
            ? existing.timeSpent + data.timeSpent
            : existing.timeSpent,
          lastPosition: data.lastPosition ?? existing.lastPosition,
          attempts:
            existing.attempts +
            (data.isCompleted && !existing.isCompleted ? 1 : 0),
        },
      });

      return userProgress;
    }

    return this.create(data);
  }

  async countCompletedInModule(
    userId: string,
    moduleId: string
  ): Promise<number> {
    const count = await prisma.userProgress.count({
      where: {
        userId,
        isCompleted: true,
        task: {
          submodule: {
            moduleId,
          },
        },
      },
    });

    return count;
  }

  async findByUserCourse(userCourseId: string): Promise<UserProgress[]> {
    const userProgresses = await prisma.userProgress.findMany({
      where: { userCourseId },
      include: {
        task: true,
      },
    });

    return userProgresses;
  }
}
