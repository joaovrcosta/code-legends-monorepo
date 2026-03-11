import { CertificateTemplateRepository } from "../../../repositories/certificate-template-repository";

interface DeleteCertificateTemplateRequest {
  id: string;
}

export class DeleteCertificateTemplateUseCase {
  constructor(private templatesRepository: CertificateTemplateRepository) {}

  async execute({ id }: DeleteCertificateTemplateRequest): Promise<void> {
    const existing = await this.templatesRepository.findById(id);
    if (!existing) {
      throw new Error("Template not found.");
    }
    await this.templatesRepository.delete(id);
  }
}
