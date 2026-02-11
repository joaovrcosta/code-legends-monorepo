import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeDeleteCertificateUseCase } from "../../../utils/factories/make-delete-certificate-use-case";
import { CertificateNotFoundError } from "../../../use-cases/errors/certificate-not-found";

export async function deleteCertificate(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const deleteCertificateParamsSchema = z.object({
    id: z.string(),
  });

  const { id } = deleteCertificateParamsSchema.parse(request.params);

  try {
    const deleteCertificateUseCase = makeDeleteCertificateUseCase();

    await deleteCertificateUseCase.execute({
      certificateId: id,
    });

    return reply.status(204).send();
  } catch (error) {
    if (error instanceof CertificateNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }

    return reply.status(500).send({ message: "Internal server error" });
  }
}
