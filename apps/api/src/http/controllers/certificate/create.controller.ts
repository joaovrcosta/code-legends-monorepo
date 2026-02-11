import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeCreateCertificateUseCase } from "../../../utils/factories/make-create-certificate-use-case";
import { CertificateAlreadyExistsError } from "../../../use-cases/errors/certificate-already-exists";
import { CourseNotFoundError } from "../../../use-cases/errors/course-not-found";
import { UserNotFoundError } from "../../../use-cases/errors/user-not-found";
import { CourseNotCompletedError } from "../../../use-cases/errors/course-not-completed";

export async function createCertificate(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const createCertificateBodySchema = z.object({
    courseId: z.string(),
    templateId: z.string().optional(),
  });

  const { courseId, templateId } = createCertificateBodySchema.parse(
    request.body
  );

  try {
    const createCertificateUseCase = makeCreateCertificateUseCase();

    const { certificate } = await createCertificateUseCase.execute({
      userId: request.user.id,
      courseId,
      templateId,
    });

    return reply.status(201).send({
      certificate,
    });
  } catch (error) {
    if (error instanceof CertificateAlreadyExistsError) {
      return reply.status(409).send({ message: error.message });
    }

    if (error instanceof CourseNotCompletedError) {
      return reply.status(400).send({ message: error.message });
    }

    if (error instanceof CourseNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }

    if (error instanceof UserNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }

    return reply.status(500).send({ message: "Internal server error" });
  }
}
