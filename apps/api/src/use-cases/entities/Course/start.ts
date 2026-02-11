import { IUserCourseRepository } from "../../../repositories/user-course-repository";
import { ICourseRepository } from "../../../repositories/course-repository";
import { IUsersRepository } from "../../../repositories/users-repository";
import { CourseNotFoundError } from "../../errors/course-not-found";
import { prisma } from "../../../lib/prisma";

interface StartCourseRequest {
  userId: string;
  courseId: string;
}

interface StartCourseResponse {
  userCourse: {
    id: string;
    courseId: string;
    currentModuleId: string | null;
    currentTaskId: number | null;
    progress: number;
  };
}

export class StartCourseUseCase {
  constructor(
    private userCourseRepository: IUserCourseRepository,
    private courseRepository: ICourseRepository,
    private usersRepository: IUsersRepository
  ) {}

  async execute({
    userId,
    courseId,
  }: StartCourseRequest): Promise<StartCourseResponse> {
    // Verificar se o curso existe
    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw new CourseNotFoundError();
    }

    // Verificar se o usuário está inscrito
    const userCourse =
      await this.userCourseRepository.findByUserAndCourse(userId, courseId);

    if (!userCourse) {
      throw new Error("User is not enrolled in this course");
    }

    // Buscar o primeiro módulo e primeira aula do curso (se ainda não começou)
    let currentModuleId = userCourse.currentModuleId;
    let currentTaskId = userCourse.currentTaskId;

    // Se ainda não começou, definir o ponto de partida
    if (!currentModuleId || !currentTaskId) {
      const courseWithModules = await prisma.course.findUnique({
        where: { id: courseId },
        include: {
          modules: {
            orderBy: {
              id: "asc",
            },
            include: {
              groups: {
                orderBy: {
                  id: "asc",
                },
                include: {
                  lessons: {
                    orderBy: {
                      order: "asc",
                    },
                    take: 1,
                  },
                },
              },
            },
          },
        },
      });

      if (courseWithModules) {
        const firstModule = courseWithModules.modules[0];
        const firstGroup = firstModule?.groups[0];
        const firstLesson = firstGroup?.lessons[0];

        currentModuleId = firstModule?.id ?? null;
        currentTaskId = firstLesson?.id ?? null;
      }
    }

    // Atualizar o curso do usuário com currentModule e currentTask
    const updatedUserCourse = await this.userCourseRepository.update(
      userCourse.id,
      {
        currentModuleId,
        currentTaskId,
        lastAccessedAt: new Date(),
      }
    );

    // Atualizar o curso ativo do usuário
    try {
      await this.usersRepository.update(userId, {
        activeCourseId: courseId,
      });
    } catch (updateError) {
      console.error("Error updating user activeCourseId:", updateError);
      // Continuar mesmo se falhar a atualização do activeCourseId
      // O importante é ter atualizado o userCourse
    }

    return {
      userCourse: {
        id: updatedUserCourse.id,
        courseId: updatedUserCourse.courseId,
        currentModuleId: updatedUserCourse.currentModuleId,
        currentTaskId: updatedUserCourse.currentTaskId,
        progress: updatedUserCourse.progress,
      },
    };
  }
}

