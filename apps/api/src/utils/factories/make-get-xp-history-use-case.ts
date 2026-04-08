import { PrismaUserXpHistoryRepository } from '../../repositories/prisma/prisma-user-xp-history-repository'
import { GetXpHistoryUseCase } from '../../use-cases/entities/Account/get-xp-history'

export function makeGetXpHistoryUseCase() {
  const userXpHistoryRepository = new PrismaUserXpHistoryRepository()
  return new GetXpHistoryUseCase(userXpHistoryRepository)
}

