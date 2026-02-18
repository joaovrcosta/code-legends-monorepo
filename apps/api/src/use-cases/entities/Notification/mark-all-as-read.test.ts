import { describe, it, expect, beforeEach, vi } from "vitest";
import { MarkAllAsReadUseCase } from "./mark-all-as-read";
import { INotificationRepository } from "../../../repositories/notification-repository";

describe("MarkAllAsReadUseCase", () => {
  let markAllAsReadUseCase: MarkAllAsReadUseCase;
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

    markAllAsReadUseCase = new MarkAllAsReadUseCase(mockNotificationRepository);
  });

  it("deve marcar todas as notificações como lidas", async () => {
    const userId = "user-123";

    vi.mocked(mockNotificationRepository.markAllAsRead).mockResolvedValue();

    const result = await markAllAsReadUseCase.execute({ userId });

    expect(mockNotificationRepository.markAllAsRead).toHaveBeenCalledWith(
      userId
    );
    expect(result.success).toBe(true);
  });
});
