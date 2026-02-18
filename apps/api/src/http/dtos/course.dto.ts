import { Course, Category, User } from "@prisma/client";
import type { CourseDTO, CategoryDTO } from "@code-legends/shared-types";
import { toUserPublicDTO } from "./user.dto";

export type { CourseDTO, CategoryDTO } from "@code-legends/shared-types";

export function toCourseDTO(
  course: Course & {
    instructor?: User;
    category?: Category | null;
    tags?: Array<{ name: string }> | string[];
    _count?: {
      userCourses: number;
    };
  },
  totalDuration?: string | null
): CourseDTO {
  // Converter tags da relação para array de strings se necessário
  let tags: string[] = [];
  if (course.tags) {
    if (Array.isArray(course.tags) && course.tags.length > 0) {
      // Se já é array de strings, usar diretamente
      if (typeof course.tags[0] === "string") {
        tags = course.tags as string[];
      } else {
        // Se é array de objetos com name, mapear
        tags = (course.tags as Array<{ name: string }>).map((tag) => tag.name);
      }
    }
  }

  return {
    id: course.id,
    title: course.title,
    slug: course.slug,
    active: course.active,
    thumbnail: course.thumbnail,
    colorHex: course.colorHex,
    createdAt: course.createdAt,
    updatedAt: course.updatedAt,
    releaseAt: course.releaseAt,
    isFree: course.isFree,
    subscriptions: course.subscriptions,
    level: course.level,
    icon: course.icon,
    tags,
    description: course.description,
    instructorId: course.instructorId,
    categoryId: course.categoryId,
    status: (course as any).status || "DRAFT",
    publishedAt: (course as any).publishedAt || null,
    instructor: course.instructor ? toUserPublicDTO(course.instructor) : undefined,
    category: course.category
      ? {
        id: course.category.id,
        name: course.category.name,
        slug: course.category.slug,
        color: course.category.color,
        icon: course.category.icon,
      }
      : null,
    totalDuration: totalDuration ?? null,
    _count: course._count,
  };
}

