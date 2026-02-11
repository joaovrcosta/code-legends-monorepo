import { Certificate, Prisma } from "@prisma/client";
import { CertificateRepository } from "../certificate-repository";
import { prisma } from "../../lib/prisma";

export class PrismaCertificateRepository implements CertificateRepository {
  async create(data: Prisma.CertificateCreateInput): Promise<Certificate> {
    const certificate = await prisma.certificate.create({
      data,
      include: {
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
            thumbnail: true,
          },
        },
        template: true,
      },
    });

    return certificate;
  }

  async findById(id: string): Promise<Certificate | null> {
    const certificate = await prisma.certificate.findUnique({
      where: { id },
      include: {
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
        template: true,
      },
    });

    return certificate;
  }

  async findByUserId(userId: string): Promise<Certificate[]> {
    const certificates = await prisma.certificate.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnail: true,
            instructor: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
        template: true,
      },
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
      include: {
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
            thumbnail: true,
            instructor: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
        template: true,
      },
    });

    return certificate;
  }

  async delete(id: string): Promise<void> {
    await prisma.certificate.delete({
      where: { id },
    });
  }
}

