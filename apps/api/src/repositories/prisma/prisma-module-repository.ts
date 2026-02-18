import { Module } from "@prisma/client";
import { IModuleRepository } from "../module-repository";
import { prisma } from "../../lib/prisma";

interface CreateModuleData {
  title: string;
  slug: string;
  courseId: string;
}

interface UpdateModuleData {
  title?: string;
  slug?: string;
}

export class PrismaModuleRepository implements IModuleRepository {
  async create(data: CreateModuleData): Promise<Module> {
    const module = await prisma.module.create({
      data: {
        title: data.title,
        slug: data.slug,
        courseId: data.courseId,
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        _count: {
          select: {
            groups: true,
          },
        },
      },
    });

    return module;
  }

  async findAll(courseId?: string): Promise<Module[]> {
    const where: any = {};

    if (courseId) {
      where.courseId = courseId;
    }

    const modules = await prisma.module.findMany({
      where,
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        _count: {
          select: {
            groups: true,
          },
        },
      },
      orderBy: {
        id: "asc",
      },
    });

    return modules;
  }

  async findById(id: string): Promise<Module | null> {
    const module = await prisma.module.findUnique({
      where: {
        id,
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        groups: {
          include: {
            _count: {
              select: {
                lessons: true,
              },
            },
          },
        },
      },
    });

    return module;
  }

  async findBySlug(slug: string): Promise<Module | null> {
    const module = await prisma.module.findUnique({
      where: {
        slug,
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        groups: {
          include: {
            _count: {
              select: {
                lessons: true,
              },
            },
          },
        },
      },
    });

    return module;
  }

  async findBySlugAndCourseId(slug: string, courseId: string): Promise<Module | null> {
    const module = await prisma.module.findFirst({
      where: {
        slug,
        courseId,
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        groups: {
          include: {
            _count: {
              select: {
                lessons: true,
              },
            },
          },
        },
      },
    });

    return module;
  }

  async update(id: string, data: UpdateModuleData): Promise<Module> {
    const module = await prisma.module.update({
      where: {
        id,
      },
      data,
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        _count: {
          select: {
            groups: true,
          },
        },
      },
    });

    return module;
  }

  async delete(id: string): Promise<void> {
    await prisma.module.delete({
      where: {
        id,
      },
    });
  }
}
