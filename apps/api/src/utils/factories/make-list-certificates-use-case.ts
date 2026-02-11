import { PrismaCertificateRepository } from "../../repositories/prisma/prisma-certificate-repository";
import { ListCertificatesUseCase } from "../../use-cases/entities/Certificate/list";

export function makeListCertificatesUseCase() {
  const certificateRepository = new PrismaCertificateRepository();

  const listCertificatesUseCase = new ListCertificatesUseCase(
    certificateRepository
  );

  return listCertificatesUseCase;
}
