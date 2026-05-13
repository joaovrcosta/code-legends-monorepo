import { NotificationType } from "@prisma/client";

interface CertificateData {
  certificateId: string;
  courseId: string;
  courseTitle: string;
}

interface CareerCertificateData {
  certificateId: string;
  careerId: string;
  careerTitle: string;
}

interface LevelUpData {
  level: number;
  totalXp: number;
  xpToNextLevel: number;
}

interface RequestStatusData {
  requestId: string;
  oldStatus: string;
  newStatus: string;
  response?: string | null;
}

function truncateForNotification(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

interface CourseData {
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  instructorName?: string;
}

interface EventData {
  eventId: string;
  eventTitle: string;
  eventDate?: Date | null;
}

export class NotificationBuilder {
  static createCertificateNotification(
    userId: string,
    certificate: CertificateData
  ) {
    return {
      userId,
      type: NotificationType.CERTIFICATE_GENERATED,
      title: "Certificado Gerado! 🎓",
      message: `Parabéns! Você completou o curso "${certificate.courseTitle}" e seu certificado foi gerado.`,
      data: {
        certificateId: certificate.certificateId,
        courseId: certificate.courseId,
        courseTitle: certificate.courseTitle,
      },
    };
  }

  static createCareerCertificateNotification(
    userId: string,
    data: CareerCertificateData
  ) {
    return {
      userId,
      type: NotificationType.CERTIFICATE_GENERATED,
      title: "Certificado de carreira! 🎓",
      message: `Parabéns! Você concluiu a carreira "${data.careerTitle}" e seu certificado foi gerado.`,
      data: {
        certificateId: data.certificateId,
        careerId: data.careerId,
        careerTitle: data.careerTitle,
      },
    };
  }

  static createLevelUpNotification(
    userId: string,
    levelData: LevelUpData
  ) {
    return {
      userId,
      type: NotificationType.LEVEL_UP,
      title: `Nível ${levelData.level} Alcançado! ⬆️`,
      message: `Parabéns! Você subiu para o nível ${levelData.level}. Continue estudando para alcançar o próximo nível!`,
      data: {
        level: levelData.level,
        totalXp: levelData.totalXp,
        xpToNextLevel: levelData.xpToNextLevel,
      },
    };
  }

  static createRequestStatusNotification(
    userId: string,
    requestData: RequestStatusData
  ) {
    const statusMessages: Record<string, string> = {
      APPROVED: "aprovada",
      REJECTED: "rejeitada",
      IN_PROGRESS: "pendente",
      PENDING: "pendente",
    };

    const statusEmojis: Record<string, string> = {
      APPROVED: "✅",
      REJECTED: "❌",
      IN_PROGRESS: "⏳",
      PENDING: "⏳",
    };

    const statusMessage = statusMessages[requestData.newStatus] || requestData.newStatus.toLowerCase();
    const emoji = statusEmojis[requestData.newStatus] || "📋";

    return {
      userId,
      type: NotificationType.REQUEST_STATUS_CHANGED,
      title: `Solicitação ${statusMessage} ${emoji}`,
      message: `Sua solicitação foi ${statusMessage}${requestData.response
        ? `. ${truncateForNotification(String(requestData.response), 400)}`
        : ""
        }`,
      data: {
        requestId: requestData.requestId,
        oldStatus: requestData.oldStatus,
        newStatus: requestData.newStatus,
        response: requestData.response,
      },
    };
  }

  static createRequestReplyNotification(
    userId: string,
    requestData: { requestId: string; title: string | null; response: string }
  ) {
    const preview = truncateForNotification(requestData.response, 450);
    const label = requestData.title?.trim()
      ? `"${truncateForNotification(requestData.title, 100)}"`
      : "sua solicitação";

    return {
      userId,
      type: NotificationType.REQUEST_STATUS_CHANGED,
      title: "Equipe Code Legends 💬",
      message: `Há uma nova mensagem em ${label}: ${preview}`,
      data: {
        requestId: requestData.requestId,
        response: requestData.response,
        kind: "REQUEST_REPLY" as const,
      },
    };
  }

  static createNewCourseNotification(
    userId: string,
    course: CourseData
  ) {
    return {
      userId,
      type: NotificationType.NEW_COURSE_AVAILABLE,
      title: "Novo Curso Disponível! 🎉",
      message: `Um novo curso fresquinho saiu: ${course.courseTitle}${course.instructorName ? ` por ${course.instructorName}` : ""} está disponível. Confira agora!`,
      data: {
        courseId: course.courseId,
        courseTitle: course.courseTitle,
        courseSlug: course.courseSlug,
        instructorName: course.instructorName,
      },
    };
  }

  static createCourseCompletedNotification(
    userId: string,
    course: CourseData
  ) {
    return {
      userId,
      type: NotificationType.COURSE_COMPLETED,
      title: "Curso Completado! 🎊",
      message: `Certificado gerado para o curso "${course.courseTitle}". Continue aprendendo!`,
      data: {
        courseId: course.courseId,
        courseTitle: course.courseTitle,
        courseSlug: course.courseSlug,
      },
    };
  }

  static createEventNotification(
    userId: string,
    event: EventData
  ) {
    return {
      userId,
      type: NotificationType.NEW_EVENT,
      title: "Novo Evento! 📅",
      message: `Um novo evento "${event.eventTitle}"${event.eventDate ? ` está agendado para ${event.eventDate.toLocaleDateString("pt-BR")}` : ""}. Não perca!`,
      data: {
        eventId: event.eventId,
        eventTitle: event.eventTitle,
        eventDate: event.eventDate,
      },
    };
  }
}
