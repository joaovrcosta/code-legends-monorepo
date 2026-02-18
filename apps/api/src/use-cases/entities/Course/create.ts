import { Course } from "@prisma/client";
import { ICourseRepository } from "../../../repositories/course-repository";
import { IUsersRepository } from "../../../repositories/users-repository";
import { ICategoryRepository } from "../../../repositories/category-repository";
import { CourseAlreadyExistsError } from "../../errors/course-already-exists";
import { InstructorNotFoundError } from "../../errors/instructor-not-found";
import { CategoryNotFoundError } from "../../errors/category-not-found";
import { NotificationBuilder } from "../../../utils/notification-builder";
import { createNotificationsBatch } from "../../../utils/create-notification";
import { prisma } from "../../../lib/prisma";

interface CreateCourseRequest {
  title: string;
  slug: string;
  description: string;
  level: string;
  instructorId: string;
  categoryId?: string | null;
  thumbnail?: string | null;
  icon?: string | null;
  colorHex?: string | null;
  tags?: string[];
  isFree?: boolean;
  active?: boolean;
  releaseAt?: Date | null;
}

interface CreateCourseResponse {
  course: Course;
}

export class CreateCourseUseCase {
  constructor(
    private courseRepository: ICourseRepository,
    private usersRepository: IUsersRepository,
    private categoryRepository: ICategoryRepository
  ) { }

  async execute(data: CreateCourseRequest): Promise<CreateCourseResponse> {
    // Verificar se o curso já existe
    const courseWithSameSlug = await this.courseRepository.findBySlug(
      data.slug
    );

    if (courseWithSameSlug) {
      throw new CourseAlreadyExistsError();
    }

    // Verificar se o instrutor existe
    const instructor = await this.usersRepository.findById(data.instructorId);

    if (!instructor) {
      throw new InstructorNotFoundError();
    }

    // Validar se o usuário tem role de INSTRUCTOR ou ADMIN
    if (instructor.role !== "INSTRUCTOR" && instructor.role !== "ADMIN") {
      throw new Error("User is not an instructor or admin");
    }

    // Validar categoria (se fornecida)
    if (data.categoryId) {
      const category = await this.categoryRepository.findById(data.categoryId);

      if (!category) {
        throw new CategoryNotFoundError();
      }
    }

    const course = await this.courseRepository.create(data);

    // Criar notificações para usuários ativos (último login nos últimos 30 dias) se o curso estiver ativo
    // Fazemos isso de forma assíncrona para não bloquear a resposta
    if (course.active) {
      // Não aguardamos a conclusão - executa em background
      setImmediate(async () => {
        try {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

          // Buscar apenas usuários ativos (fizeram login nos últimos 30 dias)
          const users = await prisma.user.findMany({
            where: {
              lastLogin: {
                gte: thirtyDaysAgo,
              },
            },
            select: { id: true },
          });

          if (users.length > 0) {
            const notifications = users.map((user) =>
              NotificationBuilder.createNewCourseNotification(user.id, {
                courseId: course.id,
                courseTitle: course.title,
                courseSlug: course.slug,
                instructorName: instructor.name,
              })
            );

            await createNotificationsBatch(notifications);
          }
        } catch (error) {
          // Não quebra o fluxo se a notificação falhar
          console.error("Erro ao criar notificações de novo curso:", {
            courseId: course.id,
            error: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined,
          });
        }
      });
    }

    return {
      course,
    };
  }
}
