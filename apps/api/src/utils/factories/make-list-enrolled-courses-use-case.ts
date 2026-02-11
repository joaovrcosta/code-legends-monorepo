import { PrismaUserCourseRepository } from "../../repositories/prisma/prisma-user-course-repository";
import { PrismaUsersRepository } from "../../repositories/prisma/prisma-users-reposity";
import { ListEnrolledCoursesUseCase } from "../../use-cases/entities/Course/list-enrolled";

export function makeListEnrolledCoursesUseCase() {
  const userCourseRepository = new PrismaUserCourseRepository();
  const usersRepository = new PrismaUsersRepository();
  const listEnrolledCoursesUseCase = new ListEnrolledCoursesUseCase(
    userCourseRepository,
    usersRepository
  );

  return listEnrolledCoursesUseCase;
}
