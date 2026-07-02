import { IUsersRepository } from "../../../repositories/users-repository";
import { ICourseRepository } from "../../../repositories/course-repository";
import { IUserCourseRepository } from "../../../repositories/user-course-repository";
import { userHasPathUnitCareerAccess } from "../../../utils/path-unit-access";

interface GetActiveCourseRequest {
  userId: string;
}

interface GetActiveCourseResponse {
  course: {
    id: string;
    title: string;
    slug: string;
    thumbnail: string | null;
    description: string;
    icon: string | null;
    kind: "CATALOG" | "PATH_UNIT";
    progress: number;
    isCompleted: boolean;
    currentModuleId: string | null;
    currentTaskId: number | null;
  } | null;
}

export class GetActiveCourseUseCase {
  constructor(
    private usersRepository: IUsersRepository,
    private courseRepository: ICourseRepository,
    private userCourseRepository: IUserCourseRepository
  ) {}

  async execute({
    userId,
  }: GetActiveCourseRequest): Promise<GetActiveCourseResponse> {
    // Buscar usuário para obter o activeCourseId
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      return { course: null };
    }

    // Se não tem curso ativo, retornar null
    if (!user.activeCourseId) {
      return { course: null };
    }

    // Buscar o curso ativo
    const course = await this.courseRepository.findById(user.activeCourseId);
    if (!course) {
      await this.usersRepository.update(userId, { activeCourseId: null });
      return { course: null };
    }

    if (course.status !== "PUBLISHED") {
      await this.usersRepository.update(userId, { activeCourseId: null });
      return { course: null };
    }

    if (course.kind === "PATH_UNIT") {
      const hasPathUnitAccess = await userHasPathUnitCareerAccess(userId, course);
      if (!hasPathUnitAccess) {
        await this.usersRepository.update(userId, { activeCourseId: null });
        return { course: null };
      }
    }

    // Buscar inscrição do usuário neste curso
    const userCourse = await this.userCourseRepository.findByUserAndCourse(
      userId,
      user.activeCourseId
    );

    if (!userCourse) {
      return { course: null };
    }

    return {
      course: {
        id: course.id,
        title: course.title,
        slug: course.slug,
        thumbnail: course.thumbnail,
        description: course.description,
        icon: course.icon,
        kind: course.kind,
        progress: userCourse.progress,
        isCompleted: userCourse.isCompleted,
        currentModuleId: userCourse.currentModuleId,
        currentTaskId: userCourse.currentTaskId,
      },
    };
  }
}
