import { describe, it, expect, beforeEach, vi } from "vitest";
import { MarkAsReadUseCase } from "./mark-as-read";
import { INotificationRepository } from "../../../repositories/notification-repository";
import { NotificationNotFoundError } from "../../errors/notification-not-found";
import { NotificationType } from "@prisma/client";

describe("MarkAsReadUseCase", () => {
  let markAsReadUseCase: MarkAsReadUseCase;
  let mockNotificationRepository: INotificationRepository;

  beforeEach(() => {
    mockNotificationRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByUserId: vi.fn(),
      findUnreadByUserId: vi.fn(),
      countUnreadByUserId: vi.fn(),
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
      delete: vi.fn(),
      deleteAllRead: vi.fn(),
    };

    markAsReadUseCase = new MarkAsReadUseCase(mockNotificationRepository);
  });

  it("deve marcar notificação como lida com sucesso", async () => {
    const notificationId = "notification-123";
    const userId = "user-123";

    const mockNotification = {
      id: notificationId,
      userId,
      type: NotificationType.CERTIFICATE_GENERATED,
      title: "Certificado Gerado",
      message: "Parabéns!",
      read: true,
      data: null,
      createdAt: new Date(),
      readAt: new Date(),
    };

    vi.mocked(mockNotificationRepository.markAsRead).mockResolvedValue(
      mockNotification as any
    );

    const result = await markAsReadUseCase.execute({
      id: notificationId,
      userId,
    });

    expect(mockNotificationRepository.markAsRead).toHaveBeenCalledWith(
      notificationId,
      userId
    );
    expect(result.notification).toEqual(mockNotification);
    expect(result.notification.read).toBe(true);
  });

  it("deve lançar erro quando notificação não existe", async () => {
    const notificationId = "notification-not-found";
    const userId = "user-123";

    vi.mocked(mockNotificationRepository.markAsRead).mockRejectedValue(
      new NotificationNotFoundError()
    );

    await expect(
      markAsReadUseCase.execute({
        id: notificationId,
        userId,
      })
    ).rejects.toThrow(NotificationNotFoundError);
  });

  it("deve lançar erro quando notificação não pertence ao usuário", async () => {
    const notificationId = "notification-123";
    const userId = "user-123";
    const otherUserId = "user-456";

    vi.mocked(mockNotificationRepository.markAsRead).mockRejectedValue(
      new NotificationNotFoundError()
    );

    await expect(
      markAsReadUseCase.execute({
        id: notificationId,
        userId: otherUserId,
      })
    ).rejects.toThrow(NotificationNotFoundError);
  });
});
