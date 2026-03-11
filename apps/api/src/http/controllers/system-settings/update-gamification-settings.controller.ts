import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeUpdateGamificationSettingsUseCase } from "../../../use-cases/factories/make-update-gamification-settings-use-case";

export async function updateGamificationSettings(request: FastifyRequest, reply: FastifyReply) {
  const bodySchema = z.object({
    xpPerLesson: z.number().int().min(0).optional(),
    xpPerProject: z.number().int().min(0).optional(),
    xpQuizMultiplier: z.number().min(0).optional(),
  });

  const { xpPerLesson, xpPerProject, xpQuizMultiplier } = bodySchema.parse(request.body);

  const useCase = makeUpdateGamificationSettingsUseCase();
  const { settings } = await useCase.execute({
    xpPerLesson,
    xpPerProject,
    xpQuizMultiplier,
  });

  return reply.status(200).send({ settings });
}
