import { IFavoriteCourseRepository } from "../../../repositories/favorite-course-repository";
import { FavoriteCourseNotFoundError } from "../../errors/favorite-course-not-found";

interface RemoveFavoriteCourseRequest {
  userId: string;
  courseId: string;
}

export class RemoveFavoriteCourseUseCase {
  constructor(private favoriteCourseRepository: IFavoriteCourseRepository) {}

  async execute({
    userId,
    courseId,
  }: RemoveFavoriteCourseRequest): Promise<void> {
    // Verificar se o favorito existe
    const existingFavorite =
      await this.favoriteCourseRepository.findByUserAndCourse(userId, courseId);
    if (!existingFavorite) {
      throw new FavoriteCourseNotFoundError();
    }

    await this.favoriteCourseRepository.remove(userId, courseId);
  }
}

