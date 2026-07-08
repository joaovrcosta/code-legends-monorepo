import { Certificate, Prisma } from "@prisma/client";
import { CertificateRepository } from "../certificate-repository";
import { prisma } from "../../lib/prisma";

const careerListSelect = {
  id: true,
  title: true,
  slug: true,
  icon: true,
} as const;

const certificateInclude = {
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
    },
  },
  course: {
    select: {
      id: true,
      title: true,
      slug: true,
      icon: true,
      thumbnail: true,
      instructorId: true,
      instructor: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
  },
  career: {
    select: careerListSelect,
  },
  template: true,
} as const;

export class PrismaCertificateRepository implements CertificateRepository {
  async create(data: Prisma.CertificateCreateInput): Promise<Certificate> {
    const certificate = await prisma.certificate.create({
      data,
      include: certificateInclude,
    });

    return certificate;
  }

  async findById(id: string): Promise<Certificate | null> {
    const certificate = await prisma.certificate.findUnique({
      where: { id },
      include: certificateInclude,
    });

    return certificate;
  }

  async findByUserId(userId: string): Promise<Certificate[]> {
    const certificates = await prisma.certificate.findMany({
      where: { userId },
      include: certificateInclude,
      orderBy: {
        createdAt: "desc",
      },
    });

    return certificates;
  }

  async findByUserIdAndCourseId(
    userId: string,
    courseId: string
  ): Promise<Certificate | null> {
    const certificate = await prisma.certificate.findFirst({
      where: {
        userId,
        courseId,
      },
      include: certificateInclude,
    });

    return certificate;
  }

  async findByUserIdAndCareerId(
    userId: string,
    careerId: string
  ): Promise<Certificate | null> {
    const certificate = await prisma.certificate.findFirst({
      where: {
        userId,
        careerId,
      },
      include: certificateInclude,
    });

    return certificate;
  }

  async listAll(page: number, limit: number): Promise<{ certificates: Certificate[]; total: number }> {
    const skip = (page - 1) * limit;
    const [total, certificates] = await Promise.all([
      prisma.certificate.count(),
      prisma.certificate.findMany({
        skip,
        take: limit,
        include: {
          user: { select: { id: true, name: true, email: true, avatar: true } },
          course: { select: { id: true, title: true, slug: true } },
          career: { select: careerListSelect },
          template: true,
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);
    return { certificates, total };
  }

  async delete(id: string): Promise<void> {
    await prisma.certificate.delete({
      where: { id },
    });
  }
}
