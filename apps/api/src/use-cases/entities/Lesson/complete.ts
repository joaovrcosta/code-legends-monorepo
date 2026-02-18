import { IUserProgressRepository } from "../../../repositories/user-progress-repository";
import { IUserModuleProgressRepository } from "../../../repositories/user-module-progress-repository";
import { IUserCourseRepository } from "../../../repositories/user-course-repository";
import { ILessonRepository } from "../../../repositories/lesson-repository";
import { IModuleRepository } from "../../../repositories/module-repository";
import { ICourseRepository } from "../../../repositories/course-repository";
import { IUsersRepository } from "../../../repositories/users-repository";
import { LessonNotFoundError } from "../../errors/lesson-not-found";
import { CourseNotFoundError } from "../../errors/course-not-found";
import { prisma } from "../../../lib/prisma";
import { NotificationBuilder } from "../../../utils/notification-builder";
import { createNotification } from "../../../utils/create-notification";

interface CompleteLessonRequest {
  userId: string;
  lessonId: number;
  score?: number;
}

interface CompleteLessonResponse {
  success: boolean;
  nextLessonId: number | null;
  moduleCompleted: boolean;
  courseCompleted: boolean;
  courseProgress: number;
  xpGained?: number;
  totalXp?: number;
  level?: number;
  xpToNextLevel?: number;
  progress?: number;
}

export class CompleteLessonUseCase {
  private readonly XP_PER_LESSON = 50; // XP fixo por lição completada

  constructor(
    private userProgressRepository: IUserProgressRepository,
    private userModuleProgressRepository: IUserModuleProgressRepository,
    private userCourseRepository: IUserCourseRepository,
    private lessonRepository: ILessonRepository,
    private moduleRepository: IModuleRepository,
    private courseRepository: ICourseRepository,
    private usersRepository: IUsersRepository
  ) { }

  async execute({
    userId,
    lessonId,
    score,
  }: CompleteLessonRequest): Promise<CompleteLessonResponse> {
    // Buscar a aula com todas as relações necessárias
    const lesson = await this.lessonRepository.findById(lessonId);
    if (!lesson) {
      throw new LessonNotFoundError();
    }

    // Buscar o grupo (submodule) para obter o moduleId
    const group = await prisma.group.findUnique({
      where: { id: lesson.submoduleId },
      include: {
        module: true,
      },
    });

    if (!group) {
      throw new Error("Group not found");
    }

    const courseId = group.module.courseId;

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

    // Verificar se a lição já foi completada (para evitar duplicação de XP)
    const existingProgress = await this.userProgressRepository.findByUserAndTask(
      userId,
      lessonId
    );
    const wasAlreadyCompleted = existingProgress?.isCompleted ?? false;

    // Marcar a aula como concluída
    await this.userProgressRepository.upsert({
      userId,
      taskId: lessonId,
      userCourseId: userCourse.id,
      isCompleted: true,
      score,
    });

    // Adicionar XP apenas se a lição não estava completa antes
    let xpGained = 0;
    let totalXp = 0;
    let level = 1;
    let xpToNextLevel = 100;

    // Buscar usuário atual para obter XP atual (sempre necessário para retornar dados atualizados)
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Calcular xpToNextLevel inicial baseado no nível atual do usuário
    xpToNextLevel = this.calculateXpToNextLevel(user.level, user.totalXp);

    if (!wasAlreadyCompleted) {
      // Calcular novo XP e nível
      const newTotalXp = user.totalXp + this.XP_PER_LESSON;
      const newLevel = this.calculateLevel(newTotalXp);
      const newXpToNextLevel = this.calculateXpToNextLevel(
        newLevel,
        newTotalXp
      );

      const levelUp = newLevel > user.level;

      // Atualizar usuário com novo XP e nível usando transação
      await prisma.$transaction(async (tx) => {
        // Atualizar XP e nível do usuário
        await tx.user.update({
          where: { id: userId },
          data: {
            totalXp: newTotalXp,
            level: newLevel,
            xpToNextLevel: newXpToNextLevel,
          },
        });

        // Registrar no histórico de XP
        await tx.userXpHistory.create({
          data: {
            userId,
            xpAmount: this.XP_PER_LESSON,
            source: "lesson_completed",
            sourceId: lessonId,
            description: `Completou lição: ${lesson.title}`,
          },
        });

        // Criar notificação de level up dentro da transação
        if (levelUp) {
          try {
            const notificationData = NotificationBuilder.createLevelUpNotification(
              userId,
              {
                level: newLevel,
                totalXp: newTotalXp,
                xpToNextLevel: newXpToNextLevel,
              }
            );

            await createNotification({
              ...notificationData,
              tx,
            });
          } catch (error) {
            // Não quebra o fluxo se a notificação falhar
            console.error("Erro ao criar notificação de level up:", error);
          }
        }
      });

      xpGained = this.XP_PER_LESSON;
      totalXp = newTotalXp;
      level = newLevel;
      xpToNextLevel = newXpToNextLevel;
    } else {
      // Se já estava completa, recalcular nível e xpToNextLevel baseado no XP atual
      // Isso garante que se a fórmula mudou, os valores sejam atualizados
      totalXp = user.totalXp;
      level = this.calculateLevel(user.totalXp);
      xpToNextLevel = this.calculateXpToNextLevel(level, user.totalXp);

      // Se o nível calculado for diferente do armazenado, atualizar no banco
      if (level !== user.level || xpToNextLevel !== user.xpToNextLevel) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            level,
            xpToNextLevel,
          },
        });
      }
    }

    // Buscar todas as aulas do módulo para calcular o progresso
    const moduleWithLessons = await prisma.module.findUnique({
      where: { id: group.moduleId },
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
    });

    if (!moduleWithLessons) {
      throw new Error("Module not found");
    }

    // Calcular total de aulas do módulo
    const totalTasksInModule = moduleWithLessons.groups.reduce(
      (acc, group) => acc + group.lessons.length,
      0
    );

    // Contar aulas concluídas no módulo
    const tasksCompleted =
      await this.userProgressRepository.countCompletedInModule(
        userId,
        group.moduleId
      );

    // Calcular progresso do módulo
    const moduleProgress =
      totalTasksInModule > 0 ? tasksCompleted / totalTasksInModule : 0;
    const moduleCompleted = tasksCompleted === totalTasksInModule;

    // Atualizar progresso do módulo
    await this.userModuleProgressRepository.upsert({
      userId,
      moduleId: group.moduleId,
      userCourseId: userCourse.id,
      totalTasks: totalTasksInModule,
      tasksCompleted,
      progress: moduleProgress,
      isCompleted: moduleCompleted,
    });

    // Buscar todas as aulas do curso em ordem
    const allLessons = await this.getAllLessonsInOrder(courseId);

    // Encontrar a próxima aula não concluída
    let nextLessonId: number | null = null;
    const currentLessonIndex = allLessons.findIndex((l) => l.id === lessonId);

    if (currentLessonIndex !== -1) {
      // Verificar se há próxima aula e se ela está desbloqueada
      for (let i = currentLessonIndex + 1; i < allLessons.length; i++) {
        const nextLesson = allLessons[i];
        const isUnlocked = await this.isLessonUnlocked(
          userId,
          nextLesson.id,
          allLessons
        );

        if (isUnlocked) {
          nextLessonId = nextLesson.id;
          break;
        }
      }
    }

    // Calcular progresso do curso
    const completedLessons = await prisma.userProgress.count({
      where: {
        userId,
        isCompleted: true,
        task: {
          submodule: {
            module: {
              courseId,
            },
          },
        },
      },
    });

    const courseProgress =
      allLessons.length > 0 ? completedLessons / allLessons.length : 0;
    const courseCompleted = completedLessons === allLessons.length;
    const wasCourseCompleted = userCourse.isCompleted;
    const isNewlyCompleted = courseCompleted && !wasCourseCompleted;

    // Atualizar UserCourse
    const nextLesson = nextLessonId
      ? allLessons.find((l) => l.id === nextLessonId)
      : null;

    if (nextLesson && nextLessonId !== null) {
      const nextLessonGroup = await prisma.group.findFirst({
        where: {
          lessons: {
            some: {
              id: nextLessonId,
            },
          },
        },
        include: {
          module: true,
        },
      });

      // Verificar se a próxima lesson está em outro módulo
      const nextModuleId = nextLessonGroup?.moduleId;
      const currentModuleId = group.moduleId;

      // Se a próxima lesson está em outro módulo, NÃO avançar automaticamente
      // O usuário deve usar o botão "Desbloquear próximo módulo" para avançar
      if (nextModuleId && nextModuleId !== currentModuleId) {
        // Não pode avançar para o próximo módulo automaticamente
        // Manter no módulo atual e usar a lesson atual (completada) como currentTaskId
        await this.userCourseRepository.update(userCourse.id, {
          currentTaskId: lessonId,
          currentModuleId: userCourse.currentModuleId ?? currentModuleId,
          progress: courseProgress,
          isCompleted: courseCompleted,
          completedAt: courseCompleted ? new Date() : null,
        });
      } else {
        // A próxima lesson está no mesmo módulo, pode avançar normalmente
        await this.userCourseRepository.update(userCourse.id, {
          currentTaskId: nextLessonId,
          currentModuleId: userCourse.currentModuleId ?? currentModuleId,
          progress: courseProgress,
          isCompleted: courseCompleted,
          completedAt: courseCompleted ? new Date() : null,
        });
      }
    } else {
      await this.userCourseRepository.update(userCourse.id, {
        currentTaskId: null,
        progress: courseProgress,
        isCompleted: true,
        completedAt: new Date(),
      });
    }

    // Criar notificação de curso completado
    if (isNewlyCompleted) {
      try {
        const notificationData = NotificationBuilder.createCourseCompletedNotification(
          userId,
          {
            courseId: course.id,
            courseTitle: course.title,
            courseSlug: course.slug,
          }
        );

        await createNotification(notificationData);
      } catch (error) {
        // Não quebra o fluxo se a notificação falhar
        console.error("Erro ao criar notificação de curso completado:", error);
      }
    }

    return {
      success: true,
      nextLessonId,
      moduleCompleted,
      courseCompleted,
      courseProgress,
      xpGained,
      totalXp,
      level,
      xpToNextLevel,
      progress: Math.round(moduleProgress * 100), // Progresso do módulo em porcentagem (0-100)
    };
  }

  /**
   * Calcula o XP total necessário para alcançar um determinado nível
   * Fórmula progressiva: XP total = 100 * level + 50 * (level - 1) * level / 2
   * Exemplo:
   * - Nível 1: 100 XP total
   * - Nível 2: 250 XP total (100 + 150)
   * - Nível 3: 450 XP total (250 + 200)
   * - Nível 4: 700 XP total (450 + 250)
   */
  private calculateXpForLevel(level: number): number {
    if (level <= 1) return 100;
    // XP total = 100 * level + 50 * (level - 1) * level / 2
    // Simplificado: 100 * level + 25 * (level - 1) * level
    return 100 * level + 25 * (level - 1) * level;
  }

  /**
   * Calcula o XP necessário apenas para o próximo nível (não acumulado)
   * Fórmula: XP necessário = 100 + (level - 1) * 50
   * Exemplo:
   * - Para nível 2: 100 + (2-1) * 50 = 150 XP
   * - Para nível 3: 100 + (3-1) * 50 = 200 XP
   * - Para nível 4: 100 + (4-1) * 50 = 250 XP
   */
  private calculateXpRequiredForNextLevel(level: number): number {
    return 100 + (level - 1) * 50;
  }

  /**
   * Calcula o nível baseado no XP total
   * Usa busca binária ou iteração para encontrar o nível correto
   */
  private calculateLevel(totalXp: number): number {
    if (totalXp < 100) return 1;

    let level = 1;
    while (this.calculateXpForLevel(level + 1) <= totalXp) {
      level++;
    }
    return level;
  }

  /**
   * Calcula o XP necessário para alcançar o próximo nível
   * Retorna quanto XP falta para subir de nível
   */
  private calculateXpToNextLevel(level: number, totalXp: number): number {
    const xpForCurrentLevel = this.calculateXpForLevel(level);
    const xpForNextLevel = this.calculateXpForLevel(level + 1);
    const xpNeeded = xpForNextLevel - totalXp;
    return Math.max(0, xpNeeded);
  }

  private async getAllLessonsInOrder(courseId: string) {
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

    const allLessons: Array<{ id: number; order: number }> = [];
    for (const module of modules) {
      for (const group of module.groups) {
        for (const lesson of group.lessons) {
          allLessons.push({
            id: lesson.id,
            order: lesson.order,
          });
        }
      }
    }

    return allLessons;
  }

  private async isLessonUnlocked(
    userId: string,
    lessonId: number,
    allLessons: Array<{ id: number }>
  ): Promise<boolean> {
    const lessonIndex = allLessons.findIndex((l) => l.id === lessonId);

    // Primeira aula sempre está desbloqueada
    if (lessonIndex === 0) {
      return true;
    }

    // Verificar se a aula anterior foi concluída
    const previousLesson = allLessons[lessonIndex - 1];
    const previousProgress =
      await this.userProgressRepository.findByUserAndTask(
        userId,
        previousLesson.id
      );

    return previousProgress?.isCompleted ?? false;
  }
}
