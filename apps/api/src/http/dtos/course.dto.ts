import { Course, Category, User } from "@prisma/client";
import type { CourseDTO, CategoryDTO } from "@code-legends/shared-types";
import { toUserPublicDTO } from "./user.dto";

export type { CourseDTO, CategoryDTO } from "@code-legends/shared-types";

export function toCourseDTO(
  course: Course & {
    instructor?: User;
    category?: Category | null;
    _count?: {
      userCourses: number;
    };
  }
): CourseDTO {
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
    tags: course.tags,
    description: course.description,
    instructorId: course.instructorId,
    categoryId: course.categoryId,
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
    _count: course._count,
  };
}

