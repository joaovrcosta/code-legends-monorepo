import { UserCourse } from "@prisma/client";
import { IUserCourseRepository } from "../../../repositories/user-course-repository";
import { IUsersRepository } from "../../../repositories/users-repository";
import { UserNotFoundError } from "../../errors/user-not-found";

interface ListEnrolledCoursesRequest {
  userId: string;
}

interface ListEnrolledCoursesResponse {
  userCourses: UserCourse[];
}

export class ListEnrolledCoursesUseCase {
  constructor(
    private userCourseRepository: IUserCourseRepository,
    private usersRepository: IUsersRepository
  ) {}

  async execute({
    userId,
  }: ListEnrolledCoursesRequest): Promise<ListEnrolledCoursesResponse> {
    // Verificar se o usuário existe
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError();
    }

    const userCourses = await this.userCourseRepository.findByUserId(userId);

    return {
      userCourses,
    };
  }
}
