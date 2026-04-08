import { toast } from "sonner";

import type { ContinueCourseResult } from "@/actions/course";

export function showLessonXpToast(result: ContinueCourseResult) {
  if (!result?.success) return;
  const xp = result.xpGained;
  if (typeof xp !== "number" || xp <= 0) return;

  toast.success(`+${xp} XP nesta lição`, {
    description: "Continue acumulando para subir de nível.",
  });
}
