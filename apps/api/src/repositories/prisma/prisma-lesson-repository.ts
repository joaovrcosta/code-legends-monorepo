import { Lesson } from "@prisma/client";
import { ILessonRepository } from "../lesson-repository";
import { prisma } from "../../lib/prisma";

interface CreateLessonData {
  title: string;
  description: string;
  type: string;
  slug: string;
  url?: string;
  isFree?: boolean;
  video_url?: string;
  video_duration?: string;
  locked?: boolean;
  submoduleId: number;
  order?: number;
  authorId: string;
}

interface UpdateLessonData {
  title?: string;
  description?: string;
  type?: string;
  slug?: string;
  url?: string;
  isFree?: boolean;
  video_url?: string;
  video_duration?: string;
  locked?: boolean;
  order?: number;
}

export class PrismaLessonRepository implements ILessonRepository {
  async create(data: CreateLessonData): Promise<Lesson> {
    const lesson = await prisma.lesson.create({
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        slug: data.slug,
        url: data.url,
        isFree: data.isFree ?? false,
        video_url: data.video_url,
        video_duration: data.video_duration,
        locked: data.locked ?? false,
        submoduleId: data.submoduleId,
        order: data.order ?? 0,
        authorId: data.authorId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        submodule: {
          select: {
            id: true,
            title: true,
            moduleId: true,
          },
        },
      },
    });

    return lesson;
  }

  async findAll(groupId?: number): Promise<Lesson[]> {
    const where: any = {};

    if (groupId !== undefined) {
      where.submoduleId = groupId;
    }

    const lessons = await prisma.lesson.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        submodule: {
          select: {
            id: true,
            title: true,
            moduleId: true,
          },
        },
      },
      orderBy: {
        order: "asc",
      },
    });

    return lessons;
  }

  async findById(id: number): Promise<Lesson | null> {
    const lesson = await prisma.lesson.findUnique({
      where: {
        id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            bio: true,
            expertise: true,
          },
        },
        submodule: {
          select: {
            id: true,
            title: true,
            moduleId: true,
            module: {
              select: {
                id: true,
                title: true,
                slug: true,
                courseId: true,
              },
            },
          },
        },
      },
    });

    return lesson;
  }

  async findBySlug(slug: string): Promise<Lesson | null> {
    const lesson = await prisma.lesson.findUnique({
      where: {
        slug,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            bio: true,
            expertise: true,
          },
        },
        submodule: {
          select: {
            id: true,
            title: true,
            moduleId: true,
            module: {
              select: {
                id: true,
                title: true,
                slug: true,
                courseId: true,
              },
            },
          },
        },
      },
    });

    return lesson;
  }

  async findByCourseIdAndSlug(courseId: string, slug: string): Promise<Lesson | null> {
    const lesson = await prisma.lesson.findFirst({
      where: {
        slug,
        submodule: {
          module: {
            courseId,
          },
        },
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            bio: true,
            expertise: true,
          },
        },
        submodule: {
          select: {
            id: true,
            title: true,
            moduleId: true,
            module: {
              select: {
                id: true,
                title: true,
                slug: true,
                courseId: true,
              },
            },
          },
        },
      },
    });

    return lesson;
  }

  async findBySlugAndSubmoduleId(slug: string, submoduleId: number): Promise<Lesson | null> {
    const lesson = await prisma.lesson.findFirst({
      where: {
        slug,
        submoduleId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            bio: true,
            expertise: true,
          },
        },
        submodule: {
          select: {
            id: true,
            title: true,
            moduleId: true,
            module: {
              select: {
                id: true,
                title: true,
                slug: true,
                courseId: true,
              },
            },
          },
        },
      },
    });

    return lesson;
  }

  async update(id: number, data: UpdateLessonData): Promise<Lesson> {
    const lesson = await prisma.lesson.update({
      where: {
        id,
      },
      data,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        submodule: {
          select: {
            id: true,
            title: true,
            moduleId: true,
          },
        },
      },
    });

    return lesson;
  }

  async delete(id: number): Promise<void> {
    await prisma.lesson.delete({
      where: {
        id,
      },
    });
  }
}
