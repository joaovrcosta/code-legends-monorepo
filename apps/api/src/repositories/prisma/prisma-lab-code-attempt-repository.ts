import { LabCodeAttempt, Prisma } from '@prisma/client'
import { prisma } from '../../lib/prisma'
import {
  ILabCodeAttemptRepository,
  LabAttemptResult,
} from '../lab-code-attempt-repository'

export class PrismaLabCodeAttemptRepository
  implements ILabCodeAttemptRepository
{
  async create(data: {
    userId: string
    lessonId: number
    stepId: string
    files: Record<string, string>
    result: LabAttemptResult
  }): Promise<LabCodeAttempt> {
    return prisma.labCodeAttempt.create({
      data: {
        userId: data.userId,
        lessonId: data.lessonId,
        stepId: data.stepId,
        files: data.files as Prisma.InputJsonValue,
        result: data.result,
      },
    })
  }

  async listByUserLesson(input: {
    userId: string
    lessonId: number
    stepId?: string
    take: number
    cursor?: string
  }): Promise<LabCodeAttempt[]> {
    return prisma.labCodeAttempt.findMany({
      where: {
        userId: input.userId,
        lessonId: input.lessonId,
        ...(input.stepId ? { stepId: input.stepId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: input.take,
      ...(input.cursor
        ? { skip: 1, cursor: { id: input.cursor } }
        : {}),
    })
  }

  async pruneRetention(input: {
    maxPerLesson: number
    maxPerStep: number
    batchUsers?: number
  }): Promise<{ deletedCount: number }> {
    const limit = input.batchUsers ?? 200
    let deletedCount = 0

    const dense = await prisma.$queryRaw<
      Array<{ userId: string; lessonId: number; cnt: bigint }>
    >`
      SELECT "userId", "lessonId", COUNT(*)::bigint AS cnt
      FROM "LabCodeAttempt"
      GROUP BY "userId", "lessonId"
      HAVING COUNT(*) > ${input.maxPerLesson}
      LIMIT ${limit}
    `

    for (const row of dense) {
      const keep = await prisma.labCodeAttempt.findMany({
        where: { userId: row.userId, lessonId: row.lessonId },
        orderBy: { createdAt: 'desc' },
        take: input.maxPerLesson,
        select: { id: true },
      })
      const keepIds = keep.map((k: { id: string }) => k.id)
      if (keepIds.length === 0) continue
      const result = await prisma.labCodeAttempt.deleteMany({
        where: {
          userId: row.userId,
          lessonId: row.lessonId,
          id: { notIn: keepIds },
        },
      })
      deletedCount += result.count
    }

    const stepDense = await prisma.$queryRaw<
      Array<{ userId: string; lessonId: number; stepId: string; cnt: bigint }>
    >`
      SELECT "userId", "lessonId", "stepId", COUNT(*)::bigint AS cnt
      FROM "LabCodeAttempt"
      GROUP BY "userId", "lessonId", "stepId"
      HAVING COUNT(*) > ${input.maxPerStep}
      LIMIT ${limit}
    `

    for (const row of stepDense) {
      const keep = await prisma.labCodeAttempt.findMany({
        where: {
          userId: row.userId,
          lessonId: row.lessonId,
          stepId: row.stepId,
        },
        orderBy: { createdAt: 'desc' },
        take: input.maxPerStep,
        select: { id: true },
      })
      const keepIds = keep.map((k: { id: string }) => k.id)
      if (keepIds.length === 0) continue
      const result = await prisma.labCodeAttempt.deleteMany({
        where: {
          userId: row.userId,
          lessonId: row.lessonId,
          stepId: row.stepId,
          id: { notIn: keepIds },
        },
      })
      deletedCount += result.count
    }

    return { deletedCount }
  }
}
