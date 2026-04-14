import { resolveUserStreakForApi } from '../../../lib/user-streak-resolve'

export type GetStreakResponse = {
  current: number
  best: number
  totalActiveDays: number
  lastActiveDate: string | null
}

export class GetStreakUseCase {
  async execute(userId: string): Promise<GetStreakResponse> {
    return resolveUserStreakForApi(userId)
  }
}

