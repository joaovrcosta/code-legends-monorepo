import { describe, it, expect, beforeEach, vi } from "vitest";
import { DeleteNotificationUseCase } from "./delete";
import { INotificationRepository } from "../../../repositories/notification-repository";
import { NotificationNotFoundError } from "../../errors/notification-not-found";

describe("DeleteNotificationUseCase", () => {
  let deleteNotificationUseCase: DeleteNotificationUseCase;
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

    deleteNotificationUseCase = new DeleteNotificationUseCase(
      mockNotificationRepository
    );
  });

  it("deve deletar notificação com sucesso", async () => {
    const notificationId = "notification-123";
    const userId = "user-123";

    vi.mocked(mockNotificationRepository.delete).mockResolvedValue();

    const result = await deleteNotificationUseCase.execute({
      id: notificationId,
      userId,
    });

    expect(mockNotificationRepository.delete).toHaveBeenCalledWith(
      notificationId,
      userId
    );
    expect(result.success).toBe(true);
  });

  it("deve lançar erro quando notificação não existe", async () => {
    const notificationId = "notification-not-found";
    const userId = "user-123";

    vi.mocked(mockNotificationRepository.delete).mockRejectedValue(
      new NotificationNotFoundError()
    );

    await expect(
      deleteNotificationUseCase.execute({
        id: notificationId,
        userId,
      })
    ).rejects.toThrow(NotificationNotFoundError);
  });

  it("deve lançar erro quando notificação não pertence ao usuário", async () => {
    const notificationId = "notification-123";
    const userId = "user-123";
    const otherUserId = "user-456";

    vi.mocked(mockNotificationRepository.delete).mockRejectedValue(
      new NotificationNotFoundError()
    );

    await expect(
      deleteNotificationUseCase.execute({
        id: notificationId,
        userId: otherUserId,
      })
    ).rejects.toThrow(NotificationNotFoundError);
  });
});
