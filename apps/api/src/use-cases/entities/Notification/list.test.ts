import { describe, it, expect, beforeEach, vi } from "vitest";
import { ListNotificationsUseCase } from "./list";
import { INotificationRepository } from "../../../repositories/notification-repository";
import { NotificationType } from "@prisma/client";

describe("ListNotificationsUseCase", () => {
  let listNotificationsUseCase: ListNotificationsUseCase;
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

    listNotificationsUseCase = new ListNotificationsUseCase(
      mockNotificationRepository
    );
  });

  it("deve listar notificações não lidas", async () => {
    const userId = "user-123";
    const mockNotifications = [
      {
        id: "notification-1",
        userId,
        type: NotificationType.CERTIFICATE_GENERATED,
        title: "Certificado Gerado",
        message: "Parabéns!",
        read: false,
        data: null,
        createdAt: new Date(),
        readAt: null,
      },
      {
        id: "notification-2",
        userId,
        type: NotificationType.LEVEL_UP,
        title: "Level Up",
        message: "Você subiu de nível!",
        read: false,
        data: null,
        createdAt: new Date(),
        readAt: null,
      },
    ];

    vi.mocked(mockNotificationRepository.findByUserId).mockResolvedValue(
      mockNotifications as any
    );

    const result = await listNotificationsUseCase.execute({
      userId,
      read: false,
    });

    expect(mockNotificationRepository.findByUserId).toHaveBeenCalledWith(
      userId,
      {
        read: false,
        type: undefined,
        limit: 50,
        cursor: undefined,
      }
    );
    expect(result.notifications).toEqual(mockNotifications);
  });

  it("deve listar notificações lidas", async () => {
    const userId = "user-123";
    const mockNotifications = [
      {
        id: "notification-1",
        userId,
        type: NotificationType.CERTIFICATE_GENERATED,
        title: "Certificado Gerado",
        message: "Parabéns!",
        read: true,
        data: null,
        createdAt: new Date(),
        readAt: new Date(),
      },
    ];

    vi.mocked(mockNotificationRepository.findByUserId).mockResolvedValue(
      mockNotifications as any
    );

    const result = await listNotificationsUseCase.execute({
      userId,
      read: true,
    });

    expect(mockNotificationRepository.findByUserId).toHaveBeenCalledWith(
      userId,
      {
        read: true,
        type: undefined,
        limit: 50,
        cursor: undefined,
      }
    );
    expect(result.notifications).toEqual(mockNotifications);
  });

  it("deve filtrar por tipo de notificação", async () => {
    const userId = "user-123";
    const type = NotificationType.LEVEL_UP;

    vi.mocked(mockNotificationRepository.findByUserId).mockResolvedValue([]);

    await listNotificationsUseCase.execute({
      userId,
      type,
    });

    expect(mockNotificationRepository.findByUserId).toHaveBeenCalledWith(
      userId,
      {
        read: undefined,
        type,
        limit: 50,
        cursor: undefined,
      }
    );
  });

  it("deve usar limite customizado", async () => {
    const userId = "user-123";
    const limit = 10;

    vi.mocked(mockNotificationRepository.findByUserId).mockResolvedValue([]);

    await listNotificationsUseCase.execute({
      userId,
      limit,
    });

    expect(mockNotificationRepository.findByUserId).toHaveBeenCalledWith(
      userId,
      {
        read: undefined,
        type: undefined,
        limit: 10,
        cursor: undefined,
      }
    );
  });

  it("deve usar cursor para paginação", async () => {
    const userId = "user-123";
    const cursor = "notification-123";

    vi.mocked(mockNotificationRepository.findByUserId).mockResolvedValue([]);

    await listNotificationsUseCase.execute({
      userId,
      cursor,
    });

    expect(mockNotificationRepository.findByUserId).toHaveBeenCalledWith(
      userId,
      {
        read: undefined,
        type: undefined,
        limit: 50,
        cursor,
      }
    );
  });
});
