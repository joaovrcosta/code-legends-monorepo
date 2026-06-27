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
import { AwardXpUseCase } from '../Account/award-xp'
import {
  calculateLevel,
  calculateXpRemainingToNextLevel,
} from '../../../utils/xp-progression'
import { getGamificationSettingsCached } from '../../../utils/gamification-settings-cache'
import {
  lessonCompletedXpReasonId,
  shouldGrantLessonCompletionXp,
} from './lesson-complete-xp-gate'
import { resolveUserStreakForApi } from '../../../lib/user-streak-resolve'
import {
  addDaysToISODateKeySP,
  formatYYYYMMDDInTZSP,
} from '../../../utils/streak-calendar'
import { aggregateModuleXpBySkill } from '../../../utils/module-xp-aggregation'

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
  streak?: {
    current: number
    best: number
    totalActiveDays: number
    increasedToday: boolean
  }
}

export class CompleteLessonUseCase {
  private readonly awardXpUseCase = new AwardXpUseCase()

  constructor(
    private userProgressRepository: IUserProgressRepository,
    private userModuleProgressRepository: IUserModuleProgressRepository,
    private userCourseRepository: IUserCourseRepository,
    private lessonRepository: ILessonRepository,
    private moduleRepository: IModuleRepository,
    private courseRepository: ICourseRepository,
    private usersRepository: IUsersRepository,
  ) { }

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

    const lessonSkills = await prisma.lessonSkill.findMany({
      where: { lessonId },
    })

    const course = await this.courseRepository.findById(courseId)
    if (!course) {
      throw new CourseNotFoundError()
    }

    if (course.status !== 'PUBLISHED') {
      throw new CourseNotFoundError()
    }

    // Regra nova: não dependemos mais de inscrição explícita.
    // Se o usuário ainda não tem UserCourse, criamos automaticamente ao concluir a primeira lição.
    const userCourse =
      (await this.userCourseRepository.findByUserAndCourse(userId, courseId)) ??
      (await this.userCourseRepository.enroll(userId, courseId))

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

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/61681d87-9b85-44a2-a3f8-024fd9404ca8', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'd6a1ea' }, body: JSON.stringify({ sessionId: 'd6a1ea', runId: 'pre-fix', hypothesisId: 'H2', location: 'complete.ts:after_progress_upsert', message: 'User progress upserted', data: { lessonId, isCompleted, wasAlreadyCompleted }, timestamp: Date.now() }) }).catch(() => { });
    // #endregion

    let xpGained = 0
    let totalXp = 0
    let level = 1
    let xpToNextLevel = 100
    let streak:
      | { current: number; best: number; totalActiveDays: number; increasedToday: boolean }
      | undefined

    const user = await this.usersRepository.findById(userId)
    if (!user) {
      throw new Error('User not found')
    }

    const gamification = await getGamificationSettingsCached()

    const xpAmount =
      isMultiQuiz && score != null && score >= 70
        ? Math.round(gamification.xpPerLesson * gamification.xpQuizMultiplier)
        : gamification.xpPerLesson

    const lessonXpReasonId = lessonCompletedXpReasonId(lessonId)
    let lessonXpEventExists = false
    if (!wasAlreadyCompleted && isCompleted) {
      const existingLessonXpEvent = await prisma.userXpEvent.findUnique({
        where: {
          userId_reasonId: {
            userId,
            reasonId: lessonXpReasonId,
          },
        },
      })
      lessonXpEventExists = existingLessonXpEvent != null
    }

    const shouldGrantLessonXp = shouldGrantLessonCompletionXp({
      wasAlreadyCompleted,
      isCompleted,
      lessonXpEventExists,
    })

    if (isCompleted) {
      const todayKey = formatYYYYMMDDInTZSP(new Date())
      if (todayKey) {
        await resolveUserStreakForApi(userId)
        const yesterdayKey = addDaysToISODateKeySP(todayKey, -1)

        const row = await prisma.$transaction(async (tx) => {
          const existing = await tx.userStreak.findUnique({
            where: { userId },
            select: {
              currentStreak: true,
              bestStreak: true,
              totalActiveDays: true,
              lastActiveDate: true,
            },
          })

          const wasReset =
            existing != null &&
            existing.currentStreak === 0 &&
            existing.totalActiveDays === 0 &&
            existing.lastActiveDate == null

          if (wasAlreadyCompleted && !wasReset) {
            return existing ? { ...existing, increasedToday: false } : null
          }

          if (!existing) {
            const created = await tx.userStreak.create({
              data: {
                userId,
                currentStreak: 1,
                bestStreak: 1,
                totalActiveDays: 1,
                lastActiveDate: todayKey,
              },
              select: {
                currentStreak: true,
                bestStreak: true,
                totalActiveDays: true,
                lastActiveDate: true,
              },
            })
            return { ...created, increasedToday: true }
          }

          if (existing.lastActiveDate === todayKey) {
            return { ...existing, increasedToday: false }
          }

          const isConsecutive = yesterdayKey != null && existing.lastActiveDate === yesterdayKey
          const nextCurrent = isConsecutive ? existing.currentStreak + 1 : 1
          const nextBest = Math.max(existing.bestStreak, nextCurrent)
          const updated = await tx.userStreak.update({
            where: { userId },
            data: {
              currentStreak: nextCurrent,
              bestStreak: nextBest,
              totalActiveDays: existing.totalActiveDays + 1,
              lastActiveDate: todayKey,
            },
            select: {
              currentStreak: true,
              bestStreak: true,
              totalActiveDays: true,
              lastActiveDate: true,
            },
          })
          return { ...updated, increasedToday: true }
        })

        if (row) {
          streak = {
            current: row.currentStreak,
            best: row.bestStreak,
            totalActiveDays: row.totalActiveDays,
            increasedToday: row.increasedToday,
          }
        }
      }
    }

    if (shouldGrantLessonXp) {
      const applySkillsXp = (
        skillRows: Array<{ skillId: string; weight: number }>,
      ) => {
        if (skillRows.length === 0 || xpAmount <= 0) return []
        return skillRows
          .map((row) => ({
            skillId: row.skillId,
            xpAmount: Math.round(xpAmount * (row.weight / 100)),
          }))
          .filter((e) => e.xpAmount > 0)
      }

      await prisma.$transaction(async (tx) => {
        const entries = [...applySkillsXp(courseSkills), ...applySkillsXp(lessonSkills)]
        const distributedXp = entries.reduce((acc, e) => acc + e.xpAmount, 0)

        if (distributedXp < xpAmount) {
          const generalSkill = await tx.skill.upsert({
            where: { slug: 'general' },
            update: {},
            create: {
              slug: 'general',
              name: 'Geral',
              description: 'XP global/bônus não atribuído a uma skill específica.',
            },
            select: { id: true },
          })

          entries.push({
            skillId: generalSkill.id,
            xpAmount: xpAmount - distributedXp,
          })
        }

        const awardResult = await this.awardXpUseCase.executeInTx(tx, {
          userId,
          reasonId: lessonXpReasonId,
          source: 'lesson_completed',
          sourceId: lessonId,
          description: `Completou lição: ${lesson.title}`,
          entries,
        })

        xpGained = awardResult.xpGained
        totalXp = awardResult.totalXp
        level = awardResult.level
        xpToNextLevel = awardResult.xpToNextLevel

        if (awardResult.levelUp) {
          try {
            const notificationData =
              NotificationBuilder.createLevelUpNotification(userId, {
                level: awardResult.level,
                totalXp: awardResult.totalXp,
                xpToNextLevel: awardResult.xpToNextLevel,
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
    } else {
      const agg = await prisma.userSkillXp.aggregate({
        where: { userId },
        _sum: { xp: true },
      })
      totalXp = agg._sum.xp ?? 0
      level = calculateLevel(totalXp)
      xpToNextLevel = calculateXpRemainingToNextLevel(level, totalXp)

      if (
        totalXp !== user.totalXp ||
        level !== user.level ||
        xpToNextLevel !== user.xpToNextLevel
      ) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            totalXp,
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

    const tasksCompleted =
      await this.userProgressRepository.countCompletedInModule(
        userId,
        group.moduleId,
      )

    const moduleProgress =
      totalTasksInModule > 0 ? tasksCompleted / totalTasksInModule : 0
    const moduleCompleted = tasksCompleted === totalTasksInModule

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
          currentTaskId: effectiveNextTaskId,
          currentModuleId: userCourse.currentModuleId ?? nextModuleId,
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
      await this.userCourseRepository.update(userCourse.id, {
        currentTaskId: null,
        progress: courseProgress,
        isCompleted: courseCompleted,
        completedAt: courseCompleted ? new Date() : null,
      })
    }

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
        console.error('Erro ao criar notificação de curso completado:', error)
      }
    }

    let xpGainedInModule: number | undefined
    let xpGainedInModuleBySkill: { skillId: string; xp: number }[] | undefined

    if (moduleCompleted) {
      const moduleLessonIds = moduleWithLessons.submodules.flatMap((s) =>
        s.lessons.map((l) => l.id),
      )

      const historyRows = await prisma.userSkillXpHistory.findMany({
        where: {
          userId,
          source: { in: ['lesson_completed', 'challenge_first_correct'] },
          sourceId: { in: moduleLessonIds },
        },
        select: { skillId: true, xpAmount: true, source: true, sourceId: true },
      })

      const aggregated = aggregateModuleXpBySkill(historyRows, moduleLessonIds)
      xpGainedInModule = aggregated.xpGainedInModule
      xpGainedInModuleBySkill = aggregated.xpGainedInModuleBySkill
    }

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/61681d87-9b85-44a2-a3f8-024fd9404ca8', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'd6a1ea' }, body: JSON.stringify({ sessionId: 'd6a1ea', runId: 'pre-fix', hypothesisId: 'H3', location: 'complete.ts:before_return', message: 'Complete lesson success path', data: { lessonId, moduleCompleted, courseCompleted, xpGained }, timestamp: Date.now() }) }).catch(() => { });
    // #endregion

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
      progress: Math.round(moduleProgress * 100),
      streak,
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
