import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeUpdateLessonUseCase } from "../../../utils/factories/make-update-lesson-use-case";
import { LessonNotFoundError } from "../../../use-cases/errors/lesson-not-found";
import { LessonAlreadyExistsError } from "../../../use-cases/errors/lesson-already-exists";
import { InvalidVideoUrlForProviderError } from "../../../use-cases/errors/invalid-video-url-for-provider";
import { VideoProviderNotFoundError } from "../../../use-cases/errors/video-provider-not-found";

export async function update(request: FastifyRequest, reply: FastifyReply) {
  const updateLessonParamsSchema = z.object({
    id: z.coerce.number(),
  });

  const updateLessonBodySchema = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    type: z.enum(["video", "article", "text", "quiz", "multi_quiz", "project"]).optional(),
    slug: z.string().optional(),
    url: z.string().optional(),
    isFree: z.boolean().optional(),
    video_url: z.string().optional(),
    video_duration: z.string().optional(),
    video_provider_id: z.string().cuid().optional(),
    body: z.string().optional(),
    quiz_content: z.array(z.unknown()).optional(),
    project_description: z.string().optional(),
    project_specs: z.unknown().optional(),
    locked: z.boolean().optional(),
    order: z.number().optional(),
  });

  const { id } = updateLessonParamsSchema.parse(request.params);
  const bodyData = updateLessonBodySchema.parse(request.body);

  try {
    const updateLessonUseCase = makeUpdateLessonUseCase();

    const { lesson, videoWarnings } = await updateLessonUseCase.execute({
      id,
      ...bodyData,
    });

    return reply.status(200).send({
      lesson,
      ...(videoWarnings?.length ? { videoWarnings } : {}),
    });
  } catch (error) {
    if (error instanceof LessonNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }

    if (error instanceof LessonAlreadyExistsError) {
      return reply.status(409).send({ message: error.message });
    }

    if (error instanceof InvalidVideoUrlForProviderError) {
      return reply.status(400).send({ message: error.message, details: error.details });
    }

    if (error instanceof VideoProviderNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }

    return reply.status(500).send({ message: "Internal server error" });
  }
}
