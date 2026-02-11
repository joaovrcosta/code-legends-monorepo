import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeGetCertificateByIdUseCase } from "../../../utils/factories/make-get-certificate-by-id-use-case";
import { CertificateNotFoundError } from "../../../use-cases/errors/certificate-not-found";
import { sanitizeCertificate } from "../../utils/sanitize";
import { Role } from "@prisma/client";

export async function getCertificateById(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const getCertificateParamsSchema = z.object({
    id: z.string(),
  });

  const { id } = getCertificateParamsSchema.parse(request.params);

  try {
    const getCertificateByIdUseCase = makeGetCertificateByIdUseCase();

    const { certificate } = await getCertificateByIdUseCase.execute({
      certificateId: id,
    });

    // Sanitizar resposta para prevenir data leaks
    // O middleware verifyOwnership já garantiu que o usuário é o dono ou admin
    const isOwner = certificate.userId === request.user.id;
    const isAdmin = request.user.role === Role.ADMIN;

    const sanitized = sanitizeCertificate(certificate, {
      requestingUserId: request.user.id,
      requestingUserRole: request.user.role as Role,
      isOwner,
      isAdmin,
    });

    return reply.status(200).send({
      certificate: sanitized,
    });
  } catch (error) {
    if (error instanceof CertificateNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }

    return reply.status(500).send({ message: "Internal server error" });
  }
}
