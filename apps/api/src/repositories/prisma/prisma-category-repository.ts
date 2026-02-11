import { Category } from "@prisma/client";
import { ICategoryRepository } from "../category-repository";
import { prisma } from "../../lib/prisma";

interface CreateCategoryData {
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  order?: number;
  active?: boolean;
}

interface UpdateCategoryData {
  name?: string;
  slug?: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  order?: number;
  active?: boolean;
}

export class PrismaCategoryRepository implements ICategoryRepository {
  async create(data: CreateCategoryData): Promise<Category> {
    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description ?? null,
        icon: data.icon ?? null,
        color: data.color ?? null,
        order: data.order ?? 0,
        active: data.active ?? true,
      },
    });

    return category;
  }

  async findAll(): Promise<Category[]> {
    const categories = await prisma.category.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
    });

    return categories;
  }

  async findById(id: string): Promise<Category | null> {
    const category = await prisma.category.findUnique({
      where: { id },
    });

    return category;
  }

  async findBySlug(slug: string): Promise<Category | null> {
    const category = await prisma.category.findUnique({
      where: { slug },
    });

    return category;
  }

  async update(id: string, data: UpdateCategoryData): Promise<Category> {
    const category = await prisma.category.update({
      where: { id },
      data,
    });

    return category;
  }

  async delete(id: string): Promise<void> {
    await prisma.category.delete({
      where: { id },
    });
  }
}
