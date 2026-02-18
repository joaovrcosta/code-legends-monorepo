import { describe, it, expect, beforeEach, vi } from "vitest";
import { GetUnreadCountUseCase } from "./get-unread-count";
import { INotificationRepository } from "../../../repositories/notification-repository";

describe("GetUnreadCountUseCase", () => {
  let getUnreadCountUseCase: GetUnreadCountUseCase;
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

    getUnreadCountUseCase = new GetUnreadCountUseCase(
      mockNotificationRepository
    );
  });

  it("deve retornar contagem de notificações não lidas", async () => {
    const userId = "user-123";
    const count = 5;

    vi.mocked(mockNotificationRepository.countUnreadByUserId).mockResolvedValue(
      count
    );

    const result = await getUnreadCountUseCase.execute({ userId });

    expect(mockNotificationRepository.countUnreadByUserId).toHaveBeenCalledWith(
      userId
    );
    expect(result.count).toBe(count);
  });

  it("deve retornar zero quando não há notificações não lidas", async () => {
    const userId = "user-123";
    const count = 0;

    vi.mocked(mockNotificationRepository.countUnreadByUserId).mockResolvedValue(
      count
    );

    const result = await getUnreadCountUseCase.execute({ userId });

    expect(result.count).toBe(0);
  });
});
