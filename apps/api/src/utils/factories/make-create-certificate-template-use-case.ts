import { CreateCertificateTemplateUseCase } from "../../use-cases/entities/CertificateTemplate/create-template";
import { PrismaCertificateTemplateRepository } from "../../repositories/prisma/prisma-certificate-template-repository";

export function makeCreateCertificateTemplateUseCase() {
  const certificateTemplateRepository = new PrismaCertificateTemplateRepository();
  const useCase = new CreateCertificateTemplateUseCase(certificateTemplateRepository);

  return useCase;
}
