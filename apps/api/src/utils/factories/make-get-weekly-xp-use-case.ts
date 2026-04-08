import { PrismaUserXpHistoryRepository } from '../../repositories/prisma/prisma-user-xp-history-repository'
import { GetWeeklyXpUseCase } from '../../use-cases/entities/Account/get-weekly-xp'

export function makeGetWeeklyXpUseCase() {
  const userXpHistoryRepository = new PrismaUserXpHistoryRepository()
  const useCase = new GetWeeklyXpUseCase(userXpHistoryRepository)
  return useCase
}

