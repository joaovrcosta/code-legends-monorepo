import { FastifyReply, FastifyRequest } from "fastify";
import { makeGetGamificationSettingsUseCase } from "../../../use-cases/factories/make-get-gamification-settings-use-case";

export async function getGamificationSettings(request: FastifyRequest, reply: FastifyReply) {
  const useCase = makeGetGamificationSettingsUseCase();
  const { settings } = await useCase.execute();

  return reply.status(200).send({ settings });
}
