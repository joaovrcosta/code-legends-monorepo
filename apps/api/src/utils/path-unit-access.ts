import { Course } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { CourseNotFoundError } from "../use-cases/errors/course-not-found";
import { PrismaUserCourseRepository } from "../repositories/prisma/prisma-user-course-repository";

type PathUnitCourseRef = Pick<Course, "kind" | "exclusiveCareerId">;

export async function userHasPremiumPlan(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true },
  });

  return user?.plan === "PREMIUM";
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

  const [user, userCareer] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    }),
    prisma.userCareer.findUnique({
      where: {
        userId_careerId: {
          userId,
          careerId: course.exclusiveCareerId,
        },
      },
    }),
  ]);

  return user?.plan === "PREMIUM" && userCareer != null;
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

  const isPremium = await userHasPremiumPlan(userId);
  if (!isPremium) {
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
