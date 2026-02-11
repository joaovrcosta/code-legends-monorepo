import { UserModuleProgress } from "@prisma/client";

export interface IUserModuleProgressRepository {
  create(data: {
    userId: string;
    moduleId: string;
    userCourseId: string;
    totalTasks: number;
    tasksCompleted: number;
    progress: number;
    isCompleted: boolean;
  }): Promise<UserModuleProgress>;
  findByUserAndModule(
    userId: string,
    moduleId: string
  ): Promise<UserModuleProgress | null>;
  upsert(data: {
    userId: string;
    moduleId: string;
    userCourseId: string;
    totalTasks: number;
    tasksCompleted: number;
    progress: number;
    isCompleted: boolean;
  }): Promise<UserModuleProgress>;
  findByUserCourse(userCourseId: string): Promise<UserModuleProgress[]>;
}
