import { ICourseRepository } from "../../../repositories/course-repository";
import { IUserCourseRepository } from "../../../repositories/user-course-repository";
import { IUserProgressRepository } from "../../../repositories/user-progress-repository";
import { CourseNotFoundError } from "../../errors/course-not-found";
import { prisma } from "../../../lib/prisma";

interface ModuleProgress {
  id: string;
  title: string;
  slug: string;
  progress: number; // Porcentagem (0-100)
  totalLessons: number;
  completedLessons: number;
  isCompleted: boolean;
}

interface GetCourseProgressRequest {
  userId: string;
  courseId?: string;
  slug?: string;
}

interface GetCourseProgressResponse {
  course: {
    id: string;
    title: string;
    slug: string;
    progress: number; // Porcentagem total do curso (0-100)
    totalLessons: number;
    completedLessons: number;
    totalModules: number;
    completedModules: number;
    isCompleted: boolean;
  };
  modules: ModuleProgress[];
}

export class GetCourseProgressUseCase {
  constructor(
    private courseRepository: ICourseRepository,
    private userCourseRepository: IUserCourseRepository,
    private userProgressRepository: IUserProgressRepository
  ) {}

  async execute({
    userId,
    courseId,
    slug,
  }: GetCourseProgressRequest): Promise<GetCourseProgressResponse> {
    // Se slug foi fornecido, buscar o curso pelo slug
    let finalCourseId: string;

    if (slug && !courseId) {
      const course = await this.courseRepository.findBySlug(slug);

      if (!course) {
        throw new CourseNotFoundError();
      }

      finalCourseId = course.id;
    } else if (!courseId) {
      throw new CourseNotFoundError();
    } else {
      // Se courseId foi fornecido, verificar se o curso existe
      const course = await this.courseRepository.findById(courseId);

      if (!course) {
        throw new CourseNotFoundError();
      }

      finalCourseId = courseId;
    }

    // Verificar se o curso existe (já verificado acima, mas mantendo para consistência)
    const course = await this.courseRepository.findById(finalCourseId);
    if (!course) {
      throw new CourseNotFoundError();
    }

    // Verificar se o usuário está inscrito
    const userCourse = await this.userCourseRepository.findByUserAndCourse(
      userId,
      finalCourseId
    );

    if (!userCourse) {
      throw new Error("User is not enrolled in this course");
    }

    // Buscar todos os módulos do curso com seus groups e lessons
    const modules = await prisma.module.findMany({
      where: { courseId: finalCourseId },
      include: {
        groups: {
          include: {
            lessons: {
              select: {
                id: true,
              },
            },
          },
        },
      },
      orderBy: {
        id: "asc",
      },
    });

    // Buscar todos os progressos do usuário neste curso
    const userProgresses = await this.userProgressRepository.findByUserCourse(
      userCourse.id
    );

    // Calcular progresso por módulo
    const modulesProgress: ModuleProgress[] = await Promise.all(
      modules.map(async (module) => {
        // Contar total de lessons no módulo
        const totalLessons = module.groups.reduce(
          (acc, group) => acc + group.lessons.length,
          0
        );

        // Contar lessons completadas pelo aluno neste módulo
        const completedLessons =
          await this.userProgressRepository.countCompletedInModule(
            userId,
            module.id
          );

        // Calcular porcentagem de completamento
        const progress =
          totalLessons > 0
            ? Math.round((completedLessons / totalLessons) * 100)
            : 0;

        const isCompleted = completedLessons === totalLessons && totalLessons > 0;

        return {
          id: module.id,
          title: module.title,
          slug: module.slug,
          progress,
          totalLessons,
          completedLessons,
          isCompleted,
        };
      })
    );

    // Calcular progresso total do curso
    const allLessons: Array<{ id: number }> = [];
    modules.forEach((module) => {
      module.groups.forEach((group) => {
        group.lessons.forEach((lesson) => {
          allLessons.push({ id: lesson.id });
        });
      });
    });

    const totalLessons = allLessons.length;
    const completedLessons = userProgresses.filter((p) => p.isCompleted).length;
    const courseProgress =
      totalLessons > 0
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0;

    // Calcular módulos completados
    const completedModules = modulesProgress.filter((m) => m.isCompleted).length;
    const totalModules = modules.length;

    return {
      course: {
        id: course.id,
        title: course.title,
        slug: course.slug,
        progress: courseProgress,
        totalLessons,
        completedLessons,
        totalModules,
        completedModules,
        isCompleted: userCourse.isCompleted || courseProgress === 100,
      },
      modules: modulesProgress,
    };
  }
}

