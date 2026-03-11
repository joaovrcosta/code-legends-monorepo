import { UpdateCertificateTemplateUseCase } from "../../use-cases/entities/CertificateTemplate/update-template";
import { PrismaCertificateTemplateRepository } from "../../repositories/prisma/prisma-certificate-template-repository";

export function makeUpdateCertificateTemplateUseCase() {
  const certificateTemplateRepository = new PrismaCertificateTemplateRepository();
  const useCase = new UpdateCertificateTemplateUseCase(certificateTemplateRepository);

  return useCase;
}
