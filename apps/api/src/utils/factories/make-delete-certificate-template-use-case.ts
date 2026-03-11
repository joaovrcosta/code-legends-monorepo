import { DeleteCertificateTemplateUseCase } from "../../use-cases/entities/CertificateTemplate/delete-template";
import { PrismaCertificateTemplateRepository } from "../../repositories/prisma/prisma-certificate-template-repository";

export function makeDeleteCertificateTemplateUseCase() {
  const certificateTemplateRepository = new PrismaCertificateTemplateRepository();
  const useCase = new DeleteCertificateTemplateUseCase(certificateTemplateRepository);

  return useCase;
}
