import { prisma } from '../../lib/prisma'
import type {
  IUserXpHistoryRepository,
  UserXpHistoryRow,
} from '../user-xp-history-repository'

export class PrismaUserXpHistoryRepository implements IUserXpHistoryRepository {
  async findBetweenDates(
    userId: string,
    from: Date,
    toExclusive: Date,
  ): Promise<UserXpHistoryRow[]> {
    return prisma.userXpHistory.findMany({
      where: {
        userId,
        createdAt: {
          gte: from,
          lt: toExclusive,
        },
      },
      select: {
        xpAmount: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })
  }
}

