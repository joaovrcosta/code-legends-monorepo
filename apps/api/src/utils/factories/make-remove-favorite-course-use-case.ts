import { PrismaFavoriteCourseRepository } from "../../repositories/prisma/prisma-favorite-course-repository";
import { RemoveFavoriteCourseUseCase } from "../../use-cases/entities/FavoriteCourse/remove";

export function makeRemoveFavoriteCourseUseCase() {
  const favoriteCourseRepository = new PrismaFavoriteCourseRepository();

  const removeFavoriteCourseUseCase = new RemoveFavoriteCourseUseCase(
    favoriteCourseRepository
  );

  return removeFavoriteCourseUseCase;
}

