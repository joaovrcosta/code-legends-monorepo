import { FavoriteCourse } from "@prisma/client";
import { IFavoriteCourseRepository } from "../../../repositories/favorite-course-repository";
import { IUsersRepository } from "../../../repositories/users-repository";
import { UserNotFoundError } from "../../errors/user-not-found";

interface ListFavoriteCoursesRequest {
  userId: string;
}

interface ListFavoriteCoursesResponse {
  favoriteCourses: FavoriteCourse[];
}

export class ListFavoriteCoursesUseCase {
  constructor(
    private favoriteCourseRepository: IFavoriteCourseRepository,
    private usersRepository: IUsersRepository
  ) {}

  async execute({
    userId,
  }: ListFavoriteCoursesRequest): Promise<ListFavoriteCoursesResponse> {
    // Verificar se o usuário existe
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError();
    }

    const favoriteCourses = await this.favoriteCourseRepository.listByUserId(
      userId
    );

    return {
      favoriteCourses,
    };
  }
}

