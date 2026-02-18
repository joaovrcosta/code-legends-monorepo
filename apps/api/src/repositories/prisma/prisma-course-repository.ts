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
  includeDrafts?: boolean;
}

export class PrismaCourseRepository implements ICourseRepository {
  async create(data: CreateCourseData): Promise<Course> {
    const courseData: any = {
      title: data.title,
      slug: data.slug,
      description: data.description,
      level: data.level,
      instructorId: data.instructorId,
      categoryId: data.categoryId ?? null,
      thumbnail: data.thumbnail ?? null,
      icon: data.icon ?? null,
      colorHex: data.colorHex ?? null,
      isFree: data.isFree ?? false,
      active: data.active ?? true,
      releaseAt: data.releaseAt ?? null,
      status: "DRAFT",
    };

    // Se houver tags, conecta ou cria elas
    if (data.tags && data.tags.length > 0) {
      courseData.tags = {
        connectOrCreate: data.tags.map((tagName) => ({
          where: { name: tagName },
          create: { name: tagName },
        })),
      };
    }

    const course = await prisma.course.create({
      data: courseData,
    });

    return course;
  }

  async findAll(filters?: FindAllFilters): Promise<Course[]> {
    const where: any = {
      active: true,
    };

    // Filtrar por status: apenas PUBLISHED, exceto se includeDrafts for true (para admin)
    if (!filters?.includeDrafts) {
      where.status = "PUBLISHED";
    }

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
        tags: {
          select: {
            name: true,
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

    // Converter tags da relação para array de strings
    return courses.map((course) => ({
      ...course,
      tags: course.tags.map((tag) => tag.name),
    })) as Course[];
  }

  async findRecent(limit: number = 10): Promise<Course[]> {
    const courses = await prisma.course.findMany({
      where: {
        active: true,
        status: "PUBLISHED",
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
        status: "PUBLISHED",
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
        tags: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!course) {
      return null;
    }

    // Converter tags da relação para array de strings
    return {
      ...course,
      tags: course.tags.map((tag) => tag.name),
    } as Course;
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
        tags: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!course) {
      return null;
    }

    // Converter tags da relação para array de strings
    return {
      ...course,
      tags: course.tags.map((tag) => tag.name),
    } as Course;
  }

  async searchByName(name: string): Promise<Course[]> {
    const courses = await prisma.course.findMany({
      where: {
        active: true,
        status: "PUBLISHED",
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
    const updateData: any = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.level !== undefined) updateData.level = data.level;
    if (data.isFree !== undefined) updateData.isFree = data.isFree;
    if (data.active !== undefined) updateData.active = data.active;

    if (data.categoryId !== undefined) {
      updateData.categoryId = data.categoryId;
    }
    if (data.thumbnail !== undefined) {
      updateData.thumbnail = data.thumbnail;
    }
    if (data.icon !== undefined) {
      updateData.icon = data.icon;
    }
    if (data.colorHex !== undefined) {
      updateData.colorHex = data.colorHex;
    }
    if (data.releaseAt !== undefined) {
      updateData.releaseAt = data.releaseAt;
    }


    if (data.tags !== undefined) {
      if (data.tags.length === 0) {
        updateData.tags = {
          set: [],
        };
      } else {
        const tagIds = await Promise.all(
          data.tags.map(async (tagName) => {
            const existingTag = await prisma.tag.findUnique({
              where: { name: tagName },
            });
            if (existingTag) {
              return existingTag.id;
            }
            const newTag = await prisma.tag.create({
              data: { name: tagName },
            });
            return newTag.id;
          })
        );
        updateData.tags = {
          set: tagIds.map((id) => ({ id })),
        };
      }
    }

    const course = await prisma.course.update({
      where: {
        id,
      },
      data: updateData,
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

  async publish(id: string): Promise<Course> {
    const course = await prisma.course.update({
      where: { id },
      data: {
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    });

    return course;
  }

  async unpublish(id: string): Promise<Course> {
    const course = await prisma.course.update({
      where: { id },
      data: {
        status: "DRAFT",
        publishedAt: null,
      },
    });

    return course;
  }
}
