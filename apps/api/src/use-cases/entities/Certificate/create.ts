import { Certificate } from "@prisma/client";
import { CertificateRepository } from "../../../repositories/certificate-repository";
import { IUsersRepository } from "../../../repositories/users-repository";
import { ICourseRepository } from "../../../repositories/course-repository";
import { IUserCourseRepository } from "../../../repositories/user-course-repository";
import { CertificateAlreadyExistsError } from "../../errors/certificate-already-exists";
import { UserNotFoundError } from "../../errors/user-not-found";
import { CourseNotFoundError } from "../../errors/course-not-found";
import { CourseNotCompletedError } from "../../errors/course-not-completed";
import { NotificationBuilder } from "../../../utils/notification-builder";
import { createNotification } from "../../../utils/create-notification";

interface CreateCertificateUseCaseRequest {
  userId: string;
  courseId: string;
  templateId?: string;
}

interface CreateCertificateUseCaseResponse {
  certificate: Certificate;
}

export class CreateCertificateUseCase {
  constructor(
    private certificateRepository: CertificateRepository,
    private usersRepository: IUsersRepository,
    private courseRepository: ICourseRepository,
    private userCourseRepository: IUserCourseRepository
  ) {}

  async execute({
    userId,
    courseId,
    templateId,
  }: CreateCertificateUseCaseRequest): Promise<CreateCertificateUseCaseResponse> {
    // Verificar se o usuário existe
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError();
    }

    // Verificar se o curso existe
    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw new CourseNotFoundError();
    }

    // Verificar se o curso foi completado pelo usuário
    const userCourse = await this.userCourseRepository.findByUserAndCourse(
      userId,
      courseId
    );

    if (!userCourse) {
      throw new CourseNotFoundError();
    }

    if (!userCourse.isCompleted) {
      throw new CourseNotCompletedError();
    }

    // Verificar se já existe um certificado para esse usuário e curso
    // Se existir, retornar o existente ao invés de criar um novo
    const existingCertificate =
      await this.certificateRepository.findByUserIdAndCourseId(
        userId,
        courseId
      );

    if (existingCertificate) {
      return {
        certificate: existingCertificate,
      };
    }

    // Criar o certificado
    const certificate = await this.certificateRepository.create({
      user: {
        connect: { id: userId },
      },
      course: {
        connect: { id: courseId },
      },
      ...(templateId && {
        template: {
          connect: { id: templateId },
        },
      }),
    });

    // Criar notificação de certificado gerado
    try {
      const notificationData = NotificationBuilder.createCertificateNotification(
        userId,
        {
          certificateId: certificate.id,
          courseId: course.id,
          courseTitle: course.title,
        }
      );

      await createNotification(notificationData);
    } catch (error) {
      // Não quebra o fluxo se a notificação falhar
      console.error("Erro ao criar notificação de certificado:", error);
    }

    return {
      certificate,
    };
  }
}
