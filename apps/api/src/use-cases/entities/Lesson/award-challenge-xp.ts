import { prisma } from '../../../lib/prisma'
import { AwardXpUseCase } from '../Account/award-xp'
import {
  calculateLevel,
  calculateXpRemainingToNextLevel,
} from '../../../utils/xp-progression'
import { getGamificationSettingsCached } from '../../../utils/gamification-settings-cache'
import { LessonNotFoundError } from '../../errors/lesson-not-found'
import { CourseNotFoundError } from '../../errors/course-not-found'
import {
  challengeFirstCorrectReasonId,
  countChallengeSlots,
} from './challenge-first-correct-xp'
import { NotificationBuilder } from '../../../utils/notification-builder'
import { createNotification } from '../../../utils/create-notification'

export interface AwardChallengeXpRequest {
  userId: string
  lessonId: number
  challengeIndex: number
}

export interface AwardChallengeXpResponse {
  applied: boolean
  xpGained: number
  totalXp: number
  level: number
  xpToNextLevel: number
  levelUp: boolean
}

function maxChallengesForLesson(
  typeRaw: unknown,
  quizContent: unknown,
  articleBody: string | null | undefined,
): number {
  return countChallengeSlots(typeRaw, quizContent, articleBody)
}

export class AwardChallengeXpUseCase {
  private readonly awardXpUseCase = new AwardXpUseCase()

  async execute({
    userId,
    lessonId,
    challengeIndex,
  }: AwardChallengeXpRequest): Promise<AwardChallengeXpResponse> {
    if (!Number.isFinite(challengeIndex) || challengeIndex < 0) {
      throw new Error('INVALID_CHALLENGE_INDEX')
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        submodule: {
          include: {
            module: {
              include: { course: true },
            },
          },
        },
        quiz: true,
        article: true,
      },
    })

    if (!lesson) {
      throw new LessonNotFoundError()
    }

    const course = lesson.submodule.module.course
    if (course.status !== 'PUBLISHED') {
      throw new CourseNotFoundError()
    }

    const maxSlots = maxChallengesForLesson(
      lesson.type,
      lesson.quiz?.content,
      lesson.article?.body,
    )

    if (maxSlots <= 0 || challengeIndex >= maxSlots) {
      throw new Error('INVALID_CHALLENGE_INDEX')
    }

    const courseId = course.id
    const courseSkills = await prisma.courseSkill.findMany({
      where: { courseId },
    })
    const lessonSkills = await prisma.lessonSkill.findMany({
      where: { lessonId },
    })

    const gamification = await getGamificationSettingsCached()
    const xpAmount = Math.max(
      1,
      Math.min(80, Math.round(gamification.xpPerLesson / 5)),
    )

    const reasonId = challengeFirstCorrectReasonId(lessonId, challengeIndex)

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

    return await prisma.$transaction(async (tx) => {
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
        reasonId,
        source: 'challenge_first_correct',
        sourceId: lessonId,
        description: `Acertou desafio na lição: ${lesson.title}`,
        entries,
      })

      if (awardResult.levelUp) {
        try {
          const notificationData =
            NotificationBuilder.createLevelUpNotification(userId, {
              level: awardResult.level,
              totalXp: awardResult.totalXp,
              xpToNextLevel: awardResult.xpToNextLevel,
            })
          await createNotification({ ...notificationData, tx })
        } catch (error) {
          console.error('Erro ao criar notificação de level up (desafio):', error)
        }
      }

      return {
        applied: awardResult.applied,
        xpGained: awardResult.xpGained,
        totalXp: awardResult.totalXp,
        level: awardResult.level,
        xpToNextLevel: awardResult.xpToNextLevel,
        levelUp: awardResult.levelUp,
      }
    })
  }
}
