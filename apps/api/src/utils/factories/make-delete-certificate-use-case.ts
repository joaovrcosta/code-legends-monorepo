import { PrismaCertificateRepository } from "../../repositories/prisma/prisma-certificate-repository";
import { DeleteCertificateUseCase } from "../../use-cases/entities/Certificate/delete";

export function makeDeleteCertificateUseCase() {
  const certificateRepository = new PrismaCertificateRepository();

  const deleteCertificateUseCase = new DeleteCertificateUseCase(
    certificateRepository
  );

  return deleteCertificateUseCase;
}
