import { UserProgress } from "@prisma/client";

export interface IUserProgressRepository {
  create(data: {
    userId: string;
    taskId: number;
    userCourseId: string;
    isCompleted: boolean;
    score?: number;
    timeSpent?: number;
    lastPosition?: number;
  }): Promise<UserProgress>;
  findById(id: string): Promise<UserProgress | null>;
  findByUserAndTask(
    userId: string,
    taskId: number
  ): Promise<UserProgress | null>;
  upsert(data: {
    userId: string;
    taskId: number;
    userCourseId: string;
    isCompleted: boolean;
    score?: number;
    timeSpent?: number;
    lastPosition?: number;
  }): Promise<UserProgress>;
  countCompletedInModule(userId: string, moduleId: string): Promise<number>;
  findByUserCourse(userCourseId: string): Promise<UserProgress[]>;
}
