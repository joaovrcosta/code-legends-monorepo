import { UserPlan } from "@code-legends/shared-types";
import { canAccessPathUnit } from "@/lib/user-plan";
import type { EnrolledCourse } from "@/types/user-course.ts";

export function isVisibleInContinueLearning(
  course: EnrolledCourse,
  plan: UserPlan,
): boolean {
  if (course.progress <= 0 || course.isCompleted) return false;
  if (course.course.kind === "PATH_UNIT" && !canAccessPathUnit(plan)) return false;
  return true;
}
