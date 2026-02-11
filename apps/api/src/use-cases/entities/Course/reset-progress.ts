import { IUserCourseRepository } from "../../../repositories/user-course-repository";
import { ICourseRepository } from "../../../repositories/course-repository";
import { prisma } from "../../../lib/prisma";
import { CourseNotFoundError } from "../../errors/course-not-found";

interface ResetProgressRequest {
  userId: string;
  courseId: string;
}

interface ResetProgressResponse {
  message: string;
}

export class ResetProgressUseCase {
  constructor(
    private userCourseRepository: IUserCourseRepository,
    private courseRepository: ICourseRepository
  ) {}

  async execute({
    userId,
    courseId,
  }: ResetProgressRequest): Promise<ResetProgressResponse> {
    // Verificar se o curso existe
    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw new CourseNotFoundError();
    }

    // Verificar se o usuário está inscrito no curso
    const userCourse = await this.userCourseRepository.findByUserAndCourse(
      userId,
      courseId
    );

    if (!userCourse) {
      throw new Error("User is not enrolled in this course");
    }

    // Deletar todos os progressos de lessons (UserProgress) do curso específico
    // Garantir que estamos deletando apenas lessons deste curso
    await prisma.userProgress.deleteMany({
      where: {
        userId,
        userCourseId: userCourse.id,
        task: {
          submodule: {
            module: {
              courseId: courseId,
            },
          },
        },
      },
    });

    // Deletar todos os progressos de módulos (UserModuleProgress) do curso específico
    // Garantir que estamos deletando apenas módulos deste curso
    await prisma.userModuleProgress.deleteMany({
      where: {
        userId,
        userCourseId: userCourse.id,
        module: {
          courseId: courseId,
        },
      },
    });

    // Deletar todos os módulos desbloqueados (UnlockedModule) do curso específico
    await prisma.unlockedModule.deleteMany({
      where: {
        userId,
        userCourseId: userCourse.id,
        module: {
          courseId: courseId,
        },
      },
    });

    // Buscar o primeiro módulo e primeira lesson do curso para resetar
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

    let firstModuleId: string | null = null;
    let firstLessonId: number | null = null;

    if (courseWithModules) {
      const firstModule = courseWithModules.modules[0];
      const firstGroup = firstModule?.groups[0];
      const firstLesson = firstGroup?.lessons[0];

      firstModuleId = firstModule?.id ?? null;
      firstLessonId = firstLesson?.id ?? null;
    }

    // Resetar o UserCourse
    await this.userCourseRepository.update(userCourse.id, {
      currentModuleId: firstModuleId,
      currentTaskId: firstLessonId,
      progress: 0.0,
      isCompleted: false,
      completedAt: null,
      lastAccessedAt: new Date(),
    });

    return {
      message: "Progress reset successfully",
    };
  }
}

