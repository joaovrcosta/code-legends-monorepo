import { UnlockedModule } from "@prisma/client";
import { IUnlockedModuleRepository } from "../unlocked-module-repository";
import { prisma } from "../../lib/prisma";

export class PrismaUnlockedModuleRepository
  implements IUnlockedModuleRepository
{
  async create(data: {
    userId: string;
    moduleId: string;
    userCourseId: string;
  }): Promise<UnlockedModule> {
    const unlockedModule = await prisma.unlockedModule.create({
      data: {
        userId: data.userId,
        moduleId: data.moduleId,
        userCourseId: data.userCourseId,
      },
    });

    return unlockedModule;
  }

  async findByUserAndModule(
    userId: string,
    moduleId: string,
    userCourseId: string
  ): Promise<UnlockedModule | null> {
    const unlockedModule = await prisma.unlockedModule.findUnique({
      where: {
        userId_moduleId_userCourseId: {
          userId,
          moduleId,
          userCourseId,
        },
      },
    });

    return unlockedModule;
  }

  async findByUserCourse(userCourseId: string): Promise<UnlockedModule[]> {
    const unlockedModules = await prisma.unlockedModule.findMany({
      where: {
        userCourseId,
      },
    });

    return unlockedModules;
  }

  async findByUserAndCourse(
    userId: string,
    courseId: string
  ): Promise<UnlockedModule[]> {
    const unlockedModules = await prisma.unlockedModule.findMany({
      where: {
        userId,
        userCourse: {
          courseId,
        },
      },
    });

    return unlockedModules;
  }
}

