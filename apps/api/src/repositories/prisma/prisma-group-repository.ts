import { Submodule } from "@prisma/client";
import { IGroupRepository } from "../group-repository";
import { prisma } from "../../lib/prisma";

interface CreateGroupData {
  title: string;
  moduleId: string;
}

interface UpdateGroupData {
  title?: string;
  orderIndex?: number;
}

export class PrismaGroupRepository implements IGroupRepository {
  async create(data: CreateGroupData): Promise<Submodule> {
    const group = await prisma.submodule.create({
      data: {
        title: data.title,
        moduleId: data.moduleId,
      },
      include: {
        module: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        _count: {
          select: {
            lessons: true,
          },
        },
      },
    });

    return group;
  }

  async findAll(moduleId?: string): Promise<Submodule[]> {
    const where: any = {};

    if (moduleId) {
      where.moduleId = moduleId;
    }

    const groups = await prisma.submodule.findMany({
      where,
      include: {
        module: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        _count: {
          select: {
            lessons: true,
          },
        },
      },
      orderBy: {
        id: "asc",
      },
    });

    return groups;
  }

  async findById(id: number): Promise<Submodule | null> {
    const group = await prisma.submodule.findUnique({
      where: {
        id,
      },
      include: {
        module: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        lessons: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    return group;
  }

  async findByTitleAndModuleId(
    title: string,
    moduleId: string
  ): Promise<Submodule | null> {
    const group = await prisma.submodule.findFirst({
      where: {
        title,
        moduleId,
      },
    });

    return group;
  }

  async update(id: number, data: UpdateGroupData): Promise<Submodule> {
    const group = await prisma.submodule.update({
      where: {
        id,
      },
      data,
      include: {
        module: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        _count: {
          select: {
            lessons: true,
          },
        },
      },
    });

    return group;
  }

  async delete(id: number): Promise<void> {
    await prisma.submodule.delete({
      where: {
        id,
      },
    });
  }
}
