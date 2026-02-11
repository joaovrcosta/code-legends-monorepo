import { PrismaFavoriteCourseRepository } from "../../repositories/prisma/prisma-favorite-course-repository";
import { PrismaCourseRepository } from "../../repositories/prisma/prisma-course-repository";
import { PrismaUsersRepository } from "../../repositories/prisma/prisma-users-reposity";
import { AddFavoriteCourseUseCase } from "../../use-cases/entities/FavoriteCourse/add";

export function makeAddFavoriteCourseUseCase() {
  const favoriteCourseRepository = new PrismaFavoriteCourseRepository();
  const courseRepository = new PrismaCourseRepository();
  const usersRepository = new PrismaUsersRepository();

  const addFavoriteCourseUseCase = new AddFavoriteCourseUseCase(
    favoriteCourseRepository,
    courseRepository,
    usersRepository
  );

  return addFavoriteCourseUseCase;
}


