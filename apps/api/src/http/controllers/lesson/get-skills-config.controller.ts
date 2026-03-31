import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeGetLessonSkillsConfigUseCase } from "../../../utils/factories/make-get-lesson-skills-config-use-case";
import { LessonNotFoundError } from "../../../use-cases/errors/lesson-not-found";

export async function getLessonSkillsConfig(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const paramsSchema = z.object({
    id: z.coerce.number(),
  });

  const { id: lessonId } = paramsSchema.parse(request.params);

  try {
    const useCase = makeGetLessonSkillsConfigUseCase();
    const { skills } = await useCase.execute(lessonId);
    return reply.status(200).send({ lessonId, skills });
  } catch (error) {
    if (error instanceof LessonNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }
    console.error("Erro ao buscar configuração de skills da aula:", error);
    return reply.status(500).send({ message: "Internal server error" });
  }
}

