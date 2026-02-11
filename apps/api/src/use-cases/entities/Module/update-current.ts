import { IUserCourseRepository } from "../../../repositories/user-course-repository";
import { IModuleRepository } from "../../../repositories/module-repository";
import { ICourseRepository } from "../../../repositories/course-repository";
import { IUserProgressRepository } from "../../../repositories/user-progress-repository";
import { prisma } from "../../../lib/prisma";
import { CourseNotFoundError } from "../../errors/course-not-found";
import { ModuleNotFoundError } from "../../errors/module-not-found";

interface UpdateCurrentModuleRequest {
  userId: string;
  courseId: string;
  moduleId: string;
}

interface UpdateCurrentModuleResponse {
  userCourse: {
    id: string;
    currentModuleId: string | null;
    currentTaskId: number | null;
  };
}

export class UpdateCurrentModuleUseCase {
  constructor(
    private userCourseRepository: IUserCourseRepository,
    private moduleRepository: IModuleRepository,
    private courseRepository: ICourseRepository,
    private userProgressRepository: IUserProgressRepository
  ) {}

  async execute({
    userId,
    courseId,
    moduleId,
  }: UpdateCurrentModuleRequest): Promise<UpdateCurrentModuleResponse> {
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

    // Verificar se o módulo existe e pertence ao curso
    const module = await this.moduleRepository.findById(moduleId);
    if (!module) {
      throw new ModuleNotFoundError();
    }

    if (module.courseId !== courseId) {
      throw new Error("Module does not belong to this course");
    }

    // Buscar todos os módulos do curso em ordem
    const allModules = await prisma.module.findMany({
      where: { courseId },
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

    // Encontrar o índice do módulo atual e do módulo desejado
    const currentModuleIndex = userCourse.currentModuleId
      ? allModules.findIndex((m) => m.id === userCourse.currentModuleId)
      : -1;

    const targetModuleIndex = allModules.findIndex((m) => m.id === moduleId);

    if (targetModuleIndex === -1) {
      throw new ModuleNotFoundError();
    }

    // Verificar se o módulo está bloqueado
    const isLocked = await this.isModuleLocked(
      userId,
      userCourse,
      allModules,
      currentModuleIndex,
      targetModuleIndex
    );

    if (isLocked) {
      throw new Error("Module is locked. Complete the previous module first.");
    }

    // Buscar a primeira lesson do módulo para atualizar o currentTaskId
    const moduleWithLessons = await prisma.module.findUnique({
      where: { id: moduleId },
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
    });

    // Se o módulo já é o atual e o usuário já tem uma task, manter a task atual
    // Caso contrário, definir para a primeira lesson do módulo
    let currentTaskId: number | null = null;

    if (userCourse.currentModuleId === moduleId && userCourse.currentTaskId) {
      // Verificar se a task atual ainda pertence ao módulo
      const currentTask = await prisma.lesson.findUnique({
        where: { id: userCourse.currentTaskId },
        include: {
          submodule: {
            include: {
              module: true,
            },
          },
        },
      });

      if (currentTask?.submodule.module.id === moduleId) {
        // Manter a task atual se ainda pertence ao módulo
        currentTaskId = userCourse.currentTaskId;
      } else {
        // Se não pertence mais, usar a primeira lesson do módulo
        const firstGroup = moduleWithLessons?.groups[0];
        const firstLesson = firstGroup?.lessons[0];
        currentTaskId = firstLesson?.id ?? null;
      }
    } else {
      // Se está mudando de módulo, usar a primeira lesson do novo módulo
      const firstGroup = moduleWithLessons?.groups[0];
      const firstLesson = firstGroup?.lessons[0];
      currentTaskId = firstLesson?.id ?? null;
    }

    // Atualizar o UserCourse
    const updatedUserCourse = await this.userCourseRepository.update(
      userCourse.id,
      {
        currentModuleId: moduleId,
        currentTaskId,
        lastAccessedAt: new Date(),
      }
    );

    return {
      userCourse: {
        id: updatedUserCourse.id,
        currentModuleId: updatedUserCourse.currentModuleId,
        currentTaskId: updatedUserCourse.currentTaskId,
      },
    };
  }

  private async isModuleLocked(
    userId: string,
    userCourse: any,
    modules: any[],
    currentModuleIndex: number,
    targetModuleIndex: number
  ): Promise<boolean> {
    // Se não há progresso no curso, apenas o primeiro módulo está desbloqueado
    const hasProgress =
      (await prisma.userProgress.count({
        where: {
          userId,
          userCourseId: userCourse.id,
          isCompleted: true,
          task: {
            submodule: {
              module: {
                courseId: userCourse.courseId,
              },
            },
          },
        },
      })) > 0;

    if (!hasProgress) {
      return targetModuleIndex > 0;
    }

    if (currentModuleIndex === -1) {
      return targetModuleIndex > 0;
    }

    // Se está tentando acessar o módulo atual, não está bloqueado
    if (targetModuleIndex === currentModuleIndex) {
      return false;
    }

    // Se está tentando acessar um módulo anterior ao atual
    if (targetModuleIndex < currentModuleIndex) {
      // Verificar se o módulo anterior está 100% completo
      const targetModule = modules[targetModuleIndex];
      const totalLessons = targetModule.groups.reduce(
        (acc: number, group: any) => acc + group.lessons.length,
        0
      );
      const completedLessons =
        await this.userProgressRepository.countCompletedInModule(
          userId,
          targetModule.id
        );
      return completedLessons < totalLessons;
    }

    // Se está tentando acessar um módulo posterior ao atual
    // Verificar se o módulo atual está 100% completo
    const currentModule = modules[currentModuleIndex];
    const currentModuleTotalLessons = currentModule.groups.reduce(
      (acc: number, group: any) => acc + group.lessons.length,
      0
    );
    const currentModuleCompletedLessons =
      await this.userProgressRepository.countCompletedInModule(
        userId,
        currentModule.id
      );

    return currentModuleCompletedLessons < currentModuleTotalLessons;
  }
}
