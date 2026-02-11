import { PrismaCertificateRepository } from "../../repositories/prisma/prisma-certificate-repository";
import { GetCertificateByIdUseCase } from "../../use-cases/entities/Certificate/get-by-id";

export function makeGetCertificateByIdUseCase() {
  const certificateRepository = new PrismaCertificateRepository();

  const getCertificateByIdUseCase = new GetCertificateByIdUseCase(
    certificateRepository
  );

  return getCertificateByIdUseCase;
}
