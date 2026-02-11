import { IModuleRepository } from "../../../repositories/module-repository";
import { IUserCourseRepository } from "../../../repositories/user-course-repository";
import { IUserProgressRepository } from "../../../repositories/user-progress-repository";
import { ICourseRepository } from "../../../repositories/course-repository";
import { IUnlockedModuleRepository } from "../../../repositories/unlocked-module-repository";
import { prisma } from "../../../lib/prisma";
import { CourseNotFoundError } from "../../errors/course-not-found";

interface ModuleWithProgress {
  id: string;
  title: string;
  slug: string;
  courseId: string;
  progress: number; // Porcentagem de completamento (0-100)
  isCurrent: boolean; // Se é o módulo atual do aluno (para completar)
  active: boolean; // Se é o módulo que o usuário está visualizando no momento
  totalLessons: number; // Quantidade total de lessons no módulo
  completedLessons: number; // Quantidade de lessons completadas pelo aluno
  locked: boolean; // Se o módulo está bloqueado
  canUnlock: boolean; // Se pode desbloquear o próximo módulo (apenas no módulo atual quando está 100% completo)
}

interface ListModulesWithProgressRequest {
  userId: string;
  courseId?: string;
  slug?: string;
  currentModule?: string;
}

interface ListModulesWithProgressResponse {
  modules: ModuleWithProgress[];
  nextModule: ModuleWithProgress | null;
}

export class ListModulesWithProgressUseCase {
  constructor(
    private moduleRepository: IModuleRepository,
    private userCourseRepository: IUserCourseRepository,
    private userProgressRepository: IUserProgressRepository,
    private courseRepository: ICourseRepository,
    private unlockedModuleRepository: IUnlockedModuleRepository
  ) {}

  async execute({
    userId,
    courseId,
    slug,
    currentModule,
  }: ListModulesWithProgressRequest): Promise<ListModulesWithProgressResponse> {
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
      const course = await prisma.course.findUnique({
        where: { id: courseId },
      });

      if (!course) {
        throw new CourseNotFoundError();
      }

      finalCourseId = courseId;
    }

    // Verificar se o usuário está inscrito no curso
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

    // Verificar se há progresso no curso (alguma lesson completada)
    const totalCompletedLessonsInCourse = await prisma.userProgress.count({
      where: {
        userId,
        userCourseId: userCourse.id,
        isCompleted: true,
        task: {
          submodule: {
            module: {
              courseId: finalCourseId,
            },
          },
        },
      },
    });

    const hasProgress = totalCompletedLessonsInCourse > 0;

    // Buscar todos os módulos desbloqueados pelo usuário neste curso
    const unlockedModules = await this.unlockedModuleRepository.findByUserAndCourse(
      userId,
      finalCourseId
    );
    const unlockedModuleIds = new Set(unlockedModules.map((um) => um.moduleId));

    // Encontrar o índice do módulo atual (para completar)
    // O módulo atual é aquele que o aluno está trabalhando para completar
    // Pode ser diferente do módulo que ele está visualizando (active)
    let currentModuleIndex = -1;
    let currentModuleIdForCompletion: string | null = null;
    
    // Se currentModule foi fornecido como parâmetro, usar ele diretamente
    // Caso contrário, usar o currentModuleId do userCourse (mesmo do roadmap)
    const moduleToUse = currentModule || userCourse.currentModuleId;
    
    if (moduleToUse) {
      const moduleIndex = modules.findIndex((m) => m.id === moduleToUse || m.slug === moduleToUse);
      if (moduleIndex >= 0) {
        currentModuleIndex = moduleIndex;
        currentModuleIdForCompletion = modules[moduleIndex].id;
      }
    }
    
    // Se não encontrou pelo parâmetro ou userCourse, determinar automaticamente
    if (currentModuleIndex === -1) {
      // Determinar qual módulo o aluno está trabalhando para completar
      // Isso é baseado no primeiro módulo desbloqueado que não está 100% completo
      // O primeiro módulo sempre está desbloqueado
      for (let i = 0; i < modules.length; i++) {
        const module = modules[i];
        
        // Verificar se o módulo está desbloqueado
        const isUnlocked = i === 0 || unlockedModuleIds.has(module.id);
        
        if (!isUnlocked) {
          // Se o módulo não está desbloqueado, não pode ser o atual
          continue;
        }
        
        const totalLessons = module.groups.reduce(
          (acc, group) => acc + group.lessons.length,
          0
        );
        const completedLessons =
          await this.userProgressRepository.countCompletedInModule(
            userId,
            module.id
          );
        const isCompleted = completedLessons === totalLessons && totalLessons > 0;
        
        if (!isCompleted) {
          currentModuleIdForCompletion = module.id;
          currentModuleIndex = i;
          break;
        }
      }
      
      // Se todos os módulos desbloqueados estão completos, o último desbloqueado é o atual
      if (currentModuleIndex === -1 && modules.length > 0) {
        // Encontrar o último módulo desbloqueado
        for (let i = modules.length - 1; i >= 0; i--) {
          const module = modules[i];
          const isUnlocked = i === 0 || unlockedModuleIds.has(module.id);
          if (isUnlocked) {
            currentModuleIndex = i;
            currentModuleIdForCompletion = module.id;
            break;
          }
        }
      }
    }

    // Processar cada módulo e calcular progresso em tempo real
    const modulesWithProgress: ModuleWithProgress[] = await Promise.all(
      modules.map(async (module, index) => {
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

        // Verificar se é o módulo atual (para completar)
        const isCurrent = currentModuleIdForCompletion === module.id;

        // Verificar se é o módulo ativo (que o usuário está visualizando)
        // O módulo ativo é aquele que está definido no currentModuleId do userCourse
        const active = userCourse.currentModuleId !== null && userCourse.currentModuleId === module.id;

        // Verificar se é o próximo módulo ao atual (para completar)
        const isNextModule = currentModuleIndex >= 0 && index === currentModuleIndex + 1;

        // Verificar se o módulo atual está completo
        let canUnlock = false;
        if (currentModuleIndex >= 0) {
          const currentModule = modules[currentModuleIndex];
          const currentModuleTotalLessons = currentModule.groups.reduce(
            (acc, group) => acc + group.lessons.length,
            0
          );
          const currentModuleCompletedLessons =
            await this.userProgressRepository.countCompletedInModule(
              userId,
              currentModule.id
            );
          const isCurrentModuleCompleted = currentModuleCompletedLessons === currentModuleTotalLessons && currentModuleTotalLessons > 0;
          
          // O módulo atual e o próximo módulo têm canUnlock: true quando o atual está completo
          if (isCurrent && isCurrentModuleCompleted && index < modules.length - 1) {
            canUnlock = true;
          } else if (isNextModule && isCurrentModuleCompleted) {
            canUnlock = true;
          }
        }

        // Determinar se o módulo está bloqueado
        let locked = false;

        // Se não há progresso no curso, apenas o primeiro módulo está desbloqueado
        if (!hasProgress) {
          locked = index > 0;
        } else if (currentModuleIndex === -1) {
          // Se não há módulo atual definido, apenas o primeiro está desbloqueado
          locked = index > 0;
        } else if (index < currentModuleIndex) {
          // Módulos anteriores ao atual: desbloqueados se estiverem 100% completos (para revisão)
          const isCompleted = progress === 100;
          locked = !isCompleted;
        } else if (index === currentModuleIndex) {
          // O módulo atual nunca está bloqueado
          locked = false;
        } else {
          // Módulos depois do atual: verificar se foram desbloqueados manualmente
          // Se o módulo foi desbloqueado anteriormente, permanece desbloqueado
          const isUnlocked = unlockedModuleIds.has(module.id);
          locked = !isUnlocked;
        }

        return {
          id: module.id,
          title: module.title,
          slug: module.slug,
          courseId: module.courseId,
          progress,
          isCurrent,
          active,
          totalLessons,
          completedLessons,
          locked,
          canUnlock,
        };
      })
    );

    // Encontrar o próximo módulo ao atual
    let nextModule: ModuleWithProgress | null = null;
    if (currentModuleIndex >= 0 && currentModuleIndex < modules.length - 1) {
      nextModule = modulesWithProgress[currentModuleIndex + 1] || null;
    }

    return {
      modules: modulesWithProgress,
      nextModule,
    };
  }
}
