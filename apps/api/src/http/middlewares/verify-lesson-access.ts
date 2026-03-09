import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../lib/prisma";
import { PrismaUserCourseRepository } from "../../repositories/prisma/prisma-user-course-repository";
import { PrismaUserProgressRepository } from "../../repositories/prisma/prisma-user-progress-repository";

interface VerifyLessonAccessOptions {
  lessonIdParam?: string; // Nome do parâmetro que contém o lessonId (ex: "id")
  lessonSlugParam?: string; // Nome do parâmetro que contém o lessonSlug (ex: "slug")
  /** Quando a rota tem courseId (ex: /courses/:courseId/lessons/:lessonSlug), passar o nome do param para buscar a aula no curso correto. Evita que slug ambíguo em outro curso libere acesso. */
  courseIdParam?: string;
  allowInstructors?: boolean; // Permitir instrutores acessarem mesmo sem estar inscrito
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

      // Tentar obter lessonId ou slug dos parâmetros
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

      // Buscar a aula (por slug sempre no contexto do curso quando courseId vier na rota; moduleSlug desambigua quando há slugs iguais em módulos diferentes)
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

      // Verificar se é o instrutor do curso (se permitido)
      if (
        allowInstructors &&
        course.instructorId === userId
      ) {
        return; // Permite acesso
      }

      // Usuário FREE só pode acessar aulas gratuitas
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { plan: true },
      });
      const isPaidUser = user?.plan === "PRO" || user?.plan === "PREMIUM";
      if (!isPaidUser && !lessonIsFree) {
        return reply.status(403).send({
          message:
            "Conteúdo exclusivo para assinantes. Faça upgrade para acessar.",
        });
      }

      // Verificar se o usuário está inscrito no curso
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

      // Verificar se a aula foi concluída (permitir revisão)
      const userProgressRepository = new PrismaUserProgressRepository();
      const userProgress = await userProgressRepository.findByUserAndTask(
        userId,
        lesson.id
      );

      const isCompleted = userProgress?.isCompleted ?? false;

      // Se a aula foi concluída, sempre permite acesso (revisão)
      if (isCompleted) {
        return; // Permite acesso para revisão
      }

      // Nova regra de bloqueio:
      // - Apenas respeita o flag manual "locked" da lição
      // - Não depende mais da conclusão de aulas anteriores
      if (lesson.locked) {
        return reply.status(403).send({
          message: "This lesson is locked by the instructor.",
        });
      }

      // Acesso permitido
    } catch (error) {
      console.error("Error in verifyLessonAccess:", error);
      return reply.status(500).send({ message: "Internal server error" });
    }
  };
}
