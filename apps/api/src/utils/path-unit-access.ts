import { Course } from "@prisma/client";
import { PlanFeatures } from "@code-legends/plans";
import { prisma } from "../lib/prisma";
import { CourseNotFoundError } from "../use-cases/errors/course-not-found";
import { PrismaUserCourseRepository } from "../repositories/prisma/prisma-user-course-repository";
import { makePlanAccessService } from "./factories/make-plan-access-service";

type PathUnitCourseRef = Pick<Course, "kind" | "exclusiveCareerId">;

export async function userHasPathUnitAccess(userId: string): Promise<boolean> {
  const planAccess = makePlanAccessService();
  return planAccess.hasFeature(userId, PlanFeatures.PATH_UNIT_ACCESS);
}

/** @deprecated Use userHasPathUnitAccess — mantido para compatibilidade interna */
export async function userHasPremiumPlan(userId: string): Promise<boolean> {
  return userHasPathUnitAccess(userId);
}

export async function userHasPathUnitCareerAccess(
  userId: string | undefined,
  course: PathUnitCourseRef,
): Promise<boolean> {
  if (course.kind !== "PATH_UNIT") {
    return true;
  }

  if (!userId || !course.exclusiveCareerId) {
    return false;
  }

  const planAccess = makePlanAccessService();
  const [hasPathUnitFeature, userCareer] = await Promise.all([
    planAccess.hasFeature(userId, PlanFeatures.PATH_UNIT_ACCESS),
    prisma.userCareer.findUnique({
      where: {
        userId_careerId: {
          userId,
          careerId: course.exclusiveCareerId,
        },
      },
    }),
  ]);

  return hasPathUnitFeature && userCareer != null;
}

export async function assertUserCanAccessPathUnitCourse(
  userId: string | undefined,
  course: PathUnitCourseRef,
  options?: { bypassForStaff?: boolean },
): Promise<void> {
  if (course.kind !== "PATH_UNIT" || options?.bypassForStaff) {
    return;
  }

  if (!userId) {
    throw new CourseNotFoundError();
  }

  const hasAccess = await userHasPathUnitAccess(userId);
  if (!hasAccess) {
    throw new CourseNotFoundError();
  }

  const hasCareerAccess = await userHasPathUnitCareerAccess(userId, course);
  if (!hasCareerAccess) {
    throw new CourseNotFoundError();
  }
}

export async function ensureUserCourseForPathUnit(
  userId: string,
  course: Course,
): Promise<void> {
  if (course.kind !== "PATH_UNIT") {
    return;
  }

  const hasAccess = await userHasPathUnitCareerAccess(userId, course);
  if (!hasAccess) {
    return;
  }

  const userCourseRepository = new PrismaUserCourseRepository();
  const existing = await userCourseRepository.findByUserAndCourse(
    userId,
    course.id,
  );

  if (!existing) {
    await userCourseRepository.enroll(userId, course.id);
  }
}

export async function enrollUserInCareerPathUnits(
  userId: string,
  careerId: string,
): Promise<void> {
  const pathUnits = await prisma.course.findMany({
    where: {
      kind: "PATH_UNIT",
      exclusiveCareerId: careerId,
      active: true,
    },
    select: { id: true },
  });

  if (pathUnits.length === 0) {
    return;
  }

  const userCourseRepository = new PrismaUserCourseRepository();

  for (const { id } of pathUnits) {
    const existing = await userCourseRepository.findByUserAndCourse(userId, id);
    if (!existing) {
      await userCourseRepository.enroll(userId, id);
    }
  }
}
