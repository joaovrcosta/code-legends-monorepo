import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeCreateLessonUseCase } from "../../../utils/factories/make-create-lesson-use-case";
import { LessonAlreadyExistsError } from "../../../use-cases/errors/lesson-already-exists";
import { GroupNotFoundError } from "../../../use-cases/errors/group-not-found";
import { UserNotFoundError } from "../../../use-cases/errors/user-not-found";

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const createLessonParamsSchema = z.object({
    groupId: z.coerce.number(),
  });

  const createLessonBodySchema = z.object({
    title: z.string(),
    description: z.string(),
    type: z.string(),
    slug: z.string(),
    url: z.string().optional(),
    isFree: z.boolean().optional(),
    video_url: z.string().optional(),
    video_duration: z.string().optional(),
    locked: z.boolean().optional(),
    order: z.number().optional(),
  });

  const { groupId } = createLessonParamsSchema.parse(request.params);
  const bodyData = createLessonBodySchema.parse(request.body);

  try {
    const createLessonUseCase = makeCreateLessonUseCase();

    const { lesson } = await createLessonUseCase.execute({
      ...bodyData,
      submoduleId: groupId,
      authorId: request.user.id,
    });

    return reply.status(201).send({ lesson });
  } catch (error) {
    if (error instanceof LessonAlreadyExistsError) {
      return reply.status(409).send({ message: error.message });
    }

    if (error instanceof GroupNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }

    if (error instanceof UserNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }

    return reply.status(500).send({ message: "Internal server error" });
  }
}
