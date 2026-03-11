import { Certificate, Prisma } from "@prisma/client";

export interface CertificateRepository {
  create(data: Prisma.CertificateCreateInput): Promise<Certificate>;
  findById(id: string): Promise<Certificate | null>;
  findByUserId(userId: string): Promise<Certificate[]>;
  findByUserIdAndCourseId(userId: string, courseId: string): Promise<Certificate | null>;
  listAll(page: number, limit: number): Promise<{ certificates: Certificate[]; total: number }>;
  delete(id: string): Promise<void>;
}

