import { describe, it, expect, beforeEach, vi } from "vitest";
import { CreateNotificationUseCase } from "./create";
import { INotificationRepository } from "../../../repositories/notification-repository";
import { IUsersRepository } from "../../../repositories/users-repository";
import { UserNotFoundError } from "../../errors/user-not-found";
import { NotificationType } from "@prisma/client";

describe("CreateNotificationUseCase", () => {
    let createNotificationUseCase: CreateNotificationUseCase;
    let mockNotificationRepository: INotificationRepository;
    let mockUsersRepository: IUsersRepository;

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

        mockUsersRepository = {
            create: vi.fn(),
            findByEmail: vi.fn(),
            findById: vi.fn(),
            findByIdWithAddress: vi.fn(),
            findAll: vi.fn(),
            findByRole: vi.fn(),
            findByRoles: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        };

        createNotificationUseCase = new CreateNotificationUseCase(
            mockNotificationRepository,
            mockUsersRepository
        );
    });

    it("deve criar uma notificação com sucesso", async () => {
        const userId = "user-123";
        const notificationData = {
            userId,
            type: NotificationType.CERTIFICATE_GENERATED,
            title: "Certificado Gerado! 🎓",
            message: "Parabéns! Você completou o curso.",
            data: { courseId: "course-123" },
        };

        const mockUser = {
            id: userId,
            email: "user@example.com",
            name: "Test User",
        };

        const mockNotification = {
            id: "notification-123",
            ...notificationData,
            read: false,
            createdAt: new Date(),
            readAt: null,
        };

        vi.mocked(mockUsersRepository.findById).mockResolvedValue(mockUser as any);
        vi.mocked(mockNotificationRepository.create).mockResolvedValue(
            mockNotification as any
        );

        const result = await createNotificationUseCase.execute(notificationData);

        expect(mockUsersRepository.findById).toHaveBeenCalledWith(userId);
        expect(mockNotificationRepository.create).toHaveBeenCalledWith({
            userId: notificationData.userId,
            type: notificationData.type,
            title: notificationData.title,
            message: notificationData.message,
            data: notificationData.data,
        });
        expect(result.notification).toEqual(mockNotification);
    });

    it("deve lançar erro quando usuário não existe", async () => {
        const userId = "user-not-found";
        const notificationData = {
            userId,
            type: NotificationType.LEVEL_UP,
            title: "Level Up!",
            message: "Você subiu de nível!",
            data: null,
        };

        vi.mocked(mockUsersRepository.findById).mockResolvedValue(null);

        await expect(
            createNotificationUseCase.execute(notificationData)
        ).rejects.toThrow(UserNotFoundError);

        expect(mockNotificationRepository.create).not.toHaveBeenCalled();
    });

    it("deve criar notificação com data null quando não fornecida", async () => {
        const userId = "user-123";
        const notificationData = {
            userId,
            type: NotificationType.NEW_COURSE_AVAILABLE,
            title: "Novo Curso!",
            message: "Um novo curso está disponível.",
        };

        const mockUser = {
            id: userId,
            email: "user@example.com",
            name: "Test User",
        };

        const mockNotification = {
            id: "notification-123",
            ...notificationData,
            data: null,
            read: false,
            createdAt: new Date(),
            readAt: null,
        };

        vi.mocked(mockUsersRepository.findById).mockResolvedValue(mockUser as any);
        vi.mocked(mockNotificationRepository.create).mockResolvedValue(
            mockNotification as any
        );

        await createNotificationUseCase.execute(notificationData);

        expect(mockNotificationRepository.create).toHaveBeenCalledWith({
            userId: notificationData.userId,
            type: notificationData.type,
            title: notificationData.title,
            message: notificationData.message,
            data: null,
        });
    });
});
