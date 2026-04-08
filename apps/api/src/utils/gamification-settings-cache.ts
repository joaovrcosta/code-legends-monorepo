import { PrismaSystemSettingRepository } from '../repositories/prisma/prisma-system-setting-repository'
import { GetGamificationSettingsUseCase } from '../use-cases/system/gamification/get-settings'

export type GamificationSettings = {
  xpPerLesson: number
  xpPerProject: number
  xpQuizMultiplier: number
}

let cache:
  | {
    value: GamificationSettings
    expiresAt: number
  }
  | undefined

export async function getGamificationSettingsCached(
  ttlMs: number = 60_000,
): Promise<GamificationSettings> {
  const now = Date.now()
  if (cache && cache.expiresAt > now) return cache.value

  const repo = new PrismaSystemSettingRepository()
  const useCase = new GetGamificationSettingsUseCase(repo)
  const { settings } = await useCase.execute()

  const value = {
    xpPerLesson: Number.isFinite(settings.xpPerLesson) ? settings.xpPerLesson : 15,
    xpPerProject: Number.isFinite(settings.xpPerProject) ? settings.xpPerProject : 50,
    xpQuizMultiplier: Number.isFinite(settings.xpQuizMultiplier)
      ? settings.xpQuizMultiplier
      : 1.5,
  }

  cache = { value, expiresAt: now + ttlMs }
  return value
}

