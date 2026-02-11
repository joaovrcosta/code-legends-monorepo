import { ICourseRepository } from "../../../repositories/course-repository";
import { IUserCourseRepository } from "../../../repositories/user-course-repository";
import { IUserProgressRepository } from "../../../repositories/user-progress-repository";
import { CourseNotFoundError } from "../../errors/course-not-found";
import { prisma } from "../../../lib/prisma";

interface RoadmapLesson {
  id: number;
  title: string;
  slug: string;
  description: string;
  type: string;
  video_url: string | null;
  video_duration: string | null;
  order: number;
  status: "locked" | "unlocked" | "completed";
  isCurrent: boolean;
  canReview: boolean; // Permite revisitar aulas concluídas
}

interface RoadmapGroup {
  id: number;
  title: string;
  lessons: RoadmapLesson[];
}

interface RoadmapModule {
  id: string;
  title: string;
  slug: string;
  groups: RoadmapGroup[];
  progress: number;
  isCompleted: boolean;
}

interface GetRoadmapRequest {
  userId: string;
  courseId: string;
}

interface GetRoadmapResponse {
  course: {
    id: string;
    title: string;
    slug: string;
    progress: number;
    isCompleted: boolean;
    author: {
      name: string;
    };
    currentModule: number | null;
    currentModuleId: string | null;
    nextModule: number | null;
    totalModules: number;
    currentClass: number | null;
    canUnlockNextModule?: boolean; // Se pode desbloquear o próximo módulo
    isLastLessonCompleted?: boolean; // Se a última lição do módulo atual está completa
  };
  modules: RoadmapModule[];
}

export class GetRoadmapUseCase {
  constructor(
    private courseRepository: ICourseRepository,
    private userCourseRepository: IUserCourseRepository,
    private userProgressRepository: IUserProgressRepository
  ) {}

  async execute({
    userId,
    courseId,
  }: GetRoadmapRequest): Promise<GetRoadmapResponse> {
    // Verificar se o curso existe
    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw new CourseNotFoundError();
    }

    // Verificar se o usuário está inscrito
    const userCourse = await this.userCourseRepository.findByUserAndCourse(
      userId,
      courseId
    );

    // Buscar todos os módulos com grupos e aulas
    const modules = await prisma.module.findMany({
      where: { courseId },
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

    // Buscar todos os progressos do usuário neste curso
    const userProgresses = userCourse?.id
      ? await this.userProgressRepository.findByUserCourse(userCourse.id)
      : [];

    const progressMap = new Map<number, boolean>();
    userProgresses.forEach((progress) => {
      progressMap.set(progress.taskId, progress.isCompleted);
    });

    // Construir todas as aulas em ordem para determinar desbloqueio
    // Incluir order, moduleIndex e groupIndex para ordenação correta
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

    const currentTaskId = userCourse?.currentTaskId ?? null;

    // Verificar se há progresso (lições completadas)
    const hasProgress = userProgresses.some((p) => p.isCompleted);

    // Determinar qual será a lição atual
    // Se não houver progresso, SEMPRE usar a primeira lição (curso resetado ou novo)
    // Se houver progresso, usar o currentTaskId se ele existir na lista de lessons
    let validCurrentTaskId: number | null = null;
    
    if (!hasProgress) {
      // Sem progresso = curso resetado ou novo, sempre começar da primeira lesson
      validCurrentTaskId = allLessons[0]?.id ?? null;
    } else {
      // Com progresso, usar o currentTaskId se for válido
      if (currentTaskId && allLessons.some((l) => l.id === currentTaskId)) {
        validCurrentTaskId = currentTaskId;
      } else {
        // Se currentTaskId não for válido, usar a primeira lesson
        validCurrentTaskId = allLessons[0]?.id ?? null;
      }
    }

    // Identificar o módulo atual
    let currentModuleId: string | null = null;

    // Primeiro, tentar usar o currentModuleId do userCourse
    if (userCourse?.currentModuleId) {
      const moduleExists = modules.some(
        (m) => m.id === userCourse.currentModuleId
      );
      if (moduleExists) {
        currentModuleId = userCourse.currentModuleId;
      }
    }

    // Se não encontrou pelo currentModuleId, tentar determinar pelo currentTaskId
    if (!currentModuleId && validCurrentTaskId) {
      // Encontrar em qual módulo está a aula atual
      for (const module of modules) {
        const hasLesson = module.groups.some((group) =>
          group.lessons.some((lesson) => lesson.id === validCurrentTaskId)
        );
        if (hasLesson) {
          currentModuleId = module.id;
          break;
        }
      }
    }

    // Se ainda não encontrou, usar o primeiro módulo
    if (!currentModuleId && modules.length > 0) {
      currentModuleId = modules[0].id;
    }

    // Identificar o módulo atual (para cálculos de currentModule, nextModule, etc)
    const currentModule = modules.find((m) => m.id === currentModuleId);

    // Função auxiliar para construir o roadmap de um módulo
    const buildModuleRoadmap = (module: typeof modules[0]): RoadmapModule => {
      // Calcular progresso do módulo em tempo real
      const moduleLessons: Array<{ id: number }> = [];
      module.groups.forEach((group) => {
        group.lessons.forEach((lesson) => {
          moduleLessons.push({ id: lesson.id });
        });
      });

      const totalModuleLessons = moduleLessons.length;
      const completedModuleLessons = userProgresses.filter((p) => {
        return p.isCompleted && moduleLessons.some((l) => l.id === p.taskId);
      }).length;

      const moduleProgressValue =
        totalModuleLessons > 0
          ? completedModuleLessons / totalModuleLessons
          : 0;
      const moduleCompleted = completedModuleLessons === totalModuleLessons;

      const roadmapGroups: RoadmapGroup[] = module.groups.map((group) => {
        const roadmapLessons: RoadmapLesson[] = group.lessons.map((lesson) => {
          const isCompleted = progressMap.get(lesson.id) ?? false;
          const lessonIndex = allLessons.findIndex((l) => l.id === lesson.id);

          // Determinar status
          let status: "locked" | "unlocked" | "completed";
          if (isCompleted) {
            status = "completed";
          } else if (lessonIndex === 0) {
            status = "unlocked"; // Primeira aula sempre desbloqueada
          } else {
            // Verificar se a aula anterior foi concluída
            const previousLesson = allLessons[lessonIndex - 1];
            const previousCompleted =
              progressMap.get(previousLesson.id) ?? false;
            status = previousCompleted ? "unlocked" : "locked";
          }

          const isCurrent = lesson.id === validCurrentTaskId;

          // Pode revisar se a aula foi concluída
          const canReview = isCompleted;

          return {
            id: lesson.id,
            title: lesson.title,
            slug: lesson.slug,
            description: lesson.description,
            type: lesson.type,
            video_url: lesson.video_url,
            video_duration: lesson.video_duration,
            order: lesson.order,
            status,
            isCurrent,
            canReview,
          };
        });

        return {
          id: group.id,
          title: group.title,
          lessons: roadmapLessons,
        };
      });

      return {
        id: module.id,
        title: module.title,
        slug: module.slug,
        groups: roadmapGroups,
        progress: moduleProgressValue,
        isCompleted: moduleCompleted,
      };
    };

    // Construir o roadmap para TODOS os módulos
    const roadmapModules: RoadmapModule[] = modules.map(buildModuleRoadmap);

    // Calcular progresso geral do curso
    const totalLessons = allLessons.length;
    const completedLessons = userProgresses.filter((p) => p.isCompleted).length;
    const courseProgress =
      totalLessons > 0 ? completedLessons / totalLessons : 0;

    // Calcular módulo atual (índice + 1, começando em 1)
    let currentModuleIndex: number | null = null;

    if (currentModuleId) {
      const moduleIndex = modules.findIndex((m) => m.id === currentModuleId);
      if (moduleIndex >= 0) {
        currentModuleIndex = moduleIndex + 1;
      }
    }

    // Calcular próximo módulo (se existir)
    let nextModuleIndex: number | null = null;
    if (currentModuleIndex !== null) {
      const currentModuleArrayIndex = currentModuleIndex - 1; // Converter de número do módulo para índice do array
      if (
        currentModuleArrayIndex >= 0 &&
        currentModuleArrayIndex < modules.length - 1
      ) {
        // Se existe um próximo módulo no array
        nextModuleIndex = currentModuleArrayIndex + 2; // +2 porque: +1 para o próximo índice, +1 para converter para número do módulo
      }
    }

    // Calcular se a última lição do módulo atual está completa
    let isLastLessonCompleted = false;
    let currentClass: number | null = null;
    
    if (currentModule) {
      // Encontrar todas as lições do módulo atual
      const currentModuleLessons: Array<{
        id: number;
        order: number;
        groupIndex: number;
      }> = [];
      currentModule.groups.forEach((group, groupIndex) => {
        group.lessons.forEach((lesson) => {
          currentModuleLessons.push({
            id: lesson.id,
            order: lesson.order,
            groupIndex,
          });
        });
      });

      if (currentModuleLessons.length > 0) {
        // Ordenar por grupo e depois por order
        currentModuleLessons.sort((a, b) => {
          if (a.groupIndex !== b.groupIndex) {
            return a.groupIndex - b.groupIndex;
          }
          return a.order - b.order;
        });

        // Calcular currentClass dentro do módulo atual (não em relação a todas as lessons do curso)
        if (validCurrentTaskId) {
          const classIndexInModule = currentModuleLessons.findIndex(
            (l) => l.id === validCurrentTaskId
          );
          currentClass = classIndexInModule >= 0 ? classIndexInModule + 1 : null;
        }

        // Encontrar a última lição do módulo atual
        const lastLesson =
          currentModuleLessons[currentModuleLessons.length - 1];
        isLastLessonCompleted = progressMap.get(lastLesson.id) ?? false;
      }
    }

    // Calcular se pode desbloquear o próximo módulo
    // Precisa: todas as lições do módulo atual completadas E existe próximo módulo
    let canUnlockNextModule = false;
    if (currentModule && nextModuleIndex !== null) {
      // Verificar se todas as lições do módulo atual foram completadas
      const moduleLessons: Array<{ id: number }> = [];
      currentModule.groups.forEach((group) => {
        group.lessons.forEach((lesson) => {
          moduleLessons.push({ id: lesson.id });
        });
      });

      const totalModuleLessons = moduleLessons.length;
      const completedModuleLessons = userProgresses.filter((p) => {
        return p.isCompleted && moduleLessons.some((l) => l.id === p.taskId);
      }).length;

      canUnlockNextModule =
        completedModuleLessons === totalModuleLessons && totalModuleLessons > 0;
    }

    // Type assertion necessário porque o Prisma retorna Course com includes
    const courseWithInstructor = course as typeof course & {
      instructor?: { name: string };
    };

    return {
      course: {
        id: course.id,
        title: course.title,
        slug: course.slug,
        progress: courseProgress,
        isCompleted: userCourse?.isCompleted ?? false,
        author: {
          name: courseWithInstructor.instructor?.name ?? "",
        },
        currentModule: currentModuleIndex,
        currentModuleId: currentModuleId,
        nextModule: nextModuleIndex,
        totalModules: modules.length,
        currentClass,
        canUnlockNextModule,
        isLastLessonCompleted,
      },
      modules: roadmapModules,
    };
  }
}
