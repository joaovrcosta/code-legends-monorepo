import { CertificateTemplate } from "@prisma/client";
import { CertificateTemplateRepository } from "../../../repositories/certificate-template-repository";

interface ListCertificateTemplatesResponse {
  templates: CertificateTemplate[];
}

export class ListCertificateTemplatesUseCase {
  constructor(private templatesRepository: CertificateTemplateRepository) {}

  async execute(): Promise<ListCertificateTemplatesResponse> {
    const templates = await this.templatesRepository.listAll();
    return { templates };
  }
}
