import { IUserCourseRepository } from "../../../repositories/user-course-repository";
import { ICourseRepository } from "../../../repositories/course-repository";
import { IUserProgressRepository } from "../../../repositories/user-progress-repository";
import { IUnlockedModuleRepository } from "../../../repositories/unlocked-module-repository";
import { prisma } from "../../../lib/prisma";
import { CourseNotFoundError } from "../../errors/course-not-found";

interface ContinueToNextModuleRequest {
  userId: string;
  courseId: string;
}

interface ContinueToNextModuleResponse {
  userCourse: {
    id: string;
    currentModuleId: string | null;
    currentTaskId: number | null;
  };
  nextModuleId: string | null;
  wasUnlocked: boolean; // Indica se foi desbloqueado agora ou já estava desbloqueado
}

export class ContinueToNextModuleUseCase {
  constructor(
    private userCourseRepository: IUserCourseRepository,
    private courseRepository: ICourseRepository,
    private userProgressRepository: IUserProgressRepository,
    private unlockedModuleRepository: IUnlockedModuleRepository
  ) {}

  async execute({
    userId,
    courseId,
  }: ContinueToNextModuleRequest): Promise<ContinueToNextModuleResponse> {
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

    // Buscar todos os módulos do curso em ordem
    const allModules = await prisma.module.findMany({
      where: { courseId },
      include: {
        submodules: {
          orderBy: {
            orderIndex: "asc",
          },
          include: {
            lessons: {
              orderBy: {
                order: "asc",
              },
              select: {
                id: true,
              },
            },
          },
        },
      },
      orderBy: {
        orderIndex: "asc",
      },
    });

    if (allModules.length === 0) {
      throw new Error("Course has no modules");
    }

    // Encontrar o índice do módulo atual
    const currentModuleIndex = userCourse.currentModuleId
      ? allModules.findIndex((m) => m.id === userCourse.currentModuleId)
      : -1;

    // Se não há módulo atual, definir o primeiro como atual
    if (currentModuleIndex === -1) {
      const firstModule = allModules[0];
      
      // Encontrar a primeira lesson do primeiro módulo
      let firstLesson: { id: number } | null = null;
      for (const group of firstModule.submodules) {
        if (group.lessons.length > 0) {
          firstLesson = group.lessons[0];
          break;
        }
      }

      const updatedUserCourse = await this.userCourseRepository.update(
        userCourse.id,
        {
          currentModuleId: firstModule.id,
          currentTaskId: firstLesson ? firstLesson.id : null,
          lastAccessedAt: new Date(),
        }
      );

      return {
        userCourse: {
          id: updatedUserCourse.id,
          currentModuleId: updatedUserCourse.currentModuleId,
          currentTaskId: updatedUserCourse.currentTaskId,
        },
        nextModuleId: null,
        wasUnlocked: false,
      };
    }

    // Verificar se há próximo módulo
    if (currentModuleIndex >= allModules.length - 1) {
      throw new Error("There is no next module. Course completed!");
    }

    const currentModule = allModules[currentModuleIndex];
    const nextModule = allModules[currentModuleIndex + 1];

    // Nova regra: módulos não ficam mais "bloqueados" por progresso.
    // Sempre que o usuário avança, apenas escolhemos a próxima task adequada.
    let wasUnlocked = false;
    let nextTaskId: number | null = null;

    const nextModuleLessons: number[] = [];
    nextModule.submodules.forEach((group) => {
      group.lessons.forEach((lesson) => {
        nextModuleLessons.push(lesson.id);
      });
    });

    const userProgresses = await this.userProgressRepository.findByUserCourse(
      userCourse.id
    );

    const completedLessonsInNextModule = new Set(
      userProgresses
        .filter((p) => p.isCompleted && nextModuleLessons.includes(p.taskId))
        .map((p) => p.taskId)
    );

    let foundNextTask = false;
    for (const lessonId of nextModuleLessons) {
      if (!completedLessonsInNextModule.has(lessonId)) {
        nextTaskId = lessonId;
        foundNextTask = true;
        break;
      }
    }

    if (!foundNextTask && nextModuleLessons.length > 0) {
      nextTaskId = nextModuleLessons[nextModuleLessons.length - 1];
    } else if (!foundNextTask) {
      nextTaskId = null;
    }

    // Atualizar o UserCourse
    const updatedUserCourse = await this.userCourseRepository.update(
      userCourse.id,
      {
        currentModuleId: nextModule.id,
        currentTaskId: nextTaskId,
        lastAccessedAt: new Date(),
      }
    );

    return {
      userCourse: {
        id: updatedUserCourse.id,
        currentModuleId: updatedUserCourse.currentModuleId,
        currentTaskId: updatedUserCourse.currentTaskId,
      },
      nextModuleId: nextModule.id,
      wasUnlocked,
    };
  }
}

