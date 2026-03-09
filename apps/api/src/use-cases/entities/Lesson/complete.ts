import { IUserProgressRepository } from '../../../repositories/user-progress-repository'
import { IUserModuleProgressRepository } from '../../../repositories/user-module-progress-repository'
import { IUserCourseRepository } from '../../../repositories/user-course-repository'
import { ILessonRepository } from '../../../repositories/lesson-repository'
import { IModuleRepository } from '../../../repositories/module-repository'
import { ICourseRepository } from '../../../repositories/course-repository'
import { IUsersRepository } from '../../../repositories/users-repository'
import { LessonNotFoundError } from '../../errors/lesson-not-found'
import { CourseNotFoundError } from '../../errors/course-not-found'
import { prisma } from '../../../lib/prisma'
import { NotificationBuilder } from '../../../utils/notification-builder'
import { createNotification } from '../../../utils/create-notification'

interface CompleteLessonRequest {
  userId: string
  lessonId: number
  score?: number
}

interface CompleteLessonResponse {
  success: boolean
  nextLessonId: number | null
  moduleCompleted: boolean
  moduleId?: string
  moduleTitle?: string
  courseCompleted: boolean
  courseProgress: number
  xpGained?: number
  totalXp?: number
  level?: number
  xpToNextLevel?: number
  progress?: number
  xpGainedInModule?: number
  xpGainedInModuleBySkill?: { skillId: string; xp: number }[]
}

export class CompleteLessonUseCase {
  private readonly XP_PER_LESSON = 15 // XP fixo por lição completada

  constructor(
    private userProgressRepository: IUserProgressRepository,
    private userModuleProgressRepository: IUserModuleProgressRepository,
    private userCourseRepository: IUserCourseRepository,
    private lessonRepository: ILessonRepository,
    private moduleRepository: IModuleRepository,
    private courseRepository: ICourseRepository,
    private usersRepository: IUsersRepository,
  ) {}

  async execute({
    userId,
    lessonId,
    score,
  }: CompleteLessonRequest): Promise<CompleteLessonResponse> {
    const lesson = await this.lessonRepository.findById(lessonId)
    if (!lesson) {
      throw new LessonNotFoundError()
    }

    const group = await prisma.submodule.findUnique({
      where: { id: lesson.submoduleId },
      include: {
        module: true,
      },
    })

    if (!group) {
      throw new Error('Group not found')
    }

    const courseId = group.module.courseId

    const courseSkills = await prisma.courseSkill.findMany({
      where: { courseId },
    })

    const course = await this.courseRepository.findById(courseId)
    if (!course) {
      throw new CourseNotFoundError()
    }

    const userCourse = await this.userCourseRepository.findByUserAndCourse(
      userId,
      courseId,
    )
    if (!userCourse) {
      throw new Error('User is not enrolled in this course')
    }

    // Verificar se a lição já foi completada (para evitar duplicação de XP)
    const existingProgress =
      await this.userProgressRepository.findByUserAndTask(userId, lessonId)
    const wasAlreadyCompleted = existingProgress?.isCompleted ?? false

    const lessonType = lesson.type as string
    const isMultiQuiz = lessonType === 'MULTI_QUIZ'
    const isCompleted = isMultiQuiz && score != null ? score >= 70 : true

    await this.userProgressRepository.upsert({
      userId,
      taskId: lessonId,
      userCourseId: userCourse.id,
      isCompleted,
      score,
    })

    let xpGained = 0
    let totalXp = 0
    let level = 1
    let xpToNextLevel = 100

    const user = await this.usersRepository.findById(userId)
    if (!user) {
      throw new Error('User not found')
    }

    xpToNextLevel = this.calculateXpToNextLevel(user.level, user.totalXp)

    const xpAmount =
      isMultiQuiz && score != null && score >= 70
        ? Math.round(this.XP_PER_LESSON * 1.4)
        : this.XP_PER_LESSON

    if (!wasAlreadyCompleted && isCompleted && lessonType !== 'QUIZ') {
      const newTotalXp = user.totalXp + xpAmount
      const newLevel = this.calculateLevel(newTotalXp)
      const newXpToNextLevel = this.calculateXpToNextLevel(newLevel, newTotalXp)

      const levelUp = newLevel > user.level

      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: userId },
          data: {
            totalXp: newTotalXp,
            level: newLevel,
            xpToNextLevel: newXpToNextLevel,
          },
        })

        // Registrar no histórico de XP
        await tx.userXpHistory.create({
          data: {
            userId,
            xpAmount,
            source: 'lesson_completed',
            sourceId: lessonId,
            description: `Completou lição: ${lesson.title}`,
          },
        })

        if (courseSkills.length > 0 && xpAmount > 0) {
          for (const courseSkill of courseSkills) {
            const skillXp = Math.round(xpAmount * (courseSkill.weight / 100))

            if (skillXp <= 0) continue

            await tx.userSkillXp.upsert({
              where: {
                userId_skillId: {
                  userId,
                  skillId: courseSkill.skillId,
                },
              },
              update: {
                xp: {
                  increment: skillXp,
                },
              },
              create: {
                userId,
                skillId: courseSkill.skillId,
                xp: skillXp,
              },
            })

            await tx.userSkillXpHistory.create({
              data: {
                userId,
                skillId: courseSkill.skillId,
                xpAmount: skillXp,
                source: 'lesson_completed',
                sourceId: lessonId,
                description: `XP de skill ao completar lição: ${lesson.title}`,
              },
            })
          }
        }

        if (levelUp) {
          try {
            const notificationData =
              NotificationBuilder.createLevelUpNotification(userId, {
                level: newLevel,
                totalXp: newTotalXp,
                xpToNextLevel: newXpToNextLevel,
              })

            await createNotification({
              ...notificationData,
              tx,
            })
          } catch (error) {
            console.error('Erro ao criar notificação de level up:', error)
          }
        }
      })

      xpGained = xpAmount
      totalXp = newTotalXp
      level = newLevel
      xpToNextLevel = newXpToNextLevel
    } else {
      // Se já estava completa, recalcular nível e xpToNextLevel baseado no XP atual
      // Isso garante que se a fórmula mudou, os valores sejam atualizados
      totalXp = user.totalXp
      level = this.calculateLevel(user.totalXp)
      xpToNextLevel = this.calculateXpToNextLevel(level, user.totalXp)

      // Se o nível calculado for diferente do armazenado, atualizar no banco
      if (level !== user.level || xpToNextLevel !== user.xpToNextLevel) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            level,
            xpToNextLevel,
          },
        })
      }
    }

    const moduleWithLessons = await prisma.module.findUnique({
      where: { id: group.moduleId },
      include: {
        submodules: {
          include: {
            lessons: {
              orderBy: {
                order: 'asc',
              },
            },
          },
          orderBy: {
            id: 'asc',
          },
        },
      },
    })

    if (!moduleWithLessons) {
      throw new Error('Module not found')
    }

    const totalTasksInModule = moduleWithLessons.submodules.reduce(
      (acc, group) => acc + group.lessons.length,
      0,
    )

    // Contar aulas concluídas no módulo
    const tasksCompleted =
      await this.userProgressRepository.countCompletedInModule(
        userId,
        group.moduleId,
      )

    // Calcular progresso do módulo
    const moduleProgress =
      totalTasksInModule > 0 ? tasksCompleted / totalTasksInModule : 0
    const moduleCompleted = tasksCompleted === totalTasksInModule

    // Atualizar progresso do módulo
    await this.userModuleProgressRepository.upsert({
      userId,
      moduleId: group.moduleId,
      userCourseId: userCourse.id,
      totalTasks: totalTasksInModule,
      tasksCompleted,
      progress: moduleProgress,
      isCompleted: moduleCompleted,
    })

    const allLessons = await this.getAllLessonsInOrder(courseId)

    let nextLessonId: number | null = null
    const currentLessonIndex = allLessons.findIndex((l) => l.id === lessonId)

    if (currentLessonIndex !== -1) {
      for (let i = currentLessonIndex + 1; i < allLessons.length; i++) {
        const nextLesson = allLessons[i]
        const isUnlocked = await this.isLessonUnlocked(
          userId,
          nextLesson.id,
          allLessons,
        )

        if (isUnlocked) {
          nextLessonId = nextLesson.id
          break
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
    })

    const courseProgress =
      allLessons.length > 0 ? completedLessons / allLessons.length : 0
    const courseCompleted = completedLessons === allLessons.length
    const wasCourseCompleted = userCourse.isCompleted
    const isNewlyCompleted = courseCompleted && !wasCourseCompleted

    // [COURSE_COMPLETION_DEBUG] Só loga quando há inconsistência (getAllLessons != count no DB)
    const totalLessonsInDb = await prisma.lesson.count({
      where: {
        submodule: { module: { courseId } },
      },
    })
    if (allLessons.length !== totalLessonsInDb) {
      const lessonsWithTypes = await prisma.lesson.findMany({
        where: { submodule: { module: { courseId } } },
        select: { id: true, type: true, title: true },
        orderBy: [{ submoduleId: 'asc' }, { order: 'asc' }],
      })
      console.warn('[COURSE_COMPLETION_DEBUG] Inconsistência na contagem de lições', {
        courseId,
        courseTitle: course.title,
        allLessonsFromGetAll: allLessons.length,
        totalLessonsInDb,
        completedLessons,
        courseProgress: Math.round(courseProgress * 100),
        courseCompleted,
        lessonIdsFromGetAll: allLessons.map((l) => l.id),
        lessonsInDb: lessonsWithTypes.map((l) => ({ id: l.id, type: l.type, title: l.title })),
      })
    }

    // Atualizar UserCourse (quiz reprovado: não avança, usuário permanece na mesma lição para tentar de novo)
    const effectiveNextTaskId = isCompleted ? nextLessonId : lessonId
    const nextLesson = effectiveNextTaskId
      ? allLessons.find((l) => l.id === effectiveNextTaskId)
      : null

    if (nextLesson && effectiveNextTaskId !== null) {
      const nextLessonGroup = await prisma.submodule.findFirst({
        where: {
          lessons: {
            some: {
              id: effectiveNextTaskId,
            },
          },
        },
        include: {
          module: true,
        },
      })

      const nextModuleId = nextLessonGroup?.moduleId
      const currentModuleId = group.moduleId

      if (nextModuleId && nextModuleId !== currentModuleId) {
        await this.userCourseRepository.update(userCourse.id, {
          currentTaskId: lessonId,
          currentModuleId: userCourse.currentModuleId ?? currentModuleId,
          progress: courseProgress,
          isCompleted: courseCompleted,
          completedAt: courseCompleted ? new Date() : null,
        })
      } else {
        await this.userCourseRepository.update(userCourse.id, {
          currentTaskId: effectiveNextTaskId,
          currentModuleId: userCourse.currentModuleId ?? currentModuleId,
          progress: courseProgress,
          isCompleted: courseCompleted,
          completedAt: courseCompleted ? new Date() : null,
        })
      }
    } else {
      // Sem próxima lição (ex.: última da lista). Só marcar curso completo se todas foram concluídas.
      await this.userCourseRepository.update(userCourse.id, {
        currentTaskId: null,
        progress: courseProgress,
        isCompleted: courseCompleted,
        completedAt: courseCompleted ? new Date() : null,
      })
    }

    // Criar notificação de curso completado
    if (isNewlyCompleted) {
      try {
        const notificationData =
          NotificationBuilder.createCourseCompletedNotification(userId, {
            courseId: course.id,
            courseTitle: course.title,
            courseSlug: course.slug,
          })

        await createNotification(notificationData)
      } catch (error) {
        // Não quebra o fluxo se a notificação falhar
        console.error('Erro ao criar notificação de curso completado:', error)
      }
    }

    // XP total do módulo (soma de todas as lições): só quando o módulo acabou de ser completado
    let xpGainedInModule: number | undefined
    let xpGainedInModuleBySkill: { skillId: string; xp: number }[] | undefined

    if (moduleCompleted) {
      const moduleLessonIds = moduleWithLessons.submodules.flatMap((s) =>
        s.lessons.map((l) => l.id),
      )

      const historyRows = await prisma.userSkillXpHistory.findMany({
        where: {
          userId,
          source: 'lesson_completed',
          sourceId: { in: moduleLessonIds },
        },
        select: { skillId: true, xpAmount: true },
      })

      const bySkill = new Map<string, number>()
      for (const row of historyRows) {
        bySkill.set(row.skillId, (bySkill.get(row.skillId) ?? 0) + row.xpAmount)
      }

      xpGainedInModule = [...bySkill.values()].reduce((a, b) => a + b, 0)
      xpGainedInModuleBySkill = [...bySkill.entries()]
        .filter(([, xp]) => xp > 0)
        .map(([skillId, xp]) => ({ skillId, xp }))
    }

    return {
      success: true,
      nextLessonId,
      moduleCompleted,
      moduleId: group.moduleId,
      moduleTitle: group.module.title,
      courseCompleted,
      courseProgress,
      xpGained,
      totalXp,
      level,
      xpToNextLevel,
      progress: Math.round(moduleProgress * 100), // Progresso do módulo em porcentagem (0-100)
      ...(moduleCompleted && {
        xpGainedInModule,
        xpGainedInModuleBySkill,
      }),
    }
  }

  private calculateXpForLevel(level: number): number {
    if (level <= 1) return 100
    return 100 * level + 25 * (level - 1) * level
  }

  private calculateXpRequiredForNextLevel(level: number): number {
    return 100 + (level - 1) * 50
  }

  private calculateLevel(totalXp: number): number {
    if (totalXp < 100) return 1

    let level = 1
    while (this.calculateXpForLevel(level + 1) <= totalXp) {
      level++
    }
    return level
  }

  private calculateXpToNextLevel(level: number, totalXp: number): number {
    const xpForCurrentLevel = this.calculateXpForLevel(level)
    const xpForNextLevel = this.calculateXpForLevel(level + 1)
    const xpNeeded = xpForNextLevel - totalXp
    return Math.max(0, xpNeeded)
  }

  private async getAllLessonsInOrder(courseId: string) {
    const modules = await prisma.module.findMany({
      where: { courseId },
      include: {
        submodules: {
          include: {
            lessons: {
              orderBy: {
                order: 'asc',
              },
            },
          },
          orderBy: {
            id: 'asc',
          },
        },
      },
      orderBy: {
        id: 'asc',
      },
    })

    const allLessons: Array<{ id: number; order: number }> = []
    for (const module of modules) {
      for (const group of module.submodules) {
        for (const lesson of group.lessons) {
          allLessons.push({
            id: lesson.id,
            order: lesson.order,
          })
        }
      }
    }

    return allLessons
  }

  private async isLessonUnlocked(
    userId: string,
    lessonId: number,
    allLessons: Array<{ id: number }>,
  ): Promise<boolean> {
    const lessonIndex = allLessons.findIndex((l) => l.id === lessonId)

    if (lessonIndex === 0) {
      return true
    }

    const previousLesson = allLessons[lessonIndex - 1]
    const previousProgress =
      await this.userProgressRepository.findByUserAndTask(
        userId,
        previousLesson.id,
      )

    return previousProgress?.isCompleted ?? false
  }
}
