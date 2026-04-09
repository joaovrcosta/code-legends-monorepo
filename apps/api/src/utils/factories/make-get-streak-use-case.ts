import { GetStreakUseCase } from '../../use-cases/entities/Account/get-streak'

export function makeGetStreakUseCase() {
  return new GetStreakUseCase()
}

