import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeCreateCertificateUseCase } from "../../../utils/factories/make-create-certificate-use-case";
import { makeCreateCareerCertificateUseCase } from "../../../utils/factories/make-create-career-certificate-use-case";
import { CertificateAlreadyExistsError } from "../../../use-cases/errors/certificate-already-exists";
import { CourseNotFoundError } from "../../../use-cases/errors/course-not-found";
import { UserNotFoundError } from "../../../use-cases/errors/user-not-found";
import { CourseNotCompletedError } from "../../../use-cases/errors/course-not-completed";
import { CareerNotFoundError } from "../../../use-cases/errors/career-not-found";
import { CareerCertificateNotEligibleError } from "../../../use-cases/errors/career-certificate-not-eligible";

const createCertificateBodySchema = z
  .object({
    courseId: z.string().optional(),
    careerId: z.string().optional(),
    templateId: z.string().optional(),
  })
  .refine(
    (d) =>
      Boolean(d.courseId && !d.careerId) || Boolean(!d.courseId && d.careerId),
    { message: "Informe exatamente um de: courseId ou careerId" }
  );

export async function createCertificate(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const parsed = createCertificateBodySchema.parse(request.body);
  const { courseId, careerId, templateId } = parsed;

  try {
    if (careerId) {
      const useCase = makeCreateCareerCertificateUseCase();
      const { certificate } = await useCase.execute({
        userId: request.user.id,
        careerId,
        templateId,
      });
      return reply.status(201).send({ certificate });
    }

    const createCertificateUseCase = makeCreateCertificateUseCase();
    const { certificate } = await createCertificateUseCase.execute({
      userId: request.user.id,
      courseId: courseId!,
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

    if (error instanceof CareerCertificateNotEligibleError) {
      return reply.status(400).send({ message: error.message });
    }

    if (error instanceof CourseNotFoundError || error instanceof CareerNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }

    if (error instanceof UserNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }

    return reply.status(500).send({ message: "Internal server error" });
  }
}
