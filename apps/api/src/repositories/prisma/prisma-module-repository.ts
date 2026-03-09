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
            submodules: true,
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
            submodules: true,
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
        submodules: {
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
    const module = await prisma.module.findFirst({
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
        submodules: {
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
        submodules: {
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
            submodules: true,
          },
        },
      },
    });

    return module;
  }

  async delete(id: string): Promise<void> {
    const submodules = await prisma.submodule.findMany({
      where: { moduleId: id },
      select: { id: true },
    });
    const submoduleIds = submodules.map((s) => s.id);
    if (submoduleIds.length > 0) {
      await prisma.lesson.deleteMany({
        where: { submoduleId: { in: submoduleIds } },
      });
    }
    await prisma.submodule.deleteMany({
      where: { moduleId: id },
    });
    await prisma.module.delete({
      where: { id },
    });
  }
}
