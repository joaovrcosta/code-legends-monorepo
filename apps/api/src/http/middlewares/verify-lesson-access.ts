import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../lib/prisma";
import { PrismaUserCourseRepository } from "../../repositories/prisma/prisma-user-course-repository";
import { PrismaUserProgressRepository } from "../../repositories/prisma/prisma-user-progress-repository";

interface VerifyLessonAccessOptions {
  lessonIdParam?: string; // Nome do parâmetro que contém o lessonId (ex: "id")
  lessonSlugParam?: string; // Nome do parâmetro que contém o lessonSlug (ex: "slug")
  allowInstructors?: boolean; // Permitir instrutores acessarem mesmo sem estar inscrito
}

export function verifyLessonAccess(options: VerifyLessonAccessOptions = {}) {
  const {
    lessonIdParam = "id",
    lessonSlugParam = "slug",
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
      const lessonId = params[lessonIdParam]
        ? Number(params[lessonIdParam])
        : null;
      const lessonSlug = params[lessonSlugParam];

      if (!lessonId && !lessonSlug) {
        return reply
          .status(400)
          .send({ message: "Lesson ID or slug is required" });
      }

      // Buscar a aula
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
        lesson = await prisma.lesson.findUnique({
          where: { slug: lessonSlug },
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

      // Verificar se é o instrutor do curso (se permitido)
      if (
        allowInstructors &&
        lesson.submodule.module.course.instructorId === userId
      ) {
        return; // Permite acesso
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

      // Se não foi concluída, verificar se está desbloqueada
      const isUnlocked = await checkIfLessonIsUnlocked(
        userId,
        lesson.id,
        courseId
      );

      if (!isUnlocked) {
        return reply.status(403).send({
          message:
            "This lesson is locked. Complete previous lessons to unlock it.",
        });
      }

      // Acesso permitido
    } catch (error) {
      console.error("Error in verifyLessonAccess:", error);
      return reply.status(500).send({ message: "Internal server error" });
    }
  };
}

async function checkIfLessonIsUnlocked(
  userId: string,
  lessonId: number,
  courseId: string
): Promise<boolean> {
  // Buscar todas as aulas do curso em ordem
  const modules = await prisma.module.findMany({
    where: { courseId },
    include: {
      groups: {
        include: {
          lessons: {
            orderBy: {
              order: "asc",
            },
          },
        },
        orderBy: {
          id: "asc",
        },
      },
    },
    orderBy: {
      id: "asc",
    },
  });

  // Construir lista de todas as aulas em ordem
  const allLessons: Array<{ id: number }> = [];
  modules.forEach((module) => {
    module.groups.forEach((group) => {
      group.lessons.forEach((lesson) => {
        allLessons.push({ id: lesson.id });
      });
    });
  });

  const lessonIndex = allLessons.findIndex((l) => l.id === lessonId);

  // Primeira aula sempre está desbloqueada
  if (lessonIndex === 0) {
    return true;
  }

  // Se não encontrou a aula na lista, não está desbloqueada
  if (lessonIndex === -1) {
    return false;
  }

  // Verificar se a aula anterior foi concluída
  const previousLesson = allLessons[lessonIndex - 1];
  const userProgressRepository = new PrismaUserProgressRepository();
  const previousProgress = await userProgressRepository.findByUserAndTask(
    userId,
    previousLesson.id
  );

  return previousProgress?.isCompleted ?? false;
}
