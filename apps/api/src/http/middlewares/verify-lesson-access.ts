import { FastifyReply, FastifyRequest } from "fastify";
import { PlanFeatures } from "@code-legends/plans";
import { prisma } from "../../lib/prisma";
import { PrismaUserCourseRepository } from "../../repositories/prisma/prisma-user-course-repository";
import { PrismaUserProgressRepository } from "../../repositories/prisma/prisma-user-progress-repository";
import { makePlanAccessService } from "../../utils/factories/make-plan-access-service";
import {
  ensureUserCourseForPathUnit,
  userHasPathUnitCareerAccess,
  userHasPathUnitAccess,
} from "../../utils/path-unit-access";

interface VerifyLessonAccessOptions {
  lessonIdParam?: string;
  lessonSlugParam?: string;
  courseIdParam?: string;
  allowInstructors?: boolean;
}

export function verifyLessonAccess(options: VerifyLessonAccessOptions = {}) {
  const {
    lessonIdParam = "id",
    lessonSlugParam = "slug",
    courseIdParam,
    allowInstructors = true,
  } = options;

  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = request.user?.id;

      if (!userId) {
        return reply.status(401).send({ message: "Unauthorized" });
      }

      const params = request.params as Record<string, string>;
      const query = (request.query as Record<string, string>) || {};
      const lessonId = params[lessonIdParam]
        ? Number(params[lessonIdParam])
        : null;
      const lessonSlug = params[lessonSlugParam];
      const courseIdFromRoute = courseIdParam ? params[courseIdParam] : undefined;
      const moduleSlugFromQuery = query.moduleSlug;

      if (!lessonId && !lessonSlug) {
        return reply
          .status(400)
          .send({ message: "Lesson ID or slug is required" });
      }

      let lesson;
      if (lessonId) {
        lesson = await prisma.lesson.findUnique({
          where: { id: lessonId },
          include: {
            submodule: {
              include: {
                module: {
                  include: {
                    course: true,
                  },
                },
              },
            },
          },
        });
      } else if (lessonSlug) {
        const whereBySlug =
          courseIdFromRoute
            ? {
              slug: lessonSlug,
              submodule: {
                module: {
                  courseId: courseIdFromRoute,
                  ...(moduleSlugFromQuery
                    ? { slug: moduleSlugFromQuery }
                    : {}),
                },
              },
            }
            : { slug: lessonSlug };
        lesson = await prisma.lesson.findFirst({
          where: whereBySlug,
          include: {
            submodule: {
              include: {
                module: {
                  include: {
                    course: true,
                  },
                },
              },
            },
          },
        });
      }

      if (!lesson) {
        return reply.status(404).send({ message: "Lesson not found" });
      }

      const courseId = lesson.submodule.module.courseId;
      const course = lesson.submodule.module.course;
      const courseIsFree = course.isFree;
      const lessonIsFree = lesson.isFree;
      const planAccess = makePlanAccessService();

      if (
        allowInstructors &&
        course.instructorId === userId
      ) {
        return;
      }

      if (course.kind === "PATH_UNIT") {
        const hasPathUnit = await userHasPathUnitAccess(userId);
        if (!hasPathUnit) {
          return reply.status(403).send({
            message:
              "Unidades Extras estão disponíveis apenas no plano Premium.",
          });
        }

        const hasCareerAccess = await userHasPathUnitCareerAccess(userId, course);
        if (!hasCareerAccess) {
          return reply.status(403).send({
            message:
              "Unidades Extras só estão disponíveis para alunos inscritos na carreira.",
          });
        }

        await ensureUserCourseForPathUnit(userId, course);
      }

      const hasCatalogPaid = await planAccess.hasFeature(
        userId,
        PlanFeatures.CATALOG_PAID,
      );
      if (!hasCatalogPaid && !lessonIsFree && !courseIsFree) {
        return reply.status(403).send({
          message:
            "Conteúdo exclusivo para assinantes. Faça upgrade para acessar.",
        });
      }

      if (!lessonIsFree && !courseIsFree) {
        const userCourseRepository = new PrismaUserCourseRepository();
        const userCourse = await userCourseRepository.findByUserAndCourse(
          userId,
          courseId
        );

        if (!userCourse) {
          return reply.status(403).send({
            message: "You must be enrolled in this course to access this lesson",
          });
        }
      }

      const userProgressRepository = new PrismaUserProgressRepository();
      const userProgress = await userProgressRepository.findByUserAndTask(
        userId,
        lesson.id
      );

      const isCompleted = userProgress?.isCompleted ?? false;

      if (isCompleted) {
        return;
      }

      if (lesson.locked) {
        return reply.status(403).send({
          message: "This lesson is locked by the instructor.",
        });
      }
    } catch (error) {
      console.error("Error in verifyLessonAccess:", error);
      return reply.status(500).send({ message: "Internal server error" });
    }
  };
}
