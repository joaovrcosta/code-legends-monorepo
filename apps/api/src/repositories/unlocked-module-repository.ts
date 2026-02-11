import { UnlockedModule } from "@prisma/client";

export interface IUnlockedModuleRepository {
  create(data: {
    userId: string;
    moduleId: string;
    userCourseId: string;
  }): Promise<UnlockedModule>;
  findByUserAndModule(
    userId: string,
    moduleId: string,
    userCourseId: string
  ): Promise<UnlockedModule | null>;
  findByUserCourse(userCourseId: string): Promise<UnlockedModule[]>;
  findByUserAndCourse(
    userId: string,
    courseId: string
  ): Promise<UnlockedModule[]>;
}

