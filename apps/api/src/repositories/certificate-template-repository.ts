import { CertificateTemplate, Prisma } from "@prisma/client";

export interface CertificateTemplateRepository {
  create(data: Prisma.CertificateTemplateCreateInput): Promise<CertificateTemplate>;
  update(id: string, data: Prisma.CertificateTemplateUpdateInput): Promise<CertificateTemplate>;
  findById(id: string): Promise<CertificateTemplate | null>;
  listAll(): Promise<CertificateTemplate[]>;
  delete(id: string): Promise<void>;
}
