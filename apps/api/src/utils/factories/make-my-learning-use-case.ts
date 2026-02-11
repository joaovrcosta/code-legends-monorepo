import { PrismaUserCourseRepository } from "../../repositories/prisma/prisma-user-course-repository";
import { PrismaUsersRepository } from "../../repositories/prisma/prisma-users-reposity";
import { PrismaUserProgressRepository } from "../../repositories/prisma/prisma-user-progress-repository";
import { MyLearningUseCase } from "../../use-cases/entities/Course/my-learning";

export function makeMyLearningUseCase() {
  const userCourseRepository = new PrismaUserCourseRepository();
  const usersRepository = new PrismaUsersRepository();
  const userProgressRepository = new PrismaUserProgressRepository();
  const myLearningUseCase = new MyLearningUseCase(
    userCourseRepository,
    usersRepository,
    userProgressRepository
  );

  return myLearningUseCase;
}















