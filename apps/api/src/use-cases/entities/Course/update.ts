import { Course } from "@prisma/client";
import { ICourseRepository } from "../../../repositories/course-repository";
import { ICategoryRepository } from "../../../repositories/category-repository";
import { CourseNotFoundError } from "../../errors/course-not-found";
import { CourseAlreadyExistsError } from "../../errors/course-already-exists";
import { CategoryNotFoundError } from "../../errors/category-not-found";
import { NotificationBuilder } from "../../../utils/notification-builder";
import { createNotificationsBatch } from "../../../utils/create-notification";
import { prisma } from "../../../lib/prisma";

interface UpdateCourseRequest {
  id: string;
  title?: string;
  slug?: string;
  description?: string;
  level?: string;
  categoryId?: string | null;
  thumbnail?: string | null;
  icon?: string | null;
  colorHex?: string | null;
  tags?: string[];
  isFree?: boolean;
  active?: boolean;
  releaseAt?: Date | null;
}

interface UpdateCourseResponse {
  course: Course;
}

export class UpdateCourseUseCase {
  constructor(
    private courseRepository: ICourseRepository,
    private categoryRepository: ICategoryRepository
  ) {}

  async execute(data: UpdateCourseRequest): Promise<UpdateCourseResponse> {
    // Verificar se o curso existe
    const course = await this.courseRepository.findById(data.id);

    if (!course) {
      throw new CourseNotFoundError();
    }

    // Se está alterando o slug, verificar se não existe outro curso com o mesmo slug
    if (data.slug && data.slug !== course.slug) {
      const courseWithSameSlug = await this.courseRepository.findBySlug(
        data.slug
      );

      if (courseWithSameSlug) {
        throw new CourseAlreadyExistsError();
      }
    }

    // Validar categoria (se fornecida)
    if (data.categoryId) {
      const category = await this.categoryRepository.findById(data.categoryId);

      if (!category) {
        throw new CategoryNotFoundError();
      }
    }

    const wasActive = course.active;
    const updatedCourse = await this.courseRepository.update(data.id, {
      title: data.title,
      slug: data.slug,
      description: data.description,
      level: data.level,
      categoryId: data.categoryId,
      thumbnail: data.thumbnail,
      icon: data.icon,
      colorHex: data.colorHex,
      tags: data.tags,
      isFree: data.isFree,
      active: data.active,
      releaseAt: data.releaseAt,
    });

    // Criar notificações se o curso foi ativado (de false para true)
    // Fazemos isso de forma assíncrona para não bloquear a resposta
    if (!wasActive && updatedCourse.active) {
      // Não aguardamos a conclusão - executa em background
      setImmediate(async () => {
        try {
          // Buscar instrutor do curso
          const instructor = await prisma.user.findUnique({
            where: { id: course.instructorId },
            select: { name: true },
          });

          // Buscar todos os usuários (apenas IDs para performance)
          const users = await prisma.user.findMany({
            select: { id: true },
          });

          if (users.length > 0) {
            const notifications = users.map((user) =>
              NotificationBuilder.createNewCourseNotification(user.id, {
                courseId: updatedCourse.id,
                courseTitle: updatedCourse.title,
                courseSlug: updatedCourse.slug,
                instructorName: instructor?.name,
              })
            );

            await createNotificationsBatch(notifications);
          }
        } catch (error) {
          // Não quebra o fluxo se a notificação falhar
          console.error("Erro ao criar notificações de novo curso:", {
            courseId: updatedCourse.id,
            error: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined,
          });
        }
      });
    }

    return {
      course: updatedCourse,
    };
  }
}
