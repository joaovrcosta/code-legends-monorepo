import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeSendBroadcastUseCase } from "../../../use-cases/factories/make-send-broadcast-use-case";

export async function sendBroadcast(request: FastifyRequest, reply: FastifyReply) {
  const bodySchema = z.object({
    title: z.string().min(1),
    message: z.string().min(1),
    type: z.enum([
      "NEW_COURSE_AVAILABLE",
      "CERTIFICATE_GENERATED",
      "LEVEL_UP",
      "REQUEST_STATUS_CHANGED",
      "COURSE_COMPLETED",
      "NEW_EVENT",
    ]),
    targetPlan: z.enum(["FREE", "PRO", "PREMIUM", "ALL"]).optional().default("ALL"),
    data: z.any().optional(),
  });

  const { title, message, type, targetPlan, data } = bodySchema.parse(request.body);

  const useCase = makeSendBroadcastUseCase();
  const { notificationsSent } = await useCase.execute({
    title,
    message,
    type,
    targetPlan: targetPlan as any,
    data,
  });

  return reply.status(200).send({ notificationsSent });
}
