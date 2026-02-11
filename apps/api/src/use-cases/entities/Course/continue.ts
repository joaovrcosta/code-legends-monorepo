import { ICourseRepository } from "../../../repositories/course-repository";
import { IUserCourseRepository } from "../../../repositories/user-course-repository";
import { ILessonRepository } from "../../../repositories/lesson-repository";
import { IUsersRepository } from "../../../repositories/users-repository";
import { IUserProgressRepository } from "../../../repositories/user-progress-repository";
import { CourseNotFoundError } from "../../errors/course-not-found";
import { prisma } from "../../../lib/prisma";

interface ContinueCourseRequest {
  userId: string;
  courseId?: string; // Opcional: se não fornecido, busca o curso ativo
}

interface ContinueCourseResponse {
  lesson: {
    id: number;
    title: string;
    slug: string;
    description: string;
    type: string;
    video_url: string | null;
    video_duration: string | null;
    order: number;
  } | null;
  module: {
    id: string;
    title: string;
    slug: string;
  } | null;
  course: {
    id: string;
    title: string;
    slug: string;
    progress: number;
    isCompleted: boolean;
  };
}

export class ContinueCourseUseCase {
  constructor(
    private courseRepository: ICourseRepository,
    private userCourseRepository: IUserCourseRepository,
    private lessonRepository: ILessonRepository,
    private usersRepository: IUsersRepository,
    private userProgressRepository: IUserProgressRepository
  ) {}

  async execute({
    userId,
    courseId,
  }: ContinueCourseRequest): Promise<ContinueCourseResponse> {
    // Se courseId não for fornecido, buscar o curso ativo do usuário
    let activeCourseId: string | undefined = courseId;

    if (!activeCourseId) {
      const user = await this.usersRepository.findById(userId);
      activeCourseId = user?.activeCourseId ?? undefined;

      if (!activeCourseId) {
        // Se não tem curso ativo e não foi fornecido courseId, retornar null
        return {
          lesson: null,
          module: null,
          course: {
            id: "",
            title: "",
            slug: "",
            progress: 0,
            isCompleted: false,
          },
        };
      }
    }

    // Verificar se o curso existe
    const course = await this.courseRepository.findById(activeCourseId);
    if (!course) {
      throw new CourseNotFoundError();
    }

    // Buscar inscrição do usuário
    const userCourse = await this.userCourseRepository.findByUserAndCourse(
      userId,
      activeCourseId
    );

    if (!userCourse) {
      // Se não está inscrito, retornar null para a aula
      return {
        lesson: null,
        module: null,
        course: {
          id: course.id,
          title: course.title,
          slug: course.slug,
          progress: 0,
          isCompleted: false,
        },
      };
    }

    // Se o curso está concluído, retornar null
    if (userCourse.isCompleted) {
      return {
        lesson: null,
        module: null,
        course: {
          id: course.id,
          title: course.title,
          slug: course.slug,
          progress: userCourse.progress,
          isCompleted: true,
        },
      };
    }

    // Buscar progressos do usuário
    const userProgresses = await this.userProgressRepository.findByUserCourse(
      userCourse.id
    );

    // Verificar se há progresso (lições completadas)
    const hasProgress = userProgresses.some((p) => p.isCompleted);

    // Buscar todos os módulos com grupos e aulas para determinar a primeira lição
    const modules = await prisma.module.findMany({
      where: { courseId: activeCourseId },
      include: {
        groups: {
          include: {
            lessons: {
              orderBy: {
                order: "asc",
              },
            },
          },
          orderBy: {
            id: "asc",
          },
        },
      },
      orderBy: {
        id: "asc",
      },
    });

    // Construir todas as aulas em ordem (módulo -> grupo -> order)
    const allLessons: Array<{
      id: number;
      order: number;
      moduleIndex: number;
      groupIndex: number;
    }> = [];
    modules.forEach((module, moduleIndex) => {
      module.groups.forEach((group, groupIndex) => {
        group.lessons.forEach((lesson) => {
          allLessons.push({
            id: lesson.id,
            order: lesson.order,
            moduleIndex,
            groupIndex,
          });
        });
      });
    });

    // Ordenar todas as lições por: módulo -> grupo -> order
    allLessons.sort((a, b) => {
      if (a.moduleIndex !== b.moduleIndex) {
        return a.moduleIndex - b.moduleIndex;
      }
      if (a.groupIndex !== b.groupIndex) {
        return a.groupIndex - b.groupIndex;
      }
      return a.order - b.order;
    });

    // Determinar qual será a lição atual
    // Se não houver progresso, ignorar currentTaskId e usar a primeira lição
    const validCurrentTaskId =
      hasProgress &&
      userCourse.currentTaskId &&
      allLessons.some((l) => l.id === userCourse.currentTaskId)
        ? userCourse.currentTaskId
        : allLessons[0]?.id ?? null;

    // Buscar a aula atual
    let lesson = null;
    let moduleData = null;

    if (validCurrentTaskId) {
      const foundLesson = await this.lessonRepository.findById(
        validCurrentTaskId
      );

      if (foundLesson) {
        lesson = {
          id: foundLesson.id,
          title: foundLesson.title,
          slug: foundLesson.slug,
          description: foundLesson.description,
          type: foundLesson.type,
          video_url: foundLesson.video_url,
          video_duration: foundLesson.video_duration,
          order: foundLesson.order,
        };

        // Buscar o módulo da lição atual
        const lessonGroup = await prisma.group.findFirst({
          where: {
            lessons: {
              some: {
                id: validCurrentTaskId,
              },
            },
          },
          include: {
            module: {
              select: {
                id: true,
                title: true,
                slug: true,
              },
            },
          },
        });

        if (lessonGroup?.module) {
          moduleData = lessonGroup.module;
        }
      }
    }

    return {
      lesson,
      module: moduleData,
      course: {
        id: course.id,
        title: course.title,
        slug: course.slug,
        progress: userCourse.progress,
        isCompleted: userCourse.isCompleted,
      },
    };
  }
}
