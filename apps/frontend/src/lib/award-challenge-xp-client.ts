'use client'

import { getSession } from 'next-auth/react'
import type { AwardChallengeXpResult } from '@/actions/course/award-challenge-xp'
import { revalidateRoadmapCache } from '@/actions/course/revalidate-roadmap'

/**
 * Regista XP de desafio a partir do browser (token via sessão NextAuth).
 * O server action equivalente pode falhar em alguns ambientes; o quiz usa este caminho.
 */
export async function awardChallengeXpFromBrowser(
  lessonId: number,
  challengeIndex: number,
  options?: { courseId?: string | null },
): Promise<AwardChallengeXpResult> {
  try {
    const session = await getSession()
    const token = (session as { accessToken?: string } | null)?.accessToken
    if (!token) {
      return { applied: false, xpGained: 0, requestFailed: true }
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'

    const response = await fetch(
      `${baseUrl}/lessons/${lessonId}/challenge-xp`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ challengeIndex }),
        cache: 'no-store',
      },
    )

    if (!response.ok) {
      let detail = ''
      try {
        detail = (await response.text()).slice(0, 280)
      } catch {
        /* ignore */
      }
      console.warn(
        '[awardChallengeXpFromBrowser] HTTP',
        response.status,
        lessonId,
        challengeIndex,
        detail,
      )
      return { applied: false, xpGained: 0, requestFailed: true }
    }

    let data: AwardChallengeXpResult
    try {
      const raw = (await response.json()) as Record<string, unknown>
      data = {
        applied: Boolean(raw.applied),
        xpGained: typeof raw.xpGained === 'number' ? raw.xpGained : 0,
        totalXp: typeof raw.totalXp === 'number' ? raw.totalXp : undefined,
        level: typeof raw.level === 'number' ? raw.level : undefined,
        xpToNextLevel:
          typeof raw.xpToNextLevel === 'number' ? raw.xpToNextLevel : undefined,
        levelUp: Boolean(raw.levelUp),
      }
    } catch {
      return { applied: false, xpGained: 0, requestFailed: true }
    }

    const courseId = options?.courseId?.trim()
    if (courseId) {
      try {
        await revalidateRoadmapCache(courseId)
      } catch {
        /* opcional */
      }
    }

    return data
  } catch (e) {
    console.error('awardChallengeXpFromBrowser:', e)
    return { applied: false, xpGained: 0, requestFailed: true }
  }
}
