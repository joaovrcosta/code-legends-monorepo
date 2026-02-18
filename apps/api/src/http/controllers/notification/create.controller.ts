import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeCreateNotificationUseCase } from "../../../utils/factories/make-create-notification-use-case";
import { NotificationType } from "@prisma/client";

export async function create(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const createNotificationSchema = z.object({
    userId: z.string().optional(),
    type: z.nativeEnum(NotificationType),
    title: z.string().min(1),
    message: z.string().min(1),
    data: z.record(z.unknown()).optional().nullable(),
  });

  try {
    const body = createNotificationSchema.parse(request.body);
    const currentUserId = request.user.id;
    const isAdmin = request.user.role === "ADMIN";

    // Se não especificar userId, usa o próprio usuário
    // Se especificar userId, só admin pode criar para outros
    const targetUserId = body.userId || currentUserId;

    if (body.userId && body.userId !== currentUserId && !isAdmin) {
      return reply.status(403).send({
        message: "Você só pode criar notificações para si mesmo",
      });
    }

    const createNotificationUseCase = makeCreateNotificationUseCase();

    const { notification } = await createNotificationUseCase.execute({
      userId: targetUserId,
      type: body.type,
      title: body.title,
      message: body.message,
      data: body.data ?? null,
    });

    return reply.status(201).send({ notification });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        message: "Validation error",
        issues: error.format(),
      });
    }

    return reply.status(500).send({ message: "Internal server error" });
  }
}
