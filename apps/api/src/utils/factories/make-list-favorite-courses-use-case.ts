import { PrismaFavoriteCourseRepository } from "../../repositories/prisma/prisma-favorite-course-repository";
import { PrismaUsersRepository } from "../../repositories/prisma/prisma-users-reposity";
import { ListFavoriteCoursesUseCase } from "../../use-cases/entities/FavoriteCourse/list";

export function makeListFavoriteCoursesUseCase() {
  const favoriteCourseRepository = new PrismaFavoriteCourseRepository();
  const usersRepository = new PrismaUsersRepository();

  const listFavoriteCoursesUseCase = new ListFavoriteCoursesUseCase(
    favoriteCourseRepository,
    usersRepository
  );

  return listFavoriteCoursesUseCase;
}


