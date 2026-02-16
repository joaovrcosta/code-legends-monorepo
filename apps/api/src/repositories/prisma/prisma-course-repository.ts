import { Course } from "@prisma/client";
import { ICourseRepository } from "../course-repository";
import { prisma } from "../../lib/prisma";

interface CreateCourseData {
  title: string;
  slug: string;
  description: string;
  level: string;
  instructorId: string;
  categoryId?: string | null;
  thumbnail?: string | null;
  icon?: string | null;
  colorHex?: string | null;
  tags?: string[];
  isFree?: boolean;
  active?: boolean;
  releaseAt?: Date | null;
}

interface UpdateCourseData {
  title?: string;
  slug?: string;
  description?: string;
  level?: string;
  categoryId?: string | null;
  thumbnail?: string | null;
  icon?: string | null;
  colorHex?: string | null;
  tags?: string[];
  isFree?: boolean;
  active?: boolean;
  releaseAt?: Date | null;
}

interface FindAllFilters {
  categoryId?: string;
  instructorId?: string;
  search?: string;
}

export class PrismaCourseRepository implements ICourseRepository {
  async create(data: CreateCourseData): Promise<Course> {
    const course = await prisma.course.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        level: data.level,
        instructorId: data.instructorId,
        categoryId: data.categoryId ?? null,
        thumbnail: data.thumbnail ?? null,
        icon: data.icon ?? null,
        colorHex: data.colorHex ?? null,
        tags: data.tags ?? [],
        isFree: data.isFree ?? false,
        active: data.active ?? true,
        releaseAt: data.releaseAt ?? null,
      },
    });

    return course;
  }

  async findAll(filters?: FindAllFilters): Promise<Course[]> {
    const where: any = {
      active: true,
    };

    // Filtro por categoria
    if (filters?.categoryId) {
      where.categoryId = filters.categoryId;
    }

    // Filtro por instrutor
    if (filters?.instructorId) {
      where.instructorId = filters.instructorId;
    }

    // Busca por título ou descrição
    if (filters?.search) {
      where.OR = [
        {
          title: {
            contains: filters.search,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: filters.search,
            mode: "insensitive",
          },
        },
        {
          tags: {
            has: filters.search.toLowerCase(),
          },
        },
      ];
    }

    const courses = await prisma.course.findMany({
      where,
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            avatar: true,
            slug: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
            icon: true,
          },
        },
        _count: {
          select: {
            userCourses: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return courses;
  }

  async findRecent(limit: number = 10): Promise<Course[]> {
    const courses = await prisma.course.findMany({
      where: {
        active: true,
      },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            avatar: true,
            slug: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
            icon: true,
          },
        },
        _count: {
          select: {
            userCourses: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    return courses;
  }

  async findPopular(limit: number = 10): Promise<Course[]> {
    const courses = await prisma.course.findMany({
      where: {
        active: true,
      },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            avatar: true,
            slug: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
            icon: true,
          },
        },
        _count: {
          select: {
            userCourses: true,
          },
        },
      },
      orderBy: {
        userCourses: {
          _count: "desc",
        },
      },
      take: limit,
    });

    return courses;
  }

  async findById(id: string): Promise<Course | null> {
    const course = await prisma.course.findUnique({
      where: {
        id,
      },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            avatar: true,
            slug: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
            icon: true,
          },
        },
      },
    });

    return course;
  }

  async findBySlug(slug: string): Promise<Course | null> {
    const course = await prisma.course.findUnique({
      where: {
        slug,
      },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            avatar: true,
            slug: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
            icon: true,
          },
        },
      },
    });

    return course;
  }

  async searchByName(name: string): Promise<Course[]> {
    const courses = await prisma.course.findMany({
      where: {
        active: true,
        title: {
          contains: name,
          mode: "insensitive",
        },
      },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            avatar: true,
            slug: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
            icon: true,
          },
        },
        _count: {
          select: {
            userCourses: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return courses;
  }

  async update(id: string, data: UpdateCourseData): Promise<Course> {
    const course = await prisma.course.update({
      where: {
        id,
      },
      data,
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            avatar: true,
            slug: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
            icon: true,
          },
        },
      },
    });

    return course;
  }

  async delete(id: string): Promise<void> {
    await prisma.course.delete({
      where: {
        id,
      },
    });
  }
}
