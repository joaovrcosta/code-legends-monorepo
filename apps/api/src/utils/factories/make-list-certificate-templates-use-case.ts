import { ListCertificateTemplatesUseCase } from "../../use-cases/entities/CertificateTemplate/list-templates";
import { PrismaCertificateTemplateRepository } from "../../repositories/prisma/prisma-certificate-template-repository";

export function makeListCertificateTemplatesUseCase() {
  const certificateTemplateRepository = new PrismaCertificateTemplateRepository();
  const useCase = new ListCertificateTemplatesUseCase(certificateTemplateRepository);

  return useCase;
}
