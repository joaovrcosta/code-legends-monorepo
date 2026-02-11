import { Group } from "@prisma/client";
import { IGroupRepository } from "../group-repository";
import { prisma } from "../../lib/prisma";

interface CreateGroupData {
  title: string;
  moduleId: string;
}

interface UpdateGroupData {
  title?: string;
}

export class PrismaGroupRepository implements IGroupRepository {
  async create(data: CreateGroupData): Promise<Group> {
    const group = await prisma.group.create({
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

  async findAll(moduleId?: string): Promise<Group[]> {
    const where: any = {};

    if (moduleId) {
      where.moduleId = moduleId;
    }

    const groups = await prisma.group.findMany({
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

  async findById(id: number): Promise<Group | null> {
    const group = await prisma.group.findUnique({
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
  ): Promise<Group | null> {
    const group = await prisma.group.findFirst({
      where: {
        title,
        moduleId,
      },
    });

    return group;
  }

  async update(id: number, data: UpdateGroupData): Promise<Group> {
    const group = await prisma.group.update({
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
    await prisma.group.delete({
      where: {
        id,
      },
    });
  }
}
