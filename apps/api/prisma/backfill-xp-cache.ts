import { PrismaClient } from '@prisma/client'
import {
  calculateLevel,
  calculateXpRemainingToNextLevel,
} from '../src/utils/xp-progression'

const prisma = new PrismaClient()

async function main() {
  const batchSize = 500
  let cursor: string | undefined
  let processed = 0

  for (;;) {
    const users = await prisma.user.findMany({
      take: batchSize,
      ...(cursor
        ? {
            skip: 1,
            cursor: { id: cursor },
          }
        : {}),
      select: { id: true, totalXp: true, level: true, xpToNextLevel: true },
      orderBy: { id: 'asc' },
    })

    if (users.length === 0) break

    for (const user of users) {
      const agg = await prisma.userSkillXp.aggregate({
        where: { userId: user.id },
        _sum: { xp: true },
      })
      const totalXp = agg._sum.xp ?? 0
      const level = calculateLevel(totalXp)
      const xpToNextLevel = calculateXpRemainingToNextLevel(level, totalXp)

      if (
        totalXp !== user.totalXp ||
        level !== user.level ||
        xpToNextLevel !== user.xpToNextLevel
      ) {
        await prisma.user.update({
          where: { id: user.id },
          data: { totalXp, level, xpToNextLevel },
        })
      }

      processed++
      cursor = user.id
      if (processed % 200 === 0) {
        // eslint-disable-next-line no-console
        console.log(`✅ Processados: ${processed}`)
      }
    }
  }

  // eslint-disable-next-line no-console
  console.log(`🎉 Backfill concluído. Total processados: ${processed}`)
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error('❌ Erro no backfill:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

