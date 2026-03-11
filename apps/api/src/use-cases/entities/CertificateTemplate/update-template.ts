import { CertificateTemplate } from "@prisma/client";
import { CertificateTemplateRepository } from "../../../repositories/certificate-template-repository";

interface UpdateCertificateTemplateRequest {
  id: string;
  name?: string;
  description?: string;
}

interface UpdateCertificateTemplateResponse {
  template: CertificateTemplate;
}

export class UpdateCertificateTemplateUseCase {
  constructor(private templatesRepository: CertificateTemplateRepository) {}

  async execute({
    id,
    name,
    description,
  }: UpdateCertificateTemplateRequest): Promise<UpdateCertificateTemplateResponse> {
    const existing = await this.templatesRepository.findById(id);
    if (!existing) {
      throw new Error("Template not found.");
    }

    const template = await this.templatesRepository.update(id, {
      name,
      description,
    });

    return {
      template,
    };
  }
}
