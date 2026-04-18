"use server";

import { revalidateTag } from "next/cache";
import { getAuthToken } from "../auth/session";
import { getActiveCourse } from "../user/get-active-course";

export interface AwardChallengeXpResult {
  applied: boolean;
  xpGained: number;
  totalXp?: number;
  level?: number;
  xpToNextLevel?: number;
  levelUp?: boolean;
  /** Pedido HTTP falhou (rede, 4xx/5xx) — não confundir com “já ganhou o bónus”. */
  requestFailed?: boolean;
}

export async function awardChallengeXp(
  lessonId: number,
  challengeIndex: number,
): Promise<AwardChallengeXpResult> {
  try {
    const token = await getAuthToken();
    if (!token) {
      return { applied: false, xpGained: 0 };
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";
    const response = await fetch(
      `${baseUrl}/lessons/${lessonId}/challenge-xp`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ challengeIndex }),
        cache: "no-store",
      },
    );

    if (!response.ok) {
      let detail = "";
      try {
        detail = (await response.text()).slice(0, 280);
      } catch {
        /* ignore */
      }
      console.warn(
        "[awardChallengeXp] HTTP",
        response.status,
        lessonId,
        challengeIndex,
        detail,
      );
      return { applied: false, xpGained: 0, requestFailed: true };
    }

    let data: AwardChallengeXpResult;
    try {
      const raw = (await response.json()) as Record<string, unknown>;
      data = {
        applied: Boolean(raw.applied),
        xpGained: typeof raw.xpGained === "number" ? raw.xpGained : 0,
        totalXp: typeof raw.totalXp === "number" ? raw.totalXp : undefined,
        level: typeof raw.level === "number" ? raw.level : undefined,
        xpToNextLevel:
          typeof raw.xpToNextLevel === "number" ? raw.xpToNextLevel : undefined,
        levelUp: Boolean(raw.levelUp),
      };
    } catch {
      return { applied: false, xpGained: 0, requestFailed: true };
    }

    try {
      const activeCourseId = (await getActiveCourse())?.id;
      if (activeCourseId) {
        revalidateTag(`roadmap-${activeCourseId}`);
      }
    } catch {
      /* cache opcional */
    }

    return data;
  } catch (error) {
    console.error("awardChallengeXp:", error);
    return { applied: false, xpGained: 0, requestFailed: true };
  }
}
