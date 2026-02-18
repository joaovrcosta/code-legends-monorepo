import { NotificationType, Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { sseManager } from "./sse-manager";
import { makeGetUnreadCountUseCase } from "./factories/make-get-unread-count-use-case";

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown> | null;
  tx?: Omit<
    PrismaClient,
    | "$connect"
    | "$disconnect"
    | "$on"
    | "$transaction"
    | "$use"
    | "$extends"
  >;
}

/**
 * Helper function para criar notificações de forma segura
 * Não quebra o fluxo principal se a criação falhar
 * Suporta transações do Prisma para atomicidade
 */
export async function createNotification(
  params: CreateNotificationParams
): Promise<void> {
  try {
    const client = params.tx || prisma;

    await client.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        data: params.data ?? null,
      },
    });

    // Enviar atualização via SSE se o cliente estiver conectado
    try {
      const getUnreadCountUseCase = makeGetUnreadCountUseCase();
      const { count } = await getUnreadCountUseCase.execute({
        userId: params.userId,
      });
      
      sseManager.sendToUser(params.userId, "notification", {
        count,
        type: "new_notification",
      });
    } catch (sseError) {
      // Falha no SSE não deve quebrar o fluxo
      // Cliente pode não estar conectado, o que é normal
    }
  } catch (error) {
    // Log do erro mas não quebra o fluxo principal
    console.error("Erro ao criar notificação:", {
      userId: params.userId,
      type: params.type,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * Helper function para criar múltiplas notificações em lote
 * Útil para notificar todos os usuários sobre um novo curso
 */
export async function createNotificationsBatch(
  notifications: CreateNotificationParams[]
): Promise<void> {
  if (notifications.length === 0) {
    return;
  }

  try {
    // Dividir em chunks para evitar sobrecarga
    const chunkSize = 100;
    for (let i = 0; i < notifications.length; i += chunkSize) {
      const chunk = notifications.slice(i, i + chunkSize);

      await prisma.notification.createMany({
        data: chunk.map((n) => ({
          userId: n.userId,
          type: n.type,
          title: n.title,
          message: n.message,
          data: n.data ?? null,
        })),
        skipDuplicates: true,
      });
    }

    // Enviar atualizações SSE apenas para usuários conectados
    // Agrupar por userId para evitar queries duplicadas
    const uniqueUserIds = [...new Set(notifications.map(n => n.userId))];
    
    // Processar em background para não bloquear
    setImmediate(async () => {
      const getUnreadCountUseCase = makeGetUnreadCountUseCase();
      
      for (const userId of uniqueUserIds) {
        try {
          const { count } = await getUnreadCountUseCase.execute({ userId });
          sseManager.sendToUser(userId, "notification", {
            count,
            type: "new_notification",
          });
        } catch (sseError) {
          // Ignorar erros - usuário pode não estar conectado
        }
      }
    });
  } catch (error) {
    // Log do erro mas não quebra o fluxo principal
    console.error("Erro ao criar notificações em lote:", {
      count: notifications.length,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
