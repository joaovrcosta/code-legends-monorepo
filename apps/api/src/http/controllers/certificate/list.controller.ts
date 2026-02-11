import { FastifyReply, FastifyRequest } from "fastify";
import { makeListCertificatesUseCase } from "../../../utils/factories/make-list-certificates-use-case";
import { sanitizeCertificate } from "../../utils/sanitize";
import { Role } from "@prisma/client";

export async function listCertificates(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const listCertificatesUseCase = makeListCertificatesUseCase();

    const { certificates } = await listCertificatesUseCase.execute({
      userId: request.user.id,
    });

    // Sanitizar respostas - usuário está listando seus próprios certificados
    const sanitized = certificates.map((cert) =>
      sanitizeCertificate(cert, {
        requestingUserId: request.user.id,
        requestingUserRole: request.user.role as Role,
        isOwner: true,
        isAdmin: request.user.role === Role.ADMIN,
      })
    );

    return reply.status(200).send({
      certificates: sanitized,
    });
  } catch (error) {
    return reply.status(500).send({ message: "Internal server error" });
  }
}
