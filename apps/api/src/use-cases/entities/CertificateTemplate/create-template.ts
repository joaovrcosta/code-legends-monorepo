import { CertificateTemplate } from "@prisma/client";
import { CertificateTemplateRepository } from "../../../repositories/certificate-template-repository";

interface CreateCertificateTemplateRequest {
  name: string;
  description: string;
}

interface CreateCertificateTemplateResponse {
  template: CertificateTemplate;
}

export class CreateCertificateTemplateUseCase {
  constructor(private templatesRepository: CertificateTemplateRepository) {}

  async execute({
    name,
    description,
  }: CreateCertificateTemplateRequest): Promise<CreateCertificateTemplateResponse> {
    const template = await this.templatesRepository.create({
      name,
      description,
    });

    return {
      template,
    };
  }
}
