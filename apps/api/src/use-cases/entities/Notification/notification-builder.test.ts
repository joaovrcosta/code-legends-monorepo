import { describe, it, expect } from "vitest";
import { NotificationBuilder } from "../../../utils/notification-builder";
import { NotificationType } from "@prisma/client";

describe("NotificationBuilder", () => {
  describe("createCertificateNotification", () => {
    it("deve criar notificação de certificado corretamente", () => {
      const userId = "user-123";
      const certificateData = {
        certificateId: "cert-123",
        courseId: "course-123",
        courseTitle: "Curso de TypeScript",
      };

      const notification = NotificationBuilder.createCertificateNotification(
        userId,
        certificateData
      );

      expect(notification.userId).toBe(userId);
      expect(notification.type).toBe(NotificationType.CERTIFICATE_GENERATED);
      expect(notification.title).toBe("Certificado Gerado! 🎓");
      expect(notification.message).toContain(certificateData.courseTitle);
      expect(notification.data).toEqual({
        certificateId: certificateData.certificateId,
        courseId: certificateData.courseId,
        courseTitle: certificateData.courseTitle,
      });
    });
  });

  describe("createLevelUpNotification", () => {
    it("deve criar notificação de level up corretamente", () => {
      const userId = "user-123";
      const levelData = {
        level: 5,
        totalXp: 500,
        xpToNextLevel: 50,
      };

      const notification = NotificationBuilder.createLevelUpNotification(
        userId,
        levelData
      );

      expect(notification.userId).toBe(userId);
      expect(notification.type).toBe(NotificationType.LEVEL_UP);
      expect(notification.title).toBe("Nível 5 Alcançado! ⬆️");
      expect(notification.message).toContain("nível 5");
      expect(notification.data).toEqual(levelData);
    });
  });

  describe("createRequestStatusNotification", () => {
    it("deve criar notificação de solicitação aprovada", () => {
      const userId = "user-123";
      const requestData = {
        requestId: "req-123",
        oldStatus: "PENDING",
        newStatus: "APPROVED",
        response: "Sua solicitação foi aprovada!",
      };

      const notification = NotificationBuilder.createRequestStatusNotification(
        userId,
        requestData
      );

      expect(notification.userId).toBe(userId);
      expect(notification.type).toBe(NotificationType.REQUEST_STATUS_CHANGED);
      expect(notification.title).toBe("Solicitação aprovada ✅");
      expect(notification.message).toContain("aprovada");
      expect(notification.message).toContain(requestData.response);
      expect(notification.data).toEqual(requestData);
    });

    it("deve criar notificação de solicitação rejeitada", () => {
      const userId = "user-123";
      const requestData = {
        requestId: "req-123",
        oldStatus: "PENDING",
        newStatus: "REJECTED",
        response: null,
      };

      const notification = NotificationBuilder.createRequestStatusNotification(
        userId,
        requestData
      );

      expect(notification.title).toBe("Solicitação rejeitada ❌");
      expect(notification.message).toContain("rejeitada");
    });
  });

  describe("createNewCourseNotification", () => {
    it("deve criar notificação de novo curso com instrutor", () => {
      const userId = "user-123";
      const courseData = {
        courseId: "course-123",
        courseTitle: "Curso de React",
        courseSlug: "curso-de-react",
        instructorName: "João Silva",
      };

      const notification = NotificationBuilder.createNewCourseNotification(
        userId,
        courseData
      );

      expect(notification.userId).toBe(userId);
      expect(notification.type).toBe(NotificationType.NEW_COURSE_AVAILABLE);
      expect(notification.title).toBe("Novo Curso Disponível! 🎉");
      expect(notification.message).toContain(courseData.courseTitle);
      expect(notification.message).toContain(courseData.instructorName);
      expect(notification.data).toEqual(courseData);
    });

    it("deve criar notificação de novo curso sem instrutor", () => {
      const userId = "user-123";
      const courseData = {
        courseId: "course-123",
        courseTitle: "Curso de React",
        courseSlug: "curso-de-react",
      };

      const notification = NotificationBuilder.createNewCourseNotification(
        userId,
        courseData
      );

      expect(notification.message).not.toContain("por");
    });
  });

  describe("createCourseCompletedNotification", () => {
    it("deve criar notificação de curso completado corretamente", () => {
      const userId = "user-123";
      const courseData = {
        courseId: "course-123",
        courseTitle: "Curso de TypeScript",
        courseSlug: "curso-de-typescript",
      };

      const notification = NotificationBuilder.createCourseCompletedNotification(
        userId,
        courseData
      );

      expect(notification.userId).toBe(userId);
      expect(notification.type).toBe(NotificationType.COURSE_COMPLETED);
      expect(notification.title).toBe("Curso Completado! 🎊");
      expect(notification.message).toContain(courseData.courseTitle);
      expect(notification.data).toEqual(courseData);
    });
  });

  describe("createEventNotification", () => {
    it("deve criar notificação de evento com data", () => {
      const userId = "user-123";
      const eventData = {
        eventId: "event-123",
        eventTitle: "Workshop de React",
        eventDate: new Date("2024-12-25"),
      };

      const notification = NotificationBuilder.createEventNotification(
        userId,
        eventData
      );

      expect(notification.userId).toBe(userId);
      expect(notification.type).toBe(NotificationType.NEW_EVENT);
      expect(notification.title).toBe("Novo Evento! 📅");
      expect(notification.message).toContain(eventData.eventTitle);
      expect(notification.data).toEqual(eventData);
    });

    it("deve criar notificação de evento sem data", () => {
      const userId = "user-123";
      const eventData = {
        eventId: "event-123",
        eventTitle: "Workshop de React",
        eventDate: null,
      };

      const notification = NotificationBuilder.createEventNotification(
        userId,
        eventData
      );

      expect(notification.message).not.toContain("está agendado");
    });
  });
});
