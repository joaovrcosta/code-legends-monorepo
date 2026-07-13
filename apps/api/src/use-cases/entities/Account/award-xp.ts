import { prisma } from '../../../lib/prisma'
import {
  calculateLevel,
  calculateXpRemainingToNextLevel,
} from '../../../utils/xp-progression'
import { Prisma } from '@prisma/client'

export type AwardXpEntry = {
  skillId: string
  xpAmount: number
}

interface AwardXpRequest {
  userId: string
  /**
   * Identificador idempotente. Ex.: `lesson_completed:123`.
   * Se o mesmo reasonId for reaplicado, a operação não duplica XP.
   */
  reasonId: string
  source: string
  sourceId?: number
  description?: string
  entries: AwardXpEntry[]
}

interface AwardXpResponse {
  applied: boolean
  xpGained: number
  totalXp: number
  level: number
  xpToNextLevel: number
  levelUp: boolean
}

export class AwardXpUseCase {
  private async executeWithTx(
    tx: Prisma.TransactionClient,
    {
      userId,
      reasonId,
      source,
      sourceId,
      description,
      entries,
    }: AwardXpRequest,
  ): Promise<AwardXpResponse> {
    const normalizedEntries = entries
      .map((e) => ({ ...e, xpAmount: Math.trunc(e.xpAmount) }))
      .filter((e) => e.skillId && e.xpAmount > 0)

    const xpGained = normalizedEntries.reduce((acc, e) => acc + e.xpAmount, 0)

    if (xpGained <= 0) {
      const user = await tx.user.findUniqueOrThrow({
        where: { id: userId },
        select: { totalXp: true, level: true, xpToNextLevel: true },
      })
      return {
        applied: false,
        xpGained: 0,
        totalXp: user.totalXp,
        level: user.level,
        xpToNextLevel: user.xpToNextLevel,
        levelUp: false,
      }
    }

    const before = await tx.user.findUniqueOrThrow({
      where: { id: userId },
      select: { level: true },
    })

    // Idempotência: se já aplicou esse reasonId, não reaplica.
    try {
      await tx.userXpEvent.create({
        data: {
          userId,
          reasonId,
          source,
          sourceId: sourceId ?? null,
        },
      })
    } catch (err: unknown) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        const user = await tx.user.findUniqueOrThrow({
          where: { id: userId },
          select: { totalXp: true, level: true, xpToNextLevel: true },
        })
        return {
          applied: false,
          xpGained: 0,
          totalXp: user.totalXp,
          level: user.level,
          xpToNextLevel: user.xpToNextLevel,
          levelUp: false,
        }
      }
      throw err
    }

    await Promise.all(
      normalizedEntries.map((entry) =>
        tx.userSkillXp.upsert({
          where: {
            userId_skillId: {
              userId,
              skillId: entry.skillId,
            },
          },
          update: {
            xp: { increment: entry.xpAmount },
          },
          create: {
            userId,
            skillId: entry.skillId,
            xp: entry.xpAmount,
          },
        }),
      ),
    )

    await tx.userSkillXpHistory.createMany({
      data: normalizedEntries.map((entry) => ({
        userId,
        skillId: entry.skillId,
        xpAmount: entry.xpAmount,
        source,
        sourceId: sourceId ?? null,
        description,
      })),
    })

    // Mantém o histórico global (útil para timeline), mas o total/cache vem da soma das skills.
    await tx.userXpHistory.create({
      data: {
        userId,
        xpAmount: xpGained,
        source,
        sourceId: sourceId ?? null,
        description,
      },
    })

    const agg = await tx.userSkillXp.aggregate({
      where: { userId },
      _sum: { xp: true },
    })
    const totalXp = agg._sum.xp ?? 0
    const level = calculateLevel(totalXp)
    const xpToNextLevel = calculateXpRemainingToNextLevel(level, totalXp)

    await tx.user.update({
      where: { id: userId },
      data: {
        totalXp,
        level,
        xpToNextLevel,
      },
    })

    return {
      applied: true,
      xpGained,
      totalXp,
      level,
      xpToNextLevel,
      levelUp: level > before.level,
    }
  }

  async execute({
    userId,
    reasonId,
    source,
    sourceId,
    description,
    entries,
  }: AwardXpRequest): Promise<AwardXpResponse> {
    return await prisma.$transaction(async (tx) => {
      return await this.executeWithTx(tx, {
        userId,
        reasonId,
        source,
        sourceId,
        description,
        entries,
      })
    })
  }

  /**
   * Permite compor dentro de uma transação externa (ex.: CompleteLesson).
   */
  async executeInTx(
    tx: Prisma.TransactionClient,
    request: AwardXpRequest,
  ): Promise<AwardXpResponse> {
    return await this.executeWithTx(tx, request)
  }
}

