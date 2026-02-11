import { FavoriteCourse } from "@prisma/client";
import { IFavoriteCourseRepository } from "../../../repositories/favorite-course-repository";
import { ICourseRepository } from "../../../repositories/course-repository";
import { IUsersRepository } from "../../../repositories/users-repository";
import { FavoriteCourseAlreadyExistsError } from "../../errors/favorite-course-already-exists";
import { CourseNotFoundError } from "../../errors/course-not-found";
import { UserNotFoundError } from "../../errors/user-not-found";

interface AddFavoriteCourseRequest {
  userId: string;
  courseId: string;
}

interface AddFavoriteCourseResponse {
  favoriteCourse: FavoriteCourse;
}

export class AddFavoriteCourseUseCase {
  constructor(
    private favoriteCourseRepository: IFavoriteCourseRepository,
    private courseRepository: ICourseRepository,
    private usersRepository: IUsersRepository
  ) {}

  async execute({
    userId,
    courseId,
  }: AddFavoriteCourseRequest): Promise<AddFavoriteCourseResponse> {
    // Verificar se o usuário existe
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError();
    }

    // Verificar se o curso existe
    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw new CourseNotFoundError();
    }

    // Verificar se já está favoritado
    const existingFavorite =
      await this.favoriteCourseRepository.findByUserAndCourse(userId, courseId);
    if (existingFavorite) {
      throw new FavoriteCourseAlreadyExistsError();
    }

    const favoriteCourse = await this.favoriteCourseRepository.add(
      userId,
      courseId
    );

    return {
      favoriteCourse,
    };
  }
}
