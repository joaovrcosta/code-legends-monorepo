import { CertificateTemplate, Prisma } from "@prisma/client";
import { CertificateTemplateRepository } from "../certificate-template-repository";
import { prisma } from "../../lib/prisma";
import { DEFAULT_CERTIFICATE_TEMPLATE_ID } from "../../constants/default-certificate-template";

export class PrismaCertificateTemplateRepository implements CertificateTemplateRepository {
  async create(data: Prisma.CertificateTemplateCreateInput): Promise<CertificateTemplate> {
    return prisma.certificateTemplate.create({ data });
  }

  async update(id: string, data: Prisma.CertificateTemplateUpdateInput): Promise<CertificateTemplate> {
    return prisma.certificateTemplate.update({
      where: { id },
      data,
    });
  }

  async findById(id: string): Promise<CertificateTemplate | null> {
    return prisma.certificateTemplate.findUnique({
      where: { id },
    });
  }

  async findDefault(): Promise<CertificateTemplate | null> {
    const preferred = await prisma.certificateTemplate.findUnique({
      where: { id: DEFAULT_CERTIFICATE_TEMPLATE_ID },
    });
    if (preferred) return preferred;
    return prisma.certificateTemplate.findFirst({
      orderBy: { createdAt: "asc" },
    });
  }

  async listAll(): Promise<CertificateTemplate[]> {
    return prisma.certificateTemplate.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.certificateTemplate.delete({
      where: { id },
    });
  }
}
