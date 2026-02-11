import { PrismaUserCourseRepository } from "../../repositories/prisma/prisma-user-course-repository";
import { PrismaUsersRepository } from "../../repositories/prisma/prisma-users-reposity";
import { PrismaUserProgressRepository } from "../../repositories/prisma/prisma-user-progress-repository";
import { PrismaCertificateRepository } from "../../repositories/prisma/prisma-certificate-repository";
import { ListCompletedCoursesUseCase } from "../../use-cases/entities/Course/list-completed";

export function makeListCompletedCoursesUseCase() {
  const userCourseRepository = new PrismaUserCourseRepository();
  const usersRepository = new PrismaUsersRepository();
  const userProgressRepository = new PrismaUserProgressRepository();
  const certificateRepository = new PrismaCertificateRepository();

  const listCompletedCoursesUseCase = new ListCompletedCoursesUseCase(
    userCourseRepository,
    usersRepository,
    userProgressRepository,
    certificateRepository
  );

  return listCompletedCoursesUseCase;
}

