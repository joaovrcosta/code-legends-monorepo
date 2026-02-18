import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeListNotificationsUseCase } from "../../../utils/factories/make-list-notifications-use-case";

export async function list(request: FastifyRequest, reply: FastifyReply) {
  const listNotificationsQuerySchema = z.object({
    read: z
      .string()
      .optional()
      .transform((val) => (val === "true" ? true : val === "false" ? false : undefined)),
    type: z.string().optional(),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : undefined)),
    cursor: z.string().optional(),
  });

  const { read, type, limit, cursor } = listNotificationsQuerySchema.parse(
    request.query
  );

  try {
    const listNotificationsUseCase = makeListNotificationsUseCase();

    const { notifications } = await listNotificationsUseCase.execute({
      userId: request.user.id,
      read,
      ...(type && {
        type: type as "NEW_COURSE_AVAILABLE" | "CERTIFICATE_GENERATED" | "LEVEL_UP" | "REQUEST_STATUS_CHANGED" | "COURSE_COMPLETED" | "NEW_EVENT",
      }),
      limit,
      cursor,
    });

    return reply.status(200).send({ notifications });
  } catch (error) {
    return reply.status(500).send({ message: "Internal server error" });
  }
}
