import { IUserProgressRepository } from '../../../repositories/user-progress-repository'
import { IUserModuleProgressRepository } from '../../../repositories/user-module-progress-repository'
import { IUserCourseRepository } from '../../../repositories/user-course-repository'
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
import {
  addDaysToISODateKeySP,
  effectiveCurrentStreak,
  formatYYYYMMDDInTZSP,
} from '../../../utils/streak-calendar'
import { aggregateModuleXpBySkill } from '../../../utils/module-xp-aggregation'

const COMPLETE_LESSON_TX = {
  maxWait: 10_000,
  timeout: 15_000,
} as const

interface CompleteLessonRequest {
  userId: string
  lessonId: number
  score?: number
}

interface CompleteLessonResponse {
  success: boolean
  nextLessonId: number | null
  moduleCompleted: boolean
  /** true apenas na transição em que o módulo passa a 100% nesta conclusão */
  moduleNewlyCompleted: boolean
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

type CourseLessonRef = { id: number; order: number; moduleId: string }

function isLessonUnlockedFromMap(
  lessonIndex: number,
  allLessons: CourseLessonRef[],
  completedByTaskId: Map<number, boolean>,
): boolean {
  if (lessonIndex <= 0) return true
  const previous = allLessons[lessonIndex - 1]
  return completedByTaskId.get(previous.id) === true
}

export function findNextUnlockedLessonId(
  allLessons: CourseLessonRef[],
  currentLessonId: number,
  completedByTaskId: Map<number, boolean>,
): number | null {
  const currentIndex = allLessons.findIndex((l) => l.id === currentLessonId)
  if (currentIndex === -1) return null

  for (let i = currentIndex + 1; i < allLessons.length; i++) {
    if (isLessonUnlockedFromMap(i, allLessons, completedByTaskId)) {
      return allLessons[i].id
    }
  }
  return null
}

export class CompleteLessonUseCase {
  private readonly awardXpUseCase = new AwardXpUseCase()

  constructor(
    private userProgressRepository: IUserProgressRepository,
    private userModuleProgressRepository: IUserModuleProgressRepository,
    private userCourseRepository: IUserCourseRepository,
    private usersRepository: IUsersRepository,
  ) {}

  async execute({
    userId,
    lessonId,
    score,
  }: CompleteLessonRequest): Promise<CompleteLessonResponse> {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: {
        id: true,
        title: true,
        type: true,
        submoduleId: true,
        submodule: {
          select: {
            id: true,
            moduleId: true,
            module: {
              select: {
                id: true,
                title: true,
                courseId: true,
                course: {
                  select: {
                    id: true,
                    title: true,
                    slug: true,
                    status: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!lesson?.submodule?.module?.course) {
      throw new LessonNotFoundError()
    }

    const moduleId = lesson.submodule.moduleId
    const moduleTitle = lesson.submodule.module.title
    const course = lesson.submodule.module.course
    const courseId = course.id

    if (course.status !== 'PUBLISHED') {
      throw new CourseNotFoundError()
    }

    const [courseSkills, lessonSkills, existingUserCourse] = await Promise.all([
      prisma.courseSkill.findMany({ where: { courseId } }),
      prisma.lessonSkill.findMany({ where: { lessonId } }),
      this.userCourseRepository.findByUserAndCourse(userId, courseId),
    ])

    const userCourse =
      existingUserCourse ??
      (await this.userCourseRepository.enroll(userId, courseId))

    const [modulesTree, progressRows, existingModuleProgress, user, gamification] =
      await Promise.all([
        prisma.module.findMany({
          where: { courseId },
          select: {
            id: true,
            title: true,
            submodules: {
              select: {
                id: true,
                lessons: {
                  select: { id: true, order: true },
                  orderBy: { order: 'asc' },
                },
              },
              orderBy: { id: 'asc' },
            },
          },
          orderBy: { id: 'asc' },
        }),
        this.userProgressRepository.findSlimByUserCourse(userCourse.id),
        this.userModuleProgressRepository.findByUserAndModule(userId, moduleId),
        this.usersRepository.findById(userId),
        getGamificationSettingsCached(),
      ])

    if (!user) {
      throw new Error('User not found')
    }

    const allLessons: CourseLessonRef[] = []
    const moduleLessonIds = new Set<number>()
    for (const mod of modulesTree) {
      for (const submodule of mod.submodules) {
        for (const l of submodule.lessons) {
          allLessons.push({ id: l.id, order: l.order, moduleId: mod.id })
          if (mod.id === moduleId) {
            moduleLessonIds.add(l.id)
          }
        }
      }
    }

    const completedByTaskId = new Map<number, boolean>()
    for (const row of progressRows) {
      completedByTaskId.set(row.taskId, row.isCompleted)
    }

    const wasAlreadyCompleted = completedByTaskId.get(lessonId) === true

    const lessonType = lesson.type as string
    const isMultiQuiz = lessonType === 'MULTI_QUIZ'
    const isCompleted = isMultiQuiz && score != null ? score >= 70 : true

    // Contagens / unlock após aplicar o resultado desta conclusão em memória.
    completedByTaskId.set(lessonId, isCompleted)

    const totalTasksInModule = moduleLessonIds.size
    let tasksCompleted = 0
    for (const id of moduleLessonIds) {
      if (completedByTaskId.get(id) === true) tasksCompleted++
    }

    const moduleProgress =
      totalTasksInModule > 0 ? tasksCompleted / totalTasksInModule : 0
    const moduleCompleted =
      totalTasksInModule > 0 && tasksCompleted === totalTasksInModule
    const wasModuleAlreadyCompleted =
      existingModuleProgress?.isCompleted ?? false
    const moduleNewlyCompleted =
      moduleCompleted && !wasModuleAlreadyCompleted

    const nextLessonId = findNextUnlockedLessonId(
      allLessons,
      lessonId,
      completedByTaskId,
    )

    let completedLessons = 0
    for (const l of allLessons) {
      if (completedByTaskId.get(l.id) === true) completedLessons++
    }

    const courseProgress =
      allLessons.length > 0 ? completedLessons / allLessons.length : 0
    const courseCompleted =
      allLessons.length > 0 && completedLessons === allLessons.length
    const wasCourseCompleted = userCourse.isCompleted
    const isNewlyCompleted = courseCompleted && !wasCourseCompleted

    const effectiveNextTaskId = isCompleted ? nextLessonId : lessonId
    const nextLessonRef = effectiveNextTaskId
      ? allLessons.find((l) => l.id === effectiveNextTaskId)
      : null
    const nextModuleId = nextLessonRef?.moduleId
    const currentModuleIdForPointer = userCourse.currentModuleId ?? moduleId

    let xpGained = 0
    let totalXp = 0
    let level = 1
    let xpToNextLevel = 100
    let streak:
      | {
          current: number
          best: number
          totalActiveDays: number
          increasedToday: boolean
        }
      | undefined
    let levelUpNotification:
      | {
          level: number
          totalXp: number
          xpToNextLevel: number
        }
      | null = null

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
        select: { userId: true },
      })
      lessonXpEventExists = existingLessonXpEvent != null
    }

    const shouldGrantLessonXp = shouldGrantLessonCompletionXp({
      wasAlreadyCompleted,
      isCompleted,
      lessonXpEventExists,
    })

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

    const userCourseUpdateData =
      nextLessonRef && effectiveNextTaskId !== null
      ? {
          currentTaskId: effectiveNextTaskId,
          currentModuleId:
            nextModuleId && nextModuleId !== moduleId
              ? (userCourse.currentModuleId ?? nextModuleId)
              : currentModuleIdForPointer,
          progress: courseProgress,
          isCompleted: courseCompleted,
          completedAt: courseCompleted ? new Date() : null,
          lastAccessedAt: new Date(),
        }
      : {
          currentTaskId: null,
          progress: courseProgress,
          isCompleted: courseCompleted,
          completedAt: courseCompleted ? new Date() : null,
          lastAccessedAt: new Date(),
        }

    await prisma.$transaction(async (tx) => {
      const transitionToCompleted = isCompleted && !wasAlreadyCompleted

      await tx.userProgress.upsert({
        where: {
          userId_taskId: {
            userId,
            taskId: lessonId,
          },
        },
        create: {
          userId,
          taskId: lessonId,
          userCourseId: userCourse.id,
          isCompleted,
          completedAt: isCompleted ? new Date() : null,
          score: score ?? null,
          timeSpent: 0,
          lastPosition: null,
          attempts: 1,
        },
        update: {
          isCompleted,
          ...(isCompleted ? { completedAt: new Date() } : {}),
          ...(score !== undefined ? { score } : {}),
          ...(transitionToCompleted ? { attempts: { increment: 1 } } : {}),
        },
      })

      if (isCompleted) {
        const todayKey = formatYYYYMMDDInTZSP(new Date())
        if (todayKey) {
          const yesterdayKey = addDaysToISODateKeySP(todayKey, -1)
          const existing = await tx.userStreak.findUnique({
            where: { userId },
            select: {
              currentStreak: true,
              bestStreak: true,
              totalActiveDays: true,
              lastActiveDate: true,
            },
          })

          const effective = existing
            ? effectiveCurrentStreak(
                existing.currentStreak,
                existing.lastActiveDate,
              )
            : 0

          if (
            existing &&
            effective === 0 &&
            existing.currentStreak !== 0
          ) {
            await tx.userStreak.update({
              where: { userId },
              data: { currentStreak: 0 },
            })
            existing.currentStreak = 0
          }

          const wasReset =
            existing != null &&
            existing.currentStreak === 0 &&
            existing.totalActiveDays === 0 &&
            existing.lastActiveDate == null

          if (wasAlreadyCompleted && !wasReset) {
            if (existing) {
              streak = {
                current: effectiveCurrentStreak(
                  existing.currentStreak,
                  existing.lastActiveDate,
                ),
                best: existing.bestStreak,
                totalActiveDays: existing.totalActiveDays,
                increasedToday: false,
              }
            }
          } else if (!existing) {
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
              },
            })
            streak = {
              current: created.currentStreak,
              best: created.bestStreak,
              totalActiveDays: created.totalActiveDays,
              increasedToday: true,
            }
          } else if (existing.lastActiveDate === todayKey) {
            streak = {
              current: existing.currentStreak,
              best: existing.bestStreak,
              totalActiveDays: existing.totalActiveDays,
              increasedToday: false,
            }
          } else {
            const isConsecutive =
              yesterdayKey != null && existing.lastActiveDate === yesterdayKey
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
              },
            })
            streak = {
              current: updated.currentStreak,
              best: updated.bestStreak,
              totalActiveDays: updated.totalActiveDays,
              increasedToday: true,
            }
          }
        }
      }

      if (shouldGrantLessonXp) {
        const entries = [
          ...applySkillsXp(courseSkills),
          ...applySkillsXp(lessonSkills),
        ]
        const distributedXp = entries.reduce((acc, e) => acc + e.xpAmount, 0)

        if (distributedXp < xpAmount) {
          const generalSkill = await tx.skill.upsert({
            where: { slug: 'general' },
            update: {},
            create: {
              slug: 'general',
              name: 'Geral',
              description:
                'XP global/bônus não atribuído a uma skill específica.',
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
          levelUpNotification = {
            level: awardResult.level,
            totalXp: awardResult.totalXp,
            xpToNextLevel: awardResult.xpToNextLevel,
          }
        }
      }

      const newlyModuleCompleted =
        moduleCompleted && !wasModuleAlreadyCompleted

      await tx.userModuleProgress.upsert({
        where: {
          userId_moduleId: {
            userId,
            moduleId,
          },
        },
        create: {
          userId,
          moduleId,
          userCourseId: userCourse.id,
          totalTasks: totalTasksInModule,
          tasksCompleted,
          progress: moduleProgress,
          isCompleted: moduleCompleted,
          completedAt: moduleCompleted ? new Date() : null,
        },
        update: {
          totalTasks: totalTasksInModule,
          tasksCompleted,
          progress: moduleProgress,
          isCompleted: moduleCompleted,
          ...(newlyModuleCompleted ? { completedAt: new Date() } : {}),
        },
      })

      await tx.userCourse.update({
        where: { id: userCourse.id },
        data: userCourseUpdateData,
      })
    }, COMPLETE_LESSON_TX)

    if (!shouldGrantLessonXp) {
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

    if (levelUpNotification) {
      try {
        const notificationData = NotificationBuilder.createLevelUpNotification(
          userId,
          levelUpNotification,
        )
        await createNotification(notificationData)
      } catch (error) {
        console.error('Erro ao criar notificação de level up:', error)
      }
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
      const moduleLessonIdList = [...moduleLessonIds]
      const historyRows = await prisma.userSkillXpHistory.findMany({
        where: {
          userId,
          source: { in: ['lesson_completed', 'challenge_first_correct'] },
          sourceId: { in: moduleLessonIdList },
        },
        select: { skillId: true, xpAmount: true, source: true, sourceId: true },
      })

      const aggregated = aggregateModuleXpBySkill(
        historyRows,
        moduleLessonIdList,
      )
      xpGainedInModule = aggregated.xpGainedInModule
      xpGainedInModuleBySkill = aggregated.xpGainedInModuleBySkill
    }

    return {
      success: true,
      nextLessonId,
      moduleCompleted,
      moduleNewlyCompleted,
      moduleId,
      moduleTitle,
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
}
