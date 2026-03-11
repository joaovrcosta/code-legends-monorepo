import { ListAllCertificatesUseCase } from "../../use-cases/entities/Certificate/list-all";
import { PrismaCertificateRepository } from "../../repositories/prisma/prisma-certificate-repository";

export function makeListAllCertificatesUseCase() {
  const certificateRepository = new PrismaCertificateRepository();
  const useCase = new ListAllCertificatesUseCase(certificateRepository);

  return useCase;
}
