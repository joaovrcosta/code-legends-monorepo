import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeUpdateLessonSkillsConfigUseCase } from "../../../utils/factories/make-update-lesson-skills-config-use-case";
import { LessonNotFoundError } from "../../../use-cases/errors/lesson-not-found";
import { LessonSkillAlreadyInCourseError } from "../../../use-cases/errors/lesson-skill-already-in-course";

export async function updateLessonSkillsConfig(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const paramsSchema = z.object({
    id: z.coerce.number(),
  });

  const bodySchema = z.object({
    skills: z
      .array(
        z.object({
          skillId: z.string().cuid(),
          weight: z.number().int().min(0).max(100),
        })
      )
      .default([]),
  });

  const { id: lessonId } = paramsSchema.parse(request.params);
  const { skills } = bodySchema.parse(request.body);

  try {
    const useCase = makeUpdateLessonSkillsConfigUseCase();
    const { skills: updated } = await useCase.execute({ lessonId, skills });
    return reply.status(200).send({ lessonId, skills: updated });
  } catch (error) {
    if (error instanceof LessonNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }
    if (error instanceof LessonSkillAlreadyInCourseError) {
      return reply.status(400).send({
        message: error.message,
        invalidSkillIds: error.invalidSkillIds,
      });
    }
    console.error("Erro ao atualizar configuração de skills da aula:", error);
    return reply.status(500).send({ message: "Internal server error" });
  }
}

